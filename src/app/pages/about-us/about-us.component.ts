import { AsyncPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { CommonService } from '@core/services/common/common.service';
import { API_CONFIG } from '@core/services/conf/api.config';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { AboutSharedComponent } from '@shared/components/about-shared/about-shared.component';
import { BannerComponent } from '@shared/components/banner/banner.component';
import { BigCardOfferComponent } from '@shared/components/big-card-offer/big-card-offer.component';
import { AboutSkeletonComponent } from '@shared/components/skeleton/about-skeleton/about-skeleton.component';
import { forkJoin, of } from 'rxjs';
import { CardComponent } from './components/card/card.component';
import { FAQComponent } from './components/faq/faq.component';
import { ServiceCardComponent } from './components/service-card/service-card.component';
import { IAboutData, IAboutUsOne, IAboutUsTwo } from './res/about-us.interface';
import { AboutUsService } from './res/about-us.service';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [
    AboutSharedComponent,
    CardComponent,
    BannerComponent,
    ServiceCardComponent,
    BigCardOfferComponent,
    FAQComponent,
    TranslateModule,
    CustomTranslatePipe,
    RouterLink,
    AsyncPipe,
    AboutSkeletonComponent,
  ],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css',
})
export class AboutUsComponent implements OnInit {
  private aboutUsService = inject(AboutUsService);
  private languageService = inject(LanguageService);
  private commonService = inject(CommonService);

  currentLang$ = this.languageService.getLanguage();
  API_CONFIG = API_CONFIG.BASE_URL_IMAGE;
  isLoading = signal(true);

  // Access cached home data
  private homeDataSignal = this.commonService.homeData;

  // Use computed signals to extract what we need from home data
  aboutUsOne = computed(() => {
    const homeData = this.homeDataSignal();
    if (homeData) {
      return {
        counters: homeData.counters || [],
        breaks: homeData.breaks || [],
        offers: homeData.offers || [],
        aboutUs: homeData.aboutUs || {},
      } as IAboutUsOne;
    }
    return {
      counters: [],
      breaks: [],
      offers: [],
      aboutUs: {} as IAboutData,
    } as IAboutUsOne;
  });

  // Initialize with default values to prevent undefined errors
  aboutUsTwo = signal<IAboutUsTwo>({
    faqs: [],
    features: [],
    aboutdata: {
      id: 0,
      en_meta_title: '',
      ar_meta_title: '',
      en_meta_text: '',
      ar_meta_text: '',
      main_image: '',
      active_status: 0,
      en_footer_for_text: '',
      ar_footer_for_text: '',
      en_mission_text: '',
      ar_mission_text: '',
      en_vision_text: '',
      ar_vision_text: '',
      en_main_title: '',
      ar_main_title: '',
      en_main_text: '',
      ar_main_text: '',
      created_at: '',
      updated_at: '',
    },
  });

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Main method to load all required data
   * This ensures we only make the necessary API calls once
   */
  private loadData(): void {
    // Prepare observables for both data sources
    const homeData$ = this.getHomeData();
    const aboutData$ = this.aboutUsService.getAboutData();

    // Use forkJoin to load both in parallel
    forkJoin({
      homeData: homeData$,
      aboutData: aboutData$,
    }).subscribe({
      next: (result) => {
        // aboutUsOne is handled by the computed signal
        // We just need to set aboutUsTwo
        this.aboutUsTwo.set(result.aboutData);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Get home data from cache or API
   * This leverages the caching mechanism in CommonService
   */
  private getHomeData() {
    // If home data is already cached, return it as an observable
    if (this.homeDataSignal()) {
      return of(this.homeDataSignal());
    }

    // Otherwise get it from the API (this will cache it in CommonService)
    return this.commonService.getHomeData();
  }
}
