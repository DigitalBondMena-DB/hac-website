import { animate, style, transition, trigger } from '@angular/animations';
import { AsyncPipe, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { IGetWishlist } from '@core/interfaces/wishlist.interfaces';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { CartStateService } from '@core/services/cart/cart-state.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AlertService } from '@shared/alert/alert.service';
import { WishlistSkeletonComponent } from '@shared/components/skeleton/wishlist-skeleton/wishlist-skeleton.component';
import { TalentImageCardComponent } from '@shared/components/talent-image-card/talent-image-card.component';
import { take } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth/auth.service';
import { LanguageService } from '../../core/services/lang/language.service';
import { WishlistService } from '../../core/services/wishlist/wishlist.service';
import { ArticlesHeaderComponent } from '../articles/components/articles-header/articles-header.component';

// Module-level Map to track loading state by product ID for isAddingToCart
const cartLoadingMap = new Map<number, boolean>();

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    ArticlesHeaderComponent,
    TranslateModule,
    TalentImageCardComponent,
    ImageUrlDirective,
    CustomTranslatePipe,
    AsyncPipe,
    RouterLink,
    WishlistSkeletonComponent,
  ],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css',
  animations: [
    trigger('itemAnimation', [
      transition(':leave', [
        style({ transform: 'translateX(0)', opacity: 1 }),
        animate(
          '300ms ease-out',
          style({
            transform: 'translateX(-100%)',
            opacity: 0,
            height: 0,
            margin: 0,
            padding: 0,
          })
        ),
      ]),
    ]),
    trigger('emptyWishlistAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '500ms ease-out',
          style({
            opacity: 1,
            transform: 'translateY(0)',
          })
        ),
      ]),
    ]),
  ],
})
export class WishlistComponent implements OnInit {
  _translate = inject(TranslateService);

  _languageService = inject(LanguageService);

  _wishlistService = inject(WishlistService);

  _authService = inject(AuthService);

  _router = inject(Router);

  _cartStateService = inject(CartStateService);

  _alertService = inject(AlertService);

  currentLang$ = inject(LanguageService).getLanguage();

  wishlistItem: IGetWishlist[] = [];

  cartAnimationStates: { [key: number]: boolean } = {};

  isLoading = true;

  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private userId: number | null = null;

  ngOnInit(): void {
    // Check if user is authenticated
    if (this.isAuthenticated()) {
      // User is authenticated, set loading state
      this.isLoading = true;
      const userData = this._authService.getUserData();

      if (userData && userData.id) {
        this.userId = userData.id;
        this.loadWishlistItems();
      } else {
        // User data incomplete, stop loading
        this.isLoading = false;
      }
    } else {
      // Not authenticated, no need to show loading
      this.isLoading = false;
    }
  }

  /**
   * Checks if the user is authenticated
   * @returns boolean Whether the user is authenticated
   */
  isAuthenticated(): boolean {
    return this._authService.isAuthenticated();
  }

  private redirectToLogin(): void {
    this._languageService.getLanguage().subscribe((lang: string) => {
      this._router.navigate(['/', lang, 'login']);
    });
  }

