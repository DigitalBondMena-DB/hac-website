import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { API_CONFIG } from '../conf/api.config';
import { ApiService } from '../conf/api.service';
import { UserService } from '../user/user.service';

export interface WishlistItem {
  id: number;
  product_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  product: any;
}

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  // Signal for wishlist count
  private wishlistCountSignal = signal<number>(0);

  // Observable for components that need to subscribe to changes
  private wishlistCount$ = new BehaviorSubject<number>(0);

  // Map to track which products are in wishlist
  private productsInWishlist = signal<Map<number, number>>(new Map());

  readonly userId = this.authService.getUserId();

  constructor() {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }
    this.userService.getUserOrders().subscribe((next) => {
      if (next.row.confirmed_orders.length > 0) {
        this.loadWishlistCount();
      }
    });
  }
  // Get the wishlist count signal
  getWishlistCountSignal() {
    // Return 0 if user is not authenticated
    if (!this.authService.isAuthenticated()) {
      return signal<number>(0);
    }
    return this.wishlistCountSignal;
  }

  // For components that prefer Observable pattern
  getWishlistCount(): Observable<number> {
    return this.wishlistCount$.asObservable();
  }

  // Get the map of product IDs that are in the wishlist
  // Key is product_id, Value is wish_id (needed for removal)
  getProductsInWishlistSignal() {
    return this.productsInWishlist;
  }

  // Check if a product is in the wishlist
  isProductInWishlist(productId: number): boolean {
    return this.productsInWishlist().has(productId);
  }

  // Get the wish ID for a product (for removal)
  getWishIdForProduct(productId: number): number | undefined {
    return this.productsInWishlist().get(productId);
  }

  // Add product to wishlist
  addToWishlist(productId: number): Observable<any> {
    if (!this.authService.isAuthenticated()) {
      // If user is not authenticated, handle accordingly
      console.warn('User must be authenticated to add items to wishlist');
      return new Observable((observer) => {
        observer.error('User not authenticated');
        observer.complete();
      });
    }

    // Create FormData object
    const formData = new FormData();
    formData.append('product_id', productId.toString());
    formData.append('user_id', this.userId.toString());

    return this.apiService.post(API_CONFIG.WISHLIST.STORE_WISH, formData).pipe(
      tap((response: any) => {
        // Update the wishlist count and product map
        const currentCount = this.wishlistCountSignal();
        this.wishlistCountSignal.set(currentCount + 1);
        this.wishlistCount$.next(currentCount + 1);

        // Add the product to the wishlist map if the response contains an ID
        if (response && response.id) {
          const newMap = new Map(this.productsInWishlist());
          newMap.set(productId, response.id);
          this.productsInWishlist.set(newMap);
        }
      })
    );
  }

  // Remove product from wishlist
  removeFromWishlist(wishIdOrAll: number | string): Observable<any> {
    // Create FormData object
    return this.apiService
      .post(`${API_CONFIG.WISHLIST.REMOVE_WISH}${wishIdOrAll}`, {
        user_id: this.userId,
      })
      .pipe(
        tap((response) => {
          if (wishIdOrAll === 'all') {
            // If removing all, reset everything
            this.wishlistCountSignal.set(0);
            this.wishlistCount$.next(0);
            this.productsInWishlist.set(new Map());
          } else {
            // Decrement the wishlist count
            const currentCount = this.wishlistCountSignal();
            if (currentCount > 0) {
              this.wishlistCountSignal.set(currentCount - 1);
              this.wishlistCount$.next(currentCount - 1);
            }

            // Remove from the map of products in wishlist
            const currentMap = this.productsInWishlist();
            const newMap = new Map(currentMap);

            // Find the product_id that has this wishId
            for (const [productId, wId] of currentMap.entries()) {
              if (wId === +wishIdOrAll) {
                newMap.delete(productId);
                break;
              }
            }

            this.productsInWishlist.set(newMap);
          }
        })
      );
  }

  // Get all wishlist items
  getWishlistItems(): Observable<any> {
    return this.apiService.get(
      `${API_CONFIG.WISHLIST.GET_USER_WISH}/${this.userId}`
    );
  }

  // Load wishlist count from API if user is authenticated
  loadWishlistCount(): void {
    if (!this.authService.isAuthenticated()) {
      // Reset counts for unauthenticated users
      this.wishlistCountSignal.set(0);
      this.wishlistCount$.next(0);
      this.productsInWishlist.set(new Map());
      return;
    }

    const userData = this.authService.getUserData();
    if (!userData || !userData.id) {
      return;
    }

    this.getWishlistItems().subscribe({
      next: (response) => {
        // Build a map of products in wishlist
        const productMap = new Map<number, number>();

        // Handle different API response formats
        const wishlistItems = response.wishs || response.data || [];

        if (Array.isArray(wishlistItems)) {
          wishlistItems.forEach((item: WishlistItem) => {
            if (item.product_id) {
              productMap.set(item.product_id, item.id);
            }
          });

          const count = wishlistItems.length;
          this.wishlistCountSignal.set(count);
          this.wishlistCount$.next(count);
          this.productsInWishlist.set(productMap);
        } else {
          this.wishlistCountSignal.set(0);
          this.wishlistCount$.next(0);
          this.productsInWishlist.set(new Map());
        }
      },
      error: () => {
        // Reset count on error
        this.wishlistCountSignal.set(0);
        this.wishlistCount$.next(0);
        this.productsInWishlist.set(new Map());
      },
    });
  }

  /**
   * Reset wishlist data completely (used during logout)
   * This ensures all wishlist data is cleared when a user logs out
   */
  resetWishlist(): void {
    this.wishlistCountSignal.set(0);
    this.wishlistCount$.next(0);
    this.productsInWishlist.set(new Map());
  }
}
