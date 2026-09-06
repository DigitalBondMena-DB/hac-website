import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LanguageService } from '@core/services/lang/language.service';
import { ThankYouStateService } from '@core/services/thank-you/thank-you-state.service';
import { map, take } from 'rxjs/operators';

export const thankYouGuard: CanActivateFn = (route, state) => {
  const thankYouState = inject(ThankYouStateService);
  const langService = inject(LanguageService);
  const router = inject(Router);

  if (thankYouState.hasSubmittedOrder()) {
    return true;
  }

  // Redirect to home if user tries to access /thankYou directly without submission
  return langService.getLanguage().pipe(
    take(1),
    map((lang) => router.createUrlTree(['/', lang]))
  );
};
