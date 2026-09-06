import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { NotificationService } from '@core/services/notification/notification.service';
import { UserService } from '@core/services/user/user.service';
import { catchError, of } from 'rxjs';

/**
 * Resolver to prefetch locations data before the checkout-address component is loaded
 */
export const checkoutLocationsResolver: ResolveFn<any> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const userService = inject(UserService);
  const notificationService = inject(NotificationService);

  return userService.getLocations().pipe(
    catchError((error) => {
      console.error('Error loading locations data:', error);

      // Show notification about error loading locations
      notificationService.error(
        'checkout.address.locations_error',
        'checkout.address.error_title'
      );

      // Return empty observable to continue navigation
      return of(null);
    })
  );
};
