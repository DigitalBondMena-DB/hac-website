import {
  DestroyRef,
  Injectable,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IGetCartOrOrder, OrderDetail } from '@core/interfaces/cart.interfaces';
import { EMPTY, Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { OrdersService } from './orders.service';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class CartStateService {
  private ordersService = inject(OrdersService);
  private destroyRef = inject(DestroyRef);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private readonly PLATFORM_ID = inject(PLATFORM_ID)

  // Cart state signals
  private cartState = signal<IGetCartOrOrder>({} as IGetCartOrOrder);

  // Public computed signals
  readonly order = computed(() => this.cartState().order);

  readonly orderDetails = computed(() => this.cartState()?.orderDetails || []);

  readonly promoCode = computed(() => this.cartState()?.promocode || null);

  readonly user = computed(() => this.cartState()?.user || null);

  readonly isEmpty = computed(() => this.orderDetails().length === 0);

  /**
   * Get the total number of items in the cart
   */
  readonly cartCount = computed(() => {
    // Return 0 if user is not authenticated
    if (!this.authService.isAuthenticated()) {
      return 0;
    }

    // Get the items directly from cart state
    const items = this.orderDetails();
    if (!items || items.length === 0) return 0;

    // Sum up the quantities of all items
    return items.reduce((total, item) => total + (item.quantity || 0), 0);
  });

  // Signal to track if user has confirmed orders
  private hasConfirmedOrdersSignal = signal<boolean>(false);

  // Method to check if user has confirmed orders
  private hasConfirmedOrders(): boolean {
    return this.hasConfirmedOrdersSignal();
  }

  /**
   * Check if localStorage is available in the current browser
   * @returns boolean indicating if localStorage is available
   */
  private isLocalStorageAvailable(): boolean {
    if (isPlatformServer(this.PLATFORM_ID)) return false;
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  constructor() {
    // Check for confirmed orders first, then initialize cart
    this.checkConfirmedOrders()
      .pipe(
        // Only fetch cart if user is authenticated but has no confirmed orders
        // If user has confirmed orders, the cart is already fetched in checkConfirmedOrders
        switchMap((hasConfirmedOrders) => {
          if (!this.authService.isAuthenticated() || hasConfirmedOrders) {
            // We already have the cart data or user is not authenticated
            return EMPTY;
          }
          // User is authenticated but has no confirmed orders yet, fetch an empty cart
          return this.fetchCart();
        })
      )
      .subscribe();

    // Set up effect to automatically persist cart changes
    effect(() => {
      // This will trigger when the cart state changes
      const cart = this.cartState();
      if (cart && this.isLocalStorageAvailable()) {
        localStorage.setItem('cart-timestamp', Date.now().toString());
      }
    });
  }

  // Check if the user has confirmed orders
  checkConfirmedOrders(): Observable<boolean> {
    if (!this.authService.isAuthenticated()) {
      this.hasConfirmedOrdersSignal.set(false);
      return of(false);
    }

    return this.ordersService.checkCart().pipe(
      map((response) => {
        const hasConfirmed =
          response.orderDetails && response.orderDetails.length > 0;

        // Update the signal
        this.hasConfirmedOrdersSignal.set(hasConfirmed);

        // If we have items, update the cart state directly
        if (hasConfirmed) {
          this.cartState.set(response);
        }

        return hasConfirmed;
      }),
      catchError((err) => {
        console.error('Error checking confirmed orders:', err);
        this.hasConfirmedOrdersSignal.set(false);
        return of(false);
      })
    );
  }

  fetchCart(): Observable<IGetCartOrOrder> {
    // Don't fetch cart for unauthenticated users
    if (!this.authService.isAuthenticated()) {
      // Initialize with empty cart
      const emptyCart: IGetCartOrOrder = {
        orderDetails: [],
        promocode: null,
        order: null as any,
        user: null as any,
      };
      this.cartState.set(emptyCart);
      return of(emptyCart);
    }

    // Always fetch the cart for authenticated users
    // Even if hasConfirmedOrders() is false, we still want to get the latest data
    return this.ordersService.checkCart().pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((cart) => {
        // Update the cart state with the response
        this.cartState.set(cart);

        // Update hasConfirmedOrders based on cart contents
        const hasItems = cart.orderDetails && cart.orderDetails.length > 0;
        this.hasConfirmedOrdersSignal.set(hasItems);
      }),
      catchError((err) => {
        console.error('Error fetching cart', err);
        // Initialize with empty cart on error
        const emptyCart: IGetCartOrOrder = {
          orderDetails: [],
          promocode: null,
          order: null as any,
          user: null as any,
        };

        this.cartState.set(emptyCart);
        return of(emptyCart);
      })
    );
  }

  /**
   * Check if a product is already in the cart
   * @param productId The ID of the product to check
   * @returns boolean indicating whether the product is in the cart
   */
  isProductInCart(productId: number | string): boolean {
    const orderDetails = this.orderDetails();
    if (!orderDetails || orderDetails.length === 0) {
      return false;
    }

    // Convert to string for comparison to handle both number and string types
    const searchProductId = productId.toString();

    return orderDetails.some(
      (item) => item.product_id.toString() === searchProductId
    );
  }

  /**
   * Get the cart item details for a specific product
   * @param productId The ID of the product to find in the cart
   * @returns The cart item detail or null if not found
   */
  getCartItemForProduct(productId: number | string): OrderDetail | null {
    const orderDetails = this.orderDetails();
    if (!orderDetails || orderDetails.length === 0) {
      return null;
    }

    // Convert to string for comparison
    const searchProductId = productId.toString();

    // Find and return the cart item
    return (
      orderDetails.find(
        (item) => item.product_id.toString() === searchProductId
      ) || null
    );
  }

  /**
   * Update the order details with the provided items
   * Used primarily for updating animation states
   * @param items The updated order details to set
   */
  setOrderDetails(items: OrderDetail[]): void {
    // Get the current cart state
    const currentState = this.cartState();

    // Update only the orderDetails property, preserving other properties
    this.cartState.set({
      ...currentState,
      orderDetails: items,
    });
  }

  addToCart(
    item:
      | FormData
      | {
        product_id: string | number;
        quantity: number;
        choice_id?: string;
      }
  ) {
    // Prevent adding to cart if user is not authenticated
    if (!this.authService.isAuthenticated()) {
      console.warn('User must be authenticated to add items to cart');
      return EMPTY;
    }
    const userId = this.authService.getUserId();
    return this.ordersService.addToCartOrCreateOrder(item, userId).pipe(
      tap((response: any) => {
        // Set hasConfirmedOrders to true since we just added an item
        this.hasConfirmedOrdersSignal.set(true);

        // Ensure the response has the expected structure
        let formattedCart: IGetCartOrOrder;

        // Check if the response is already in the expected format
        if (response.orderDetails && Array.isArray(response.orderDetails)) {
          formattedCart = response as IGetCartOrOrder;
        }
        // If response has a different structure like { cart: { details: [...] } }
        else if (response.cart && response.cart.details) {
          formattedCart = {
            orderDetails: response.cart.details,
            order: response.cart.order || (null as any),
            promocode: response.cart.promocode || null,
            user: response.cart.user || (null as any),
          };
        }
        // If we can't determine the structure, use the response as is
        else {
          console.warn('Unexpected cart response structure:', response);
          formattedCart = response as IGetCartOrOrder;
        }

        // Set the cart state with the formatted response
        this.cartState.set(formattedCart);
      }),
      catchError((err) => {
        console.error('Error adding item to cart', err);
        return EMPTY;
      })
    );
  }

  /**
   * Update quantity of an item in the cart
   */
  updateQuantity(productId: string | number, quantity: number) {
    // Prevent updating cart if user is not authenticated
    if (!this.authService.isAuthenticated()) {
      console.warn('User must be authenticated to update cart');
      return EMPTY;
    }

    // Get the order detail object for this product to get its ID
    const cartItem = this.getCartItemForProduct(productId);
    if (!cartItem) {
      console.warn('Cannot update item: Product not found in cart');
      return EMPTY;
    }

    const item = {
      orderDetailId: cartItem.id,
      quantity: quantity,
    };

    return this.ordersService.updateQuantity(item).pipe(
      tap((cart) => {
        // Ensure cart has all required properties before updating state
        if (cart && cart.orderDetails) {
          this.cartState.set(cart);
        } else {
          // If response is incomplete, fetch the full cart
          console.warn('Incomplete cart response, fetching full cart');
          this.fetchCart().subscribe();
        }
      }),
      catchError((err) => {
        console.error('Error updating cart quantity', err);
        return EMPTY;
      })
    );
  }

  /**
   * Remove an item from the cart by detail ID
   * @param detailId The ID of the order detail item to remove
   */
  removeItem(detailId: string | number) {
    // Prevent removing items if user is not authenticated
    if (!this.authService.isAuthenticated()) {
      console.warn('User must be authenticated to remove items from cart');
      return EMPTY;
    }

    return this.ordersService.removeFromCart(detailId).pipe(
      tap((cart) => {
        // Ensure cart has all required properties before updating state
        if (cart && cart.orderDetails) {
          this.cartState.set(cart);
        } else {
          // If response is incomplete, fetch the full cart
          console.warn('Incomplete cart response, fetching full cart');
          this.fetchCart().subscribe();
        }
      }),
      catchError((err) => {
        console.error('Error removing item from cart', err);
        return EMPTY;
      })
    );
  }

  /**
   * Remove a product from the cart by finding its detail ID
   * @param productId The ID of the product to remove
   */
  removeProductFromCart(productId: string | number) {
    // First find the cart item detail for this product
    const cartItem = this.getCartItemForProduct(productId);
    if (!cartItem) {
      console.warn('Cannot remove item: Product not found in cart');
      return EMPTY;
    }

    // Then remove it using the detail ID
    return this.removeItem(cartItem.id);
  }

  clearCart() {
    // Prevent clearing cart if user is not authenticated
    if (!this.authService.isAuthenticated()) {
      console.warn('User must be authenticated to clear cart');
      return EMPTY;
    }

    // Get the order ID from the current cart state
    const orderId = this.order()?.id;
    if (!orderId) {
      console.warn('Cannot clear cart: No active order found');
      return EMPTY;
    }

    return this.ordersService.removeAllFromCart(orderId).pipe(
      tap((cart) => {
        // Ensure cart has all required properties before updating state
        if (cart && cart.hasOwnProperty('orderDetails')) {
          this.cartState.set(cart);
        } else {
          // If response is incomplete, fetch the full cart
          console.warn('Incomplete cart response, fetching full cart');
          this.fetchCart().subscribe();
        }
      }),
      catchError((err) => {
        console.error('Error clearing cart', err);
        return EMPTY;
      })
    );
  }

  applyPromoCode(code: string) {
    // Prevent applying promo code if user is not authenticated
    if (!this.authService.isAuthenticated()) {
      console.warn('User must be authenticated to apply promo code');
      return EMPTY;
    }

    return this.ordersService.checkPromoCode(code).pipe(
      tap((response) => {
        if (response.valid && this.cartState()) {
          this.fetchCart().subscribe(); // Refetch cart to get updated totals
        }
      }),
      catchError((err) => {
        console.error('Error applying promo code', err);
        return EMPTY;
      })
    );
  }

  /**
   * Update only the cart count without fetching the full cart
   * This is useful for quick updates to the navbar
   */
  updateCartCount(): void {
    // Don't update for unauthenticated users
    if (!this.authService.isAuthenticated()) {
      return;
    }

    // Always fetch the cart to get the latest count
    this.fetchCart().subscribe();
  }

  /**
   * Update the order with new data from the API response
   * @param orderData The updated order data from the API
   */
  updateOrder(orderData: any): void {
    if (!orderData) return;

    // Get the current cart state
    const currentState = this.cartState();

    // Update the order property while preserving other properties
    this.cartState.set({
      ...currentState,
      order: orderData,
    });
  }

  /**
   * Reset the cart state completely (used during logout)
   * This ensures all cart data is cleared when a user logs out
   */
  resetCart(): void {
    // Initialize with empty cart
    this.cartState.set({
      orderDetails: [],
      promocode: null,
      order: null as any,
      user: null as any,
    });

    // Make sure we don't think there are confirmed orders
    this.hasConfirmedOrdersSignal.set(false);
  }
}
