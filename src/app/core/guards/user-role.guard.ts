import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { LanguageService } from '@core/services/lang/language.service';
import { map } from 'rxjs/operators';

export const userRoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const lang = inject(LanguageService);
  const router = inject(Router);

  const userRole = authService.getUserRole();

  if (userRole === 'commercial-user') {
    return true;
  } else {
    // return observable that emits a UrlTree for redirection
    return lang.getLanguage().pipe(
      map((language) => {
        return router.createUrlTree(['/', language]);
      })
    );
  }
};
