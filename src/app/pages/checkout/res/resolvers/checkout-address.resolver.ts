import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { NotificationService } from '@core/services/notification/notification.service';
import { UserService } from '@core/services/user/user.service';
import { Observable, catchError, of } from 'rxjs';

/**
 * Resolver to prefetch user address information before the checkout-address component is loaded
 * This ensures the user data is available immediately when navigating to the checkout address page
 */
export const checkoutAddressResolver: ResolveFn<Observable<any>> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const userService = inject(UserService);
  const notificationService = inject(NotificationService);

  return userService.getUserInfo().pipe(
    catchError((error) => {
      console.error('Error loading user address data:', error);

      // Show notification about error loading user data
      notificationService.error(
        'checkout.address.user_info_error',
        'checkout.address.error_title'
      );
      // Return empty observable to continue navigation
      return of(null);
    })
  );
};
