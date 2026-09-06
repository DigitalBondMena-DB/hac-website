import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { LanguageService } from '../services/lang/language.service';

export const publicGuard: CanActivateFn = () => {
  const router = inject(Router);
  const languageService = inject(LanguageService);
  const platformId = inject(PLATFORM_ID);

  // Only check localStorage in browser environment
  if (isPlatformBrowser(platformId)) {
    // Fast check - if token exists, redirect to home
    if (localStorage.getItem('auth_token') != null) {
      return languageService
        .getLanguage()
        .pipe(map((lang) => router.createUrlTree(['/', lang])));
    }
  }

  // No token or server-side, allow access to login/register
  return true;
};
