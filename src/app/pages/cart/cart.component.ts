/**
 * Cart Component - Enhanced with Backend Price Calculations
 *
 * This component now uses the backend calculateOrderSummaryAsGuest API
 * for all price calculations instead of manual frontend calculations.
 *
 * Key changes:
 * - loadUnauthCart(): Calls backend for all items on cart load
 * - increaseUnauthQuantity(): Uses backend calculation
 * - decreaseUnauthQuantity(): Uses backend calculation
 * - updateUnauthQuantity(): Enhanced to support backend calculation
 * - calculateLineTotal(): Kept as fallback only
 *
 * Benefits:
 * - Consistent pricing with backend business logic
 * - Automatic discount calculations from backend
 * - Fallback to manual calculation on API errors
 * - Parallel API calls for better performance (forkJoin)
 */

import { AnimationEvent } from '@angular/animations';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import {
  IAddToCartOrOrder,
  OrderDetail,
} from '@core/interfaces/cart.interfaces';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { AuthStorageService } from '@core/services/auth/auth-storage.service';
import { AuthService } from '@core/services/auth/auth.service';
import { CartStateService } from '@core/services/cart/cart-state.service';
import { OrdersService } from '@core/services/cart/orders.service';
import { LanguageService } from '@core/services/lang/language.service';
import { UserService } from '@core/services/user/user.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AlertService } from '@shared/alert/alert.service';
import { AddressFormModalComponent } from '@shared/components/address-form-modal/address-form-modal.component';
import { CartSkeletonComponent } from '@shared/components/skeleton/cart-skeleton/cart-skeleton.component';
import { IUnauthUser } from '@shared/ts/unauthUser';
import { Observable, forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SafeHtmlComponent } from '../../core/safe-html/safe-html.component';
import { ArticlesHeaderComponent } from '../../pages/articles/components/articles-header/articles-header.component';
import { ServiceCardComponent } from '../about-us/components/service-card/service-card.component';
import { IAboutUsTwo } from '../about-us/res/about-us.interface';
import { AboutUsService } from '../about-us/res/about-us.service';
import { cartItemAnimations } from './cart.animations';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    AsyncPipe,
    ImageUrlDirective,
    CustomTranslatePipe,
    ArticlesHeaderComponent,
    TranslateModule,
    ServiceCardComponent,
    SafeHtmlComponent,
    CartSkeletonComponent,
    AddressFormModalComponent,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
  animations: cartItemAnimations,
})
export class CartComponent implements OnInit {
  _cartState = inject(CartStateService);

  _ordersService = inject(OrdersService);

  _languageService = inject(LanguageService);

  formBuilder = inject(FormBuilder);

  _translateService = inject(TranslateService);

  _alertService = inject(AlertService);

  _aboutUsService = inject(AboutUsService);

  userService = inject(UserService);

  userData = inject(AuthStorageService);
  // Loading state to show loading indicator
  isLoading = true;

  lang: boolean = true;
  // Expose computed signals for template usage
  order = this._cartState.order;

  promoCode = this._cartState.promoCode;

  user = this._cartState.user;

  orderDetails = this._cartState.orderDetails;

  isEmpty = this._cartState.isEmpty;

  currentLang$ = this._languageService.getLanguage();

  isPromoCodeLoading = false;

  orderDetailsUnauth: IUnauthUser[] = [];

  private platformId = inject(PLATFORM_ID);

  // Order summary for unauthenticated users
  unauthOrderSummary = {
    subtotal: 0,
    total: 0,
    itemCount: 0,
  };

  _authService = inject(AuthService);

  // Address form for unauthenticated users
  unauthAddressForm!: FormGroup;
  showAddressFormModal = false;
  isFormSubmitting = signal(false);

