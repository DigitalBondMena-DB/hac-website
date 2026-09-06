import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AlertService } from '@shared/alert/alert.service';
import { map } from 'rxjs';
import { LanguageService } from '../services/lang/language.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const languageService = inject(LanguageService);
  const alertService = inject(AlertService);
  const platformId = inject(PLATFORM_ID);
  if (isPlatformBrowser(platformId)) {
    // Fast path - just check if token exists
    if (localStorage.getItem('auth_token') != null) {
      // Token exists, let the user through immediately
      // Later components can do proper validation if needed
      return true;
    }
  }

  // Slow path - user not logged in, handle redirect
  return languageService.getLanguage().pipe(
    map((lang) => {
      alertService.showNotification({
        imagePath: '/images/common/unauth.webp',
        translationKeys: {
          title: 'unauth',
        },
      });
      return router.createUrlTree(['/', lang, 'login']);
    })
  );
};
