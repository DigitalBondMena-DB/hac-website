import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideRouter,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';

import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { provideTranslation } from '@core/i18n/i18n.config';
import { loadingInterceptor } from '@core/interceptors/loading.interceptor';
import { TranslateModule } from '@ngx-translate/core';
import { initFlowbite } from 'flowbite-angular/core';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    initFlowbite(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
      withViewTransitions({ skipInitialTransition: true })
    ),
    provideClientHydration(withEventReplay()),
    importProvidersFrom(
      TranslateModule.forRoot(provideTranslation()),
      CarouselModule
    ),
    provideAnimations(),
    provideHttpClient(withFetch(), withInterceptors([loadingInterceptor])),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      closeButton: true,
      progressBar: true,
    }),
  ],
};