  private _userService = inject(UserService);
  private _formBuilder = inject(FormBuilder);
  private _router = inject(Router);
  ngOnInit(): void {
    // Start with loading state
    this.isLoading = true;

    // Fetch discount percentage from API
    this.fetchDiscount();

    if (this._authService.isAuthenticated()) {
      // First check if user has confirmed orders
      this._cartState.checkConfirmedOrders().subscribe();

      // Then fetch the cart
      this._cartState.fetchCart().subscribe({
        next: () => {
          // Once cart data is loaded, disable loading state
          this.isLoading = false;

          // Initialize cart data with animation states
          const cartDetails = this.orderDetails();

          // Set all items to visible animation state
          if (cartDetails && cartDetails.length > 0) {
            this._cartState.setOrderDetails(
              cartDetails.map((item) => ({
                ...item,
                animationState: 'visible',
              }))
            );
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error fetching cart during initialization', err);
        },
      });

      this.getAboutData();
    } else {
      this.isLoading = false;
      this.loadUnauthCart();
      this.getAboutData();
    }

    // Initialize the address form
    this.initUnauthAddressForm();
  }

  /**
   * Add an item to the cart
   */
  addToCart(productId: number, quantity: number = 1, choiceId?: string) {
    const item: IAddToCartOrOrder = {
      product_id: productId,
      quantity: quantity,
      choice_id: choiceId,
    };

    if (choiceId) {
      item.choice_id = choiceId;
    }

    this.isAddingItem = true;
    this.cartUpdateSuccess = null;
    this.removeItemError = null;

    this._cartState.addToCart(item).subscribe({
      next: () => {
        // Set loading state while fetching updated cart
        this.isLoading = true;

        // Refresh both the cart in this component and the count in navbar
        this._cartState.fetchCart().subscribe({
          next: () => {
            this.isLoading = false;
            this.isAddingItem = false;
            this.cartUpdateSuccess = this._translateService.instant(
              'shared.added_to_cart_success'
            );
            setTimeout(() => (this.cartUpdateSuccess = null), 3000);
          },
          error: (err) => {
            this.isLoading = false;
            this.isAddingItem = false;
            console.error('Error fetching cart after adding item', err);
          },
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.isAddingItem = false;
        this.removeItemError = this._translateService.instant(
          'cart.error.add_failed'
        );
        console.error('Error adding item to cart', err);
        setTimeout(() => (this.removeItemError = null), 3000);
      },
    });
  }

  /**
   * Format number to display as currency
   */
  formatPrice(price: string | number | null | undefined): string {
    if (price === null || price === undefined) return '0.00';

    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toFixed(2);
  }

  // Track which item is currently being removed by ID
  removingItemId: string | number | null = null;
  // Track which item is currently being updated by ID
  updatingItemId: string | number | null = null;

  /**
   * Increase item quantity by 1
   */
  increaseQuantity(item: OrderDetail | IUnauthUser): void {
    if (this._authService.isAuthenticated()) {
      this.updateQuantity(
        (item as OrderDetail).product_id,
        (item as OrderDetail).quantity + 1
      );
    } else {
      this.increaseUnauthQuantity(item as IUnauthUser);
    }
  }

  /**
   * Decrease item quantity by 1
   */
  decreaseQuantity(item: OrderDetail | IUnauthUser): void {
    if (this._authService.isAuthenticated()) {
      if ((item as OrderDetail).quantity > 1) {
        this.updateQuantity(
          (item as OrderDetail).product_id,
          (item as OrderDetail).quantity - 1
        );
      } else {
        this.removeItem(item as OrderDetail);
      }
    } else {
      this.decreaseUnauthQuantity(item as IUnauthUser);
    }
  }

  /**
   * Update quantity for unauthenticated users
   */
  updateUnauthQuantity(
    productId: number,
    quantity: number,
    lineTotal?: number
  ): void {
    if (quantity <= 0) {
      // If quantity is 0 or negative, remove the item
      this.removeUnauthItem(
        this.orderDetailsUnauth.find((item) => item.id === productId)!
      );
      return;
    }

    this.isAddingItem = true;
    this.updatingItemId = productId;

    const cartKey = 'orderDetails';
    const cart: IUnauthUser[] = JSON.parse(
      localStorage.getItem(cartKey) || '[]'
    );

    const currentItem = cart.find((item) => item.id === productId);

    if (!currentItem) {
      this.isAddingItem = false;
      this.updatingItemId = null;
      return;
    }

    // If lineTotal is provided, use it directly, otherwise calculate using backend
    if (lineTotal !== undefined) {
      this.updateCartWithLineTotal(
        cartKey,
        cart,
        productId,
        quantity,
        lineTotal
      );
    } else {
      // Use backend calculation
      this.calculateOrderSummaryAsG(
        Number(currentItem.price),
        quantity
      ).subscribe({
        next: (response) => {
          const calculatedLineTotal =
            response.subtotal || Number(currentItem.price) * quantity;
          this.updateCartWithLineTotal(
            cartKey,
            cart,
            productId,
            quantity,
            calculatedLineTotal
          );
        },
        error: (err) => {
          console.error(
            'Error calculating backend total, using fallback:',
            err
          );
          // Fallback to manual calculation
          const fallbackLineTotal = this.calculateLineTotal(
            Number(currentItem.price),
            quantity
          );
          this.updateCartWithLineTotal(
            cartKey,
            cart,
            productId,
            quantity,
            fallbackLineTotal
          );
        },
      });
    }
  }

  /**
   * Helper method to update cart with calculated line total
   */
  private updateCartWithLineTotal(
    cartKey: string,
    cart: IUnauthUser[],
    productId: number,
    quantity: number,
    lineTotal: number
  ): void {
    // Find and update the item
    const updatedCart = cart.map((item) => {
      if (item.id === productId) {
        return {
          ...item,
          quantity,
          lineTotal,
        };
      }
      return item;
    });

    // Save updated cart
    localStorage.setItem(cartKey, JSON.stringify(updatedCart));

    // Update local array
    this.orderDetailsUnauth = updatedCart;

    // Recalculate order summary
    this.calculateUnauthOrderSummary();

    this.updatingItemId = null;
    this.cartUpdateSuccess = this._translateService.instant(
      'shared.update_cart_quantity'
    );
    setTimeout(
      () => ((this.isAddingItem = false), (this.cartUpdateSuccess = null)),
      1000
    );
  }

  /**
   * Update the quantity of an item directly
   */
  updateQuantity(productId: string | number, quantity: number) {
    // Get the order detail object for this product
    const cartItem = this._cartState.getCartItemForProduct(productId);
    if (!cartItem) {
      console.warn('Cannot update item: Product not found in cart');
      return;
    }

    if (quantity > 0) {
      this.isAddingItem = true;
      this.updatingItemId = productId;
      this.cartUpdateSuccess = null;
      this.removeItemError = null;

      this._cartState.updateQuantity(productId, quantity).subscribe({
        next: (response: any) => {
          // Set loading state while fetching updated cart
          this.isLoading = true;

          if (response.ar_message) {
            this.removeItemError =
              this._translateService.instant('Limit_Exeeds');
            this.isLoading = false;
            this.isAddingItem = false;
            this.updatingItemId = null;

            setTimeout(() => (this.removeItemError = null), 3000);
            return;
          } else {
            // Refresh cart to get updated data
            this._cartState.fetchCart().subscribe({
              next: () => {
                this.isLoading = false;
                this.isAddingItem = false;
                this.updatingItemId = null;
                this.cartUpdateSuccess = this._translateService.instant(
                  'shared.update_cart_quantity'
                );
                this.checkAndShowGlobalDiscountMessage();
                setTimeout(() => (this.cartUpdateSuccess = null), 3000);
              },
              error: (err) => {
                this.isLoading = false;
                this.isAddingItem = false;
                this.updatingItemId = null;
                console.error('Error fetching cart after update', err);
              },
            });
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.isAddingItem = false;
          this.updatingItemId = null;
          this.removeItemError = this._translateService.instant(
            'cart.error.update_failed'
          );
          console.error('Error updating quantity', err);
          setTimeout(() => (this.removeItemError = null), 3000);
        },
      });
    } else {
      this.removeItem(cartItem);
    }
  }

  isRemovingItem = false;

  isAddingItem = false;

  isClearingCart = false;

  removeItemError: string | null = null;

  cartUpdateSuccess: string | null = null;

  // Global discount message
  globalDiscountMessage: string = '';

  // Dynamic discount percentage from API
  discountPercentage: number = 0; // Default fallback value

  /**
   * Fetch discount percentage from API
   */
  fetchDiscount(): void {
    this._ordersService.getDiscount().subscribe({
      next: (response) => {
        if (response && response.discount) {
          this.discountPercentage = response.discount;
        }
      },
      error: (err) => {
        console.error('Error fetching discount:', err);
        // Keep default value of 95 on error
      },
    });
  }

  /**
   * Calculate order summary for a single item using backend API
   */
  calculateOrderSummaryAsG(price: number, quantity: number): Observable<any> {

    // For quantity 1, just return the price directly to avoid backend issues
    if (quantity === 1) {
      return new Observable((observer) => {
        observer.next({ subtotal: Number(price) });
        observer.complete();
      });
    }

    return this._ordersService
      .calculateOrderSummaryAsGuest({
        price,
        quantity,
      });
  }

  /**
   * Calculate line total with dynamic discount for second item
   * @deprecated Use calculateOrderSummaryAsG() backend API instead
   * This method is kept as fallback for error scenarios
   */

  calculateLineTotal(price: number, quantity: number): number {
    if (quantity === 1) {
      return Number(price);
    } else if (quantity >= 2) {
      // first item full price + second item with discount + remaining items at full price
      const discountedPrice =
        Number(price) * ((100 - this.discountPercentage) / 100);
      return Number(price) + discountedPrice + (quantity - 2) * Number(price);
    } else {
      // fallback (shouldn't reach here)
      return quantity * Number(price);
    }
  }

  /**
   * Check if any item has quantity >= 2 and show global discount message
   */
  checkAndShowGlobalDiscountMessage(): void {
    if (this._authService.isAuthenticated()) {
      const hasDiscountItem = this.orderDetails().some(
        (item) => (item.quantity || 1) >= 2
      );
      if (hasDiscountItem) {
        this.globalDiscountMessage = this._translateService.instant(
          'cart.discount_applied_second_item',
          { discount: this.discountPercentage }
        );
      } else {
        this.globalDiscountMessage = '';
      }
    } else {
      const hasDiscountItem = this.orderDetailsUnauth.some(
        (item) => (item.quantity || 1) >= 2
      );

      if (hasDiscountItem) {
        this.globalDiscountMessage = this._translateService.instant(
          'cart.discount_applied_second_item',
          { discount: this.discountPercentage }
        );
      } else {
        this.globalDiscountMessage = '';
      }
    }
  }

  /**
   * Get global discount message
   */
  getGlobalDiscountMessage(): string {
    return this.globalDiscountMessage;
  }

  /**
   * Remove an item from the cart
   */
  removeItem(orderDetail: OrderDetail): void {
    // Set the animation state to trigger fadeOut
    this.setItemAnimationState(orderDetail.id, 'fadeOut');

    // Mark item as being removed
    this.removingItemId = orderDetail.id;
    this.cartUpdateSuccess = null;
    this.removeItemError = null;

    // Visual state is handled by the animation,
    // actual removal happens in performItemRemoval after animation completes
  }

  /**
   * Perform the actual API call to remove an item
   */
  performItemRemoval(orderDetail: OrderDetail): void {
    this.isRemovingItem = true;

    this._cartState.removeItem(orderDetail.id).subscribe({
      next: () => {
        // Set loading state while fetching updated cart
        this.isLoading = true;

        // Refresh cart to get updated data
        this._cartState.fetchCart().subscribe({
          next: () => {
            this.isLoading = false;
            this.isRemovingItem = false;
            this.removingItemId = null;

            this._alertService.showNotification({
              imagePath: '/images/common/after-remove.webp',
              translationKeys: {
                title: 'alerts.cart.remove_success.title',
              },
            }); // Show success notification (without buttons)
          },
          error: (err) => {
            this.isLoading = false;
            this.isRemovingItem = false;
            this.removingItemId = null;
            console.error('Error fetching cart after removal', err);
          },
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.isRemovingItem = false;
        this.removingItemId = null;
        this.removeItemError = this._translateService.instant(
          'cart.error.remove_failed'
        );
        console.error('Error removing item', err);
        setTimeout(() => (this.removeItemError = null), 3000);
      },
    });
  }

  /**
   * Remove item for unauthenticated users
   */
  removeUnauthItem(item: IUnauthUser): void {
    this.isRemovingItem = true;
    this.removingItemId = item.id;

    // Show confirmation alert before removing
    this._alertService.showConfirmation({
      imagePath: '/images/common/before-remove.webp',
      translationKeys: {
        title: 'alerts.cart.remove_confirm.title',
        message: 'alerts.cart.remove_confirm.message',
        confirmText: 'alerts.cart.remove_confirm.yes',
        cancelText: 'alerts.cart.remove_confirm.cancel',
      },
      onConfirm: () => {
        const cartKey = 'orderDetails';
        const cart: IUnauthUser[] = JSON.parse(
          localStorage.getItem(cartKey) || '[]'
        );

        const updatedCart = cart.filter((cartItem) => cartItem.id !== item.id);
        // Save updated cart
        localStorage.setItem(cartKey, JSON.stringify(updatedCart));

        this._authService.cartCountSignal.set(updatedCart.length);
        // Update local array
        this.orderDetailsUnauth = updatedCart;

        // Recalculate order summary
        this.calculateUnauthOrderSummary();

        this.isRemovingItem = false;
        this.removingItemId = null;

        // Show success notification after a small delay to ensure
        // confirmation dialog is fully closed
        setTimeout(() => {
          this._alertService.showNotification({
            imagePath: '/images/common/after-remove.webp',
            translationKeys: {
              title: 'alerts.cart.remove_success.title',
            },
          });
        }, 300);

        // Check and show global discount message after removal
        // this.checkAndShowGlobalDiscountMessage();
      },
      onCancel: () => {
        this.isRemovingItem = false;
        this.removingItemId = null;
      },
    });
  }

  /**
   * Clear all items from the cart
   */
  clearCart() {
    this.isClearingCart = true;
    this.cartUpdateSuccess = null;
    this.removeItemError = null;

    this._cartState.clearCart().subscribe({
      next: () => {
        // Set loading state while fetching updated cart
        this.isLoading = true;

        // Refresh cart to get updated data
        this._cartState.fetchCart().subscribe({
          next: () => {
            this.isLoading = false;
            this.isClearingCart = false;
            this.cartUpdateSuccess =
              this._translateService.instant('cart.cart_cleared');
            setTimeout(() => (this.cartUpdateSuccess = null), 3000);
          },
          error: (err) => {
            this.isLoading = false;
            this.isClearingCart = false;
            console.error('Error fetching cart after clearing', err);
          },
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.isClearingCart = false;
        this.removeItemError = this._translateService.instant(
          'cart.error.clear_failed'
        );
        console.error('Error clearing cart', err);
        setTimeout(() => (this.removeItemError = null), 3000);
      },
    });
  }

  /**
   * Clear cart for unauthenticated users
   */
  clearUnauthCart(): void {
    this.isClearingCart = true;

    // Show confirmation alert before clearing
    this._alertService.showConfirmation({
      imagePath: '/images/common/before-remove.webp',
      translationKeys: {
        title: 'alerts.cart.remove_confirm.title',
        message: 'alerts.cart.remove_confirm.message',
        confirmText: 'alerts.cart.remove_confirm.yes',
        cancelText: 'alerts.cart.remove_confirm.cancel',
      },
      onConfirm: () => {
        // Clear the cart in local storage
        localStorage.setItem('orderDetails', '[]');
        this._authService.cartCountSignal.set(0);
        // Show success notification (without buttons)

        // Clear the order summary
        localStorage.setItem(
          'order-summary',
          JSON.stringify({
            subtotal: 0,
            total: 0,
            itemCount: 0,
          })
        );

        // Update local array
        this.orderDetailsUnauth = [];

        // Update order summary
        this.calculateUnauthOrderSummary();

        this.isClearingCart = false;
        this.cartUpdateSuccess =
          this._translateService.instant('cart.cart_cleared');
        setTimeout(() => (this.cartUpdateSuccess = null), 3000);
        setTimeout(() => {
          this._alertService.showNotification({
            imagePath: '/images/common/after-remove.webp',
            translationKeys: {
              title: 'alerts.cart.remove_success.title',
            },
          });
        }, 300);
      },
      onCancel: () => {
        this.isClearingCart = false;
      },
    });
  }

  /**
   * Apply a promo code to the cart
   */

  promoCodeForm: FormGroup = this.formBuilder.group({
    code: ['', [Validators.required, Validators.minLength(3)]],
  });

  promoCodeError: string | null = null;

  promoCodeSuccess: string | null = null;

  applyPromoCode() {
    if (this.promoCodeForm.valid) {
      const code = this.promoCodeForm.get('code')?.value;
      this.promoCodeError = null;
      this.promoCodeSuccess = null;
      this.isPromoCodeLoading = true;

      this._cartState.applyPromoCode(code).subscribe({
        next: (response) => {
          this.isPromoCodeLoading = false;
          if (response.available) {
            // Set loading state while fetching updated cart
            this.isLoading = true;

            // Refresh cart to get updated data with the applied promo code
            this._cartState.fetchCart().subscribe({
              next: () => {
                this.isLoading = false;

                this._languageService.getIsArabic().subscribe((isArabic) => {
                  this.lang = isArabic;
                });
                if (this.lang) {
                  this.promoCodeSuccess = response.ar_message;
                } else {
                  this.promoCodeSuccess = response.en_message;
                }
                this.promoCodeForm.reset();
              },
              error: (err) => {
                this.isLoading = false;
                console.error(
                  'Error fetching cart after applying promo code',
                  err
                );
              },
            });
          } else {
            this.isPromoCodeLoading = false;
            this.isLoading = false;
            this._languageService.getIsArabic().subscribe((isArabic) => {
              this.lang = isArabic;
            });
            if (this.lang) {
              this.promoCodeError = response.ar_message;
            } else {
              this.promoCodeError = response.en_message;
            }
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.isPromoCodeLoading = false;

          this._languageService.getIsArabic().subscribe((isArabic) => {
            this.lang = isArabic;
          });
          if (this.lang) {
            this.promoCodeError = err.ar_message;
          } else {
            this.promoCodeError = err.en_message;
          }
          console.error('Error applying promo code', err);
        },
      });
    } else {
      // Mark form controls as touched to show validation errors
      this.promoCodeForm.markAllAsTouched();
    }
  }

  // Helper method to set animation state on an item
  setItemAnimationState(id: number, state: 'visible' | 'fadeOut'): void {
    const items = this.orderDetails();
    if (items) {
      const updatedItems = items.map((item) => {
        if (item.id === id) {
          return { ...item, animationState: state };
        }
        return item;
      });

      this._cartState.setOrderDetails(updatedItems);
    }
  }

  // Handle animation completion
  onAnimationDone(event: AnimationEvent, item: OrderDetail): void {
    if (event.toState === 'fadeOut') {
      // Now proceed with the actual item removal
      this.performItemRemoval(item);
    }
  }

  aboutUsTwo: IAboutUsTwo = {} as IAboutUsTwo;

  getAboutData() {
    this._aboutUsService.getAboutData().subscribe((res: IAboutUsTwo) => {
      this.aboutUsTwo = res;
    });
  }

  /**
   * Check if the cart is empty based on authentication status
   */
  isCartEmpty(): boolean {
    if (this._authService.isAuthenticated()) {
      // For authenticated users, use the cart state service
      return this.isEmpty();
    } else {
      // For unauthenticated users, check the local array
      return this.orderDetailsUnauth.length === 0;
    }
  }

  /**
   * Load cart data for unauthenticated users from local storage
   */
  loadUnauthCart(): void {
    const cartKey = 'orderDetails';
    const cart: IUnauthUser[] = JSON.parse(
      localStorage.getItem(cartKey) || '[]'
    );

    if (cart.length === 0) {
      this.orderDetailsUnauth = [];
      this.calculateUnauthOrderSummary();
      return;
    }

    // Ensure all items have a quantity property
    const updatedCart = cart.map((item) => ({
      ...item,
      quantity: item.quantity || 1,
    }));

    // Calculate backend line totals for all items
    const backendCalculations$ = updatedCart.map((item) =>
      this.calculateOrderSummaryAsG(Number(item.price), item.quantity || 1)
    );

    // Execute all backend calculations in parallel
    forkJoin(backendCalculations$).subscribe({
      next: (responses) => {
        // Update cart items with backend calculated line totals
        const cartWithBackendTotals = updatedCart.map((item, index) => {
          const backendSubtotal = responses[index]?.subtotal;
          let lineTotal: number;

          // Validate backend response
          if (
            backendSubtotal &&
            !isNaN(Number(backendSubtotal)) &&
            isFinite(Number(backendSubtotal)) &&
            Number(backendSubtotal) < 1000000
          ) {
            lineTotal = Number(backendSubtotal);

          } else {
            // Fallback to simple calculation
            lineTotal = Number(item.price) * (item.quantity || 1);
            console.warn(
              `Invalid backend response for item ${item.id}, using fallback:`,
              backendSubtotal,
              'fallback:',
              lineTotal
            );
          }

          return {
            ...item,
            lineTotal,
          };
        });

        // Update local storage with the updated cart
        localStorage.setItem(cartKey, JSON.stringify(cartWithBackendTotals));

        this.orderDetailsUnauth = cartWithBackendTotals;

        // Calculate order summary
        this.calculateUnauthOrderSummary();

        // Check and show global discount message on load
        this.checkAndShowGlobalDiscountMessage();
      },
      error: (err) => {
        console.error(
          'Error calculating backend totals, using fallback calculations:',
          err
        );

        // Fallback to manual calculation if backend fails
        const cartWithFallbackTotals = updatedCart.map((item) => ({
          ...item,
          lineTotal: this.calculateLineTotal(
            Number(item.price),
            item.quantity || 1
          ),
        }));

        localStorage.setItem(cartKey, JSON.stringify(cartWithFallbackTotals));
        this.orderDetailsUnauth = cartWithFallbackTotals;

        // Calculate order summary
        this.calculateUnauthOrderSummary();

        // Check and show global discount message on load
        this.checkAndShowGlobalDiscountMessage();
      },
    });
  }

  /**
   * Calculate and update the order summary for unauthenticated users
   */
  calculateUnauthOrderSummary(): void {
    let subtotal = 0;
    let itemCount = 0;

    this.orderDetailsUnauth.forEach((item) => {
      const quantity = item.quantity || 1;

      // Use lineTotal if available (for discount calculations), otherwise use normal calculation
      if (item.lineTotal !== undefined) {
        // Validate lineTotal to ensure it's a reasonable number
        const lineTotal = Number(item.lineTotal);
        if (!isNaN(lineTotal) && isFinite(lineTotal) && lineTotal < 1000000) {
          subtotal += lineTotal;
        } else {
          console.warn(
            'Invalid lineTotal detected:',
            item.lineTotal,
            'for item:',
            item
          );
          // Fallback to price * quantity
          const price =
            typeof item.price === 'string'
              ? parseFloat(item.price)
              : item.price;
          subtotal += price * quantity;
        }
      } else {
        const price =
          typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        subtotal += price * quantity;
      }

      itemCount += quantity;
    });
    this.unauthOrderSummary = {
      subtotal,
      total: subtotal, // For now, total is the same as subtotal (no shipping/tax)
      itemCount,
    };

    // Store the summary in local storage for checkout
    localStorage.setItem(
      'order-summary',
      JSON.stringify(this.unauthOrderSummary)
    );
  }

  /**
   * Calculate subtotal for a single item in unauthenticated cart
   */
  calculateUnauthItemSubtotal(item: IUnauthUser): string {
    // Use lineTotal if available (for discount calculations), otherwise use normal calculation
    if (item.lineTotal !== undefined) {
      return this.formatPrice(item.lineTotal);
    }

    const price =
      typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    const quantity = item.quantity || 1;
    return this.formatPrice(price * quantity);
  }

  /**
   * Increase quantity for unauthenticated users
   */
  increaseUnauthQuantity(item: IUnauthUser): void {
    if (!item?.id) return;
    this.isAddingItem = true;
    const quantity = (item.quantity ?? 1) + 1;
    const price = item.price ?? 0;

    // Use backend calculation
    this.calculateOrderSummaryAsG(Number(price), quantity).subscribe({
      next: (response) => {
        const lineTotal =
          response.subtotal || this.calculateLineTotal(Number(price), quantity);
        this.updateUnauthQuantity(item.id, quantity, lineTotal);

        // Check and show global discount message if any item has quantity >= 2
        this.checkAndShowGlobalDiscountMessage();
      },
      error: (err) => {
        console.error('Error calculating backend total, using fallback:', err);
        // Fallback to manual calculation
        const lineTotal = this.calculateLineTotal(Number(price), quantity);
        this.updateUnauthQuantity(item.id, quantity, lineTotal);

        // Check and show global discount message if any item has quantity >= 2
        this.checkAndShowGlobalDiscountMessage();
      },
    });
  }

  /**
   * Decrease quantity for unauthenticated users
   */
  decreaseUnauthQuantity(item: IUnauthUser): void {
    if (!item?.id) return;

    const quantity = (item.quantity || 1) - 1;

    if (quantity > 0) {
      const price = item.price ?? 0;

      // Use backend calculation
      this.calculateOrderSummaryAsG(Number(price), quantity).subscribe({
        next: (response) => {
          const lineTotal =
            response.subtotal ||
            this.calculateLineTotal(Number(price), quantity);
          this.updateUnauthQuantity(item.id, quantity, lineTotal);

          // Check and show global discount message if any item has quantity >= 2
          this.checkAndShowGlobalDiscountMessage();
        },
        error: (err) => {
          console.error(
            'Error calculating backend total, using fallback:',
            err
          );
          // Fallback to manual calculation
          const lineTotal = this.calculateLineTotal(Number(price), quantity);
          this.updateUnauthQuantity(item.id, quantity, lineTotal);

          // Check and show global discount message if any item has quantity >= 2
          this.checkAndShowGlobalDiscountMessage();
        },
      });
    } else {
      this.removeUnauthItem(item);
    }
  }

  /**
   * Check if the unauthenticated cart is empty
   */
  isUnauthCartEmpty(): boolean {
    return this.orderDetailsUnauth.length === 0;
  }

  /**
   * Initialize the address form for unauthenticated users
   */
  initUnauthAddressForm(): void {
    this.unauthAddressForm = this._formBuilder.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern('^05[0-9]{8}$')]],
      email: ['', [Validators.required, Validators.email]],
      location_id: ['', [Validators.required]],
    });
  }

  /**
   * Toggle the address form modal
   */
  toggleAddressFormModal(): void {
    this.showAddressFormModal = !this.showAddressFormModal;
  }

  /**
   * Check if a form field is invalid
   */
  isFieldInvalid(field: string): boolean {
    const control = this.unauthAddressForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  /**
   * Get error message for a form field
   */
  getErrorMessage(field: string): string {
    const control = this.unauthAddressForm.get(field);
    if (!control || control.valid) return '';

    if (control.hasError('required')) {
      return 'This field is required';
    }

    if (field === 'email' && control.hasError('email')) {
      return 'Please enter a valid email address';
    }

    if (field === 'phone' && control.hasError('pattern')) {
      return 'Phone number must start with 5 and have 9 digits';
    }

    return '';
  }

  /**
   * Handle form submission from the modal
   */
  handleAddressFormSubmit(addressData: any): void {
    this.isFormSubmitting.set(true);

    // Get cart data from local storage
    const cartData = JSON.parse(localStorage.getItem('orderDetails') || '[]');
    const orderSummary = JSON.parse(
      localStorage.getItem('order-summary') || '{}'
    );

    // Combine all data
    const checkoutData = {
      address: addressData,
      cart: cartData,
      summary: orderSummary,
    };

    // Store the combined data in local storage
    localStorage.setItem('checkout-data', JSON.stringify(checkoutData));

    this.userService.callTetApi(checkoutData).subscribe({
      next: (response) => {
        const token = { token: response.access.original.access_token };
        // Store the token
        localStorage.setItem('auth_token', JSON.stringify(token));
        this.userData.saveUserData(response.access.original.user);
        localStorage.removeItem('checkout-data');
        localStorage.removeItem('order-summary');
        localStorage.removeItem('orderDetails');
        // Update the auth state
        this.showAddressFormModal = false;
        this.isFormSubmitting.set(false);
        this.isLoading = false;
        this._authService.isAuthenticatedValue.set(true);
        // Then fetch the cart
        this._cartState.fetchCart().subscribe({
          next: () => {
            // Once cart data is loaded, disable loading state
            this.isLoading = false;

            // Initialize cart data with animation states
            const cartDetails = this.orderDetails();

            // Set all items to visible animation state
            if (cartDetails && cartDetails.length > 0) {
              this._cartState.setOrderDetails(
                cartDetails.map((item) => ({
                  ...item,
                  animationState: 'visible',
                }))
              );
            }
          },
          error: (err) => {
            this.isLoading = false;
            console.error('Error fetching cart during initialization', err);
          },
        });
      },
      error: (error) => {
        console.error('Error processing checkout:', error);
        this.isFormSubmitting.set(false);

        // Show error message
        this._alertService.showNotification({
          imagePath: '/images/common/error.webp',
          translationKeys: {
            title: 'alerts.checkout.error.title',
            message: 'alerts.checkout.error.message',
          },
        });
      },
    });
  }

  /**
   * Reset the address form
   */
  resetUnauthAddressForm(): void {
    this.unauthAddressForm.reset();
  }
}
