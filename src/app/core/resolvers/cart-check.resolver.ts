import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { CartStateService } from '@core/services/cart/cart-state.service';
import { LanguageService } from '@core/services/lang/language.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable, map, of, switchMap, take } from 'rxjs';

/**
 * Resolver to check if the cart has items before allowing navigation to checkout pages
 * If the cart is empty, redirects to the cart page with a notification
 */
export const cartCheckResolver: ResolveFn<Observable<boolean>> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const cartState = inject(CartStateService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);
  const languageService = inject(LanguageService);
  const translateService = inject(TranslateService);

  // Always fetch the latest cart data first
  return cartState.fetchCart().pipe(
    take(1),
    switchMap(() => {
      // Check if cart is empty
      const isEmpty = cartState.isEmpty();

      if (isEmpty) {
        // Get the current language to construct the redirect URL
        return languageService.getLanguage().pipe(
          take(1),
          map((lang) => {
            // Show translated notification
            const title = translateService.instant(
              'cart.notifications.empty_cart_checkout.title'
            );
            const message = translateService.instant(
              'cart.notifications.empty_cart_checkout.message'
            );

            notificationService.info(title, message);

            // Redirect to cart page
            router.navigate(['/', lang, 'cart']);
            return false; // Prevent navigation to checkout
          })
        );
      }

      // Cart has items, allow navigation
      return of(true);
    })
  );
};