  loadWishlistItems(): void {
    if (!this.userId) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    this._wishlistService.getWishlistItems().subscribe({
      next: (response) => {
        // Check different possible response formats
        if (response && Array.isArray(response.wishs)) {
          this.wishlistItem = response.wishs;
          console.log('Wishlist items loaded:', this.wishlistItem.length);
        } else {
          console.log('No wishlist items found or unexpected response format');
          this.wishlistItem = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading wishlist items:', error);
        this.wishlistItem = [];
        this.isLoading = false;

        // If unauthorized, handle accordingly
        if (error.status === 401) {
          // Force a re-login if token is invalid
          this._authService.logout().subscribe();
        }
      },
    });
  }

  /* WISHLIST MANAGEMENT */

  removeItem(wishId: number, index: number): void {
    // Show confirmation alert before removing
    this._alertService.showConfirmation({
      imagePath: '/images/common/before-remove.webp',
      translationKeys: {
        title: 'alerts.wishlist.remove_confirm.title',
        message: 'alerts.wishlist.remove_confirm.message',
        confirmText: 'alerts.wishlist.remove_confirm.yes',
        cancelText: 'alerts.wishlist.remove_confirm.cancel',
      },
      onConfirm: () => {
        // Proceed with removal
        this.executeRemoveFromWishlist(wishId, index);
      },
    });
  }

  private executeRemoveFromWishlist(wishId: number, index: number): void {
    this._wishlistService.removeFromWishlist(wishId).subscribe({
      next: () => {
        this.wishlistItem = this.wishlistItem.filter((_, i) => i !== index);
        this._wishlistService.loadWishlistCount();

        // Show success notification (without buttons)
        this._alertService.showNotification({
          imagePath: '/images/common/after-remove.webp',
          translationKeys: {
            title: 'alerts.wishlist.remove_success.title',
          },
        });
      },
      error: (error) => {
        console.error('Error removing item from wishlist:', error);

        // Show error notification
        this._alertService.showNotification({
          imagePath: '/images/common/before-remove.webp',
          translationKeys: {
            title: 'alerts.wishlist.remove_error.title',
            message: 'alerts.wishlist.remove_error.message',
          },
        });

        // If unauthorized, redirect to login
        if (error.status === 401) {
          this._authService.logout().subscribe(() => {
            this.redirectToLogin();
          });
        }
      },
    });
  }

  removeAllItems(): void {
    // Show confirmation alert before removing all
    this._alertService.showConfirmation({
      imagePath: '/images/common/before-remove.webp',
      translationKeys: {
        title: 'alerts.wishlist.remove_all_confirm.title',
        message: 'alerts.wishlist.remove_all_confirm.message',
        confirmText: 'alerts.wishlist.remove_confirm.yes',
        cancelText: 'alerts.wishlist.remove_confirm.cancel',
      },
      onConfirm: () => {
        // Proceed with removal of all items
        this.executeRemoveAllItems();
      },
    });
  }

  private executeRemoveAllItems(): void {
    if (!this.isBrowser) {
      this.wishlistItem = [];
      return;
    }

    const items = document.querySelectorAll('.wishlist-item');
    items.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('removing');
      }, index * 100);
    });

    // Remove all items at once with a single API call
    this._wishlistService.removeFromWishlist('all').subscribe({
      next: () => {
        // After all items are removed, clear the array
        setTimeout(() => {
          this.wishlistItem = [];
          this._wishlistService.loadWishlistCount();

          // Show success notification
          this._alertService.showNotification({
            imagePath: '/images/common/after-remove.webp',
            translationKeys: {
              title: 'alerts.wishlist.remove_all_success.title',
            },
          });
        }, items.length * 100); // Wait for animations to complete
      },
      error: (error) => {
        // Show error notification
        this._alertService.showNotification({
          imagePath: '/images/common/before-remove.webp',
          translationKeys: {
            title: 'alerts.wishlist.remove_error.title',
            message: 'alerts.wishlist.remove_error.message',
          },
        });

        // If unauthorized, redirect to login
        if (error.status === 401) {
          this._authService.logout().subscribe(() => {
            this.redirectToLogin();
          });
        }
      },
    });
  }

  /* CART MANAGEMENT */

  /**
   * Check if the product is in the cart
   */
  isInCart(productId: number): boolean {
    if (!productId) return false;
    return this._cartStateService.isProductInCart(productId);
  }

  /**
   * Check if a product is being added to cart (loading state)
   */
  isAddingToCart(productId: number): boolean {
    return cartLoadingMap.get(productId) || false;
  }

  /**
   * Set loading state for a specific product
   */
  private setCartLoading(productId: number, loading: boolean): void {
    if (!productId) return;
    cartLoadingMap.set(productId, loading);
  }

  /**
   * Add product to cart or toggle if already in cart
   */
  toggleCart(product: any, index: number): void {
    if (!product?.id) return;

    if (this.isInCart(product.id)) {
      this.removeFromCart(product.id);
    } else {
      this.addToCart(product.id, index);
    }
  }

  /**
   * Add product to cart
   */
  addToCart(productId: number, index: number): void {
    if (this.isAddingToCart(productId) || !productId) {
      return;
    }

    if (!this._authService.isAuthenticated()) {
      this._languageService
        .getLanguage()
        .pipe(take(1))
        .subscribe((lang: string) => {
          this._router.navigate(['/', lang, 'login']);
        });
      return;
    }

    this.setCartLoading(productId, true);
    this.showCartAnimation(index);

    const formData = new FormData();
    formData.append('product_id', productId.toString());
    formData.append('quantity', '1');

    this._cartStateService.addToCart(formData).subscribe({
      next: () => {
        this.setCartLoading(productId, false);
        this.showAddToCartSuccessAlert();
      },
      error: (error) => {
        this.setCartLoading(productId, false);
        this.handleCartError(error);
      },
    });
  }

  /**
   * Remove product from cart
   */
  removeFromCart(productId: number): void {
    if (!this.isInCart(productId) || !productId) return;

    if (this.isAddingToCart(productId)) return;

    // Get the cart item detail for this product
    const cartItem = this._cartStateService.getCartItemForProduct(productId);
    if (!cartItem) return;

    this.setCartLoading(productId, true);

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
        // Proceed with removal
        this.executeRemoveFromCart(cartItem.id, productId);
      },
      onCancel: () => {
        this.setCartLoading(productId, false);
      },
    });
  }

  /**
   * Execute cart removal after confirmation
   */
  private executeRemoveFromCart(detailId: number, productId: number): void {
    this._cartStateService.removeItem(detailId).subscribe({
      next: () => {
        this.setCartLoading(productId, false);

        // Refresh the cart state
        this._cartStateService.fetchCart();

        // Show success notification (without buttons)
        this._alertService.showNotification({
          imagePath: '/images/common/after-remove.webp',
          translationKeys: {
            title: 'alerts.cart.remove_success.title',
          },
        });
      },
      error: (err) => {
        this.setCartLoading(productId, false);
        if (err.status === 401) {
          this._languageService
            .getLanguage()
            .pipe(take(1))
            .subscribe((lang) => {
              this._router.navigate(['/', lang, 'login']);
            });
        }

        // Show error notification
        this._alertService.showNotification({
          imagePath: '/images/common/before-remove.webp',
          translationKeys: {
            title: 'alerts.cart.remove_error.title',
            message: 'alerts.cart.remove_error.message',
          },
        });
        console.error('Error removing from cart:', err);
      },
    });
  }

  /**
   * Handle cart errors
   */
  private handleCartError(error: any): void {
    if (error.status === 401) {
      this._languageService
        .getLanguage()
        .pipe(take(1))
        .subscribe((lang: string) => {
          this._router.navigate(['/', lang, 'login']);
        });
    }

    // Show error notification
    this._alertService.showNotification({
      imagePath: '/images/common/before-remove.webp',
      translationKeys: {
        title: 'alerts.cart.error.title',
        message: 'alerts.cart.error.message',
      },
    });

    console.error('Cart operation error:', error);
  }

  /**
   * Show success alert for adding to cart
   */
  private showAddToCartSuccessAlert(): void {
    // Show success notification for adding to cart
    this._alertService.showNotification({
      imagePath: '/images/common/addtocart.webp',
      translationKeys: {
        title: 'alerts.cart.add_success.title',
      },
    });
  }

  /**
   * Display cart animation when adding to cart
   */
  showCartAnimation(index: number): void {
    this.cartAnimationStates[index] = true;
    setTimeout(() => {
      this.cartAnimationStates[index] = false;
    }, 1000);
  }
}
