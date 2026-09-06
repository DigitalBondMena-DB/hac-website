import { isRamadanMonth } from './core/services/conf/api.config';
import {
  AsyncPipe,
  CommonModule,
  DOCUMENT,
  isPlatformBrowser,
} from '@angular/common';
import {
  Component,
  Inject,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  Renderer2,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgxSpinnerModule } from 'ngx-spinner';
import { filter, map, Subscription } from 'rxjs';
import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LanguageService } from './core/services/lang/language.service';
import { AlertComponent } from './shared/alert/alert.component';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { RamadanLoaderComponent } from '@shared/components/ramadan-loader/ramadan-loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    TranslateModule,
    NavbarComponent,
    FooterComponent,
    AlertComponent,
    NotificationComponent,
    NgxSpinnerModule,
    RouterLink,
    AsyncPipe,
    RamadanLoaderComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private titleService = inject(Title);
  private meta = inject(Meta);
  private translate = inject(TranslateService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private _languageService = inject(LanguageService);
  private renderer = inject(Renderer2);
  private langSubscription!: Subscription;
  private routerSubscription!: Subscription;

  // Flag to ensure meta tags are only updated once per navigation
  private metaTagsUpdated = false;
  isRamadanMonth = isRamadanMonth;
  currentLang$ = this._languageService.getLanguage();

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.translate.addLangs(['ar', 'en']);
    this.translate.setDefaultLang('ar');
    this.translate.use('ar');
  }

  ngOnInit(): void {
    // Initialize meta title/description on first load
    this.updateMetaTags();
    this.addSchema();
    // Subscribe to language changes
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      // Reset flag when language changes
      this.metaTagsUpdated = false;
      this.addSchema();
      // Only update meta tags if not on a dynamic meta page
      const currentUrl = this.router.url;
      const isDynamicMetaPage =
        currentUrl.includes('/product-details/') ||
        currentUrl.includes('/blog/');
      if (!isDynamicMetaPage) {
        this.updateMetaTags();
      }
    });

    // Subscribe to route changes
    this.routerSubscription = this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          let child = this.router.routerState.root;
          while (child.firstChild) {
            child = child.firstChild;
          }
          return child.snapshot.data;
        }),
      )
      .subscribe((data) => {
        // Reset flag on navigation
        this.metaTagsUpdated = false;
        this.setMetaTags(data);
      });
  }

  private updateMetaTags() {
    const currentRoute = this.router.routerState.snapshot.root;
    let child = currentRoute;
    while (child.firstChild) {
      child = child.firstChild;
    }
    this.setMetaTags(child.data);
  }

  /**
   * Set meta tags for SEO and social sharing following the same pattern as other components
   */
  private setMetaTags(data: any) {
    if (this.metaTagsUpdated) return;

    // Check if this is a page that handles its own dynamic meta tags
    const currentUrl = this.router.url;
    const isDynamicMetaPage =
      currentUrl.includes('/product-details/') || currentUrl.includes('/blog/');

    const currentLang = this.translate.currentLang;

    // Only update title and description meta tags for non-dynamic pages
    if (!isDynamicMetaPage) {
      // Remove existing meta tags first
      this.meta.removeTag("name='title'");
      this.meta.removeTag("property='og:title'");
      this.meta.removeTag("property='twitter:title'");
      this.meta.removeTag("name='description'");
      this.meta.removeTag("property='og:description'");
      this.meta.removeTag("property='twitter:description'");
      this.meta.removeTag("property='og:image'");
      this.meta.removeTag("property='twitter:image'");
      this.meta.removeTag("name='keywords'");

      // Handle title meta tags
      if (data['title']) {
        this.translate.get(data['title']).subscribe((translatedTitle) => {
          if (translatedTitle && translatedTitle.trim() !== '') {
            // Set document title
            this.titleService.setTitle(translatedTitle);

            // Remove any fallback title that might have been set by the router
            if (this.isBrowser) {
              const titleElement = this.document.querySelector('title');
              if (titleElement) {
                titleElement.textContent = translatedTitle;
              }
            }

            // Set meta tags for social sharing and SEO
            this.meta.updateTag({
              name: 'title',
              content: translatedTitle,
            });
            this.meta.updateTag({
              property: 'og:title',
              content: translatedTitle,
            });
            this.meta.updateTag({
              property: 'twitter:title',
              content: translatedTitle,
            });
          }
        });
      }

      // Handle description meta tags
      if (data['description']) {
        this.translate.get(data['description']).subscribe((translatedDesc) => {
          if (translatedDesc && translatedDesc.trim() !== '') {
            // Remove old description tags
            this.meta.removeTag("name='description'");
            this.meta.removeTag("property='og:description'");
            this.meta.removeTag("property='twitter:description'");

            // Add updated meta description tags
            this.meta.updateTag({
              name: 'description',
              content: translatedDesc,
            });
            this.meta.updateTag({
              property: 'og:description',
              content: translatedDesc,
            });
            this.meta.updateTag({
              property: 'twitter:description',
              content: translatedDesc,
            });
          }
        });
      }

      // Add meta keywords only if Arabic
      if (currentLang === 'ar') {
        this.meta.updateTag({
          name: 'keywords',
          content: 'وجهتك المثالية للجمال ومستحضرات التجميل',
        });
      }

      // Set default image meta tags if no specific image is provided
      const defaultImageUrl =
        'https://digitalbondmena.com/mesoshop/uploads/about/1748785929orPXHndjzd.webp';
      this.meta.updateTag({
        property: 'og:image',
        content: defaultImageUrl,
      });

      this.meta.updateTag({
        property: 'twitter:image',
        content: defaultImageUrl,
      });
    }

    // Always handle canonical and alternate URLs regardless of page type
    this.updateSEOLinks();

    // Mark meta tags as updated to prevent multiple updates
    this.metaTagsUpdated = true;
  }

  /**
   * Update SEO-related links (canonical, alternate, og:url)
   */
  private updateSEOLinks(): void {
    const currentLang = this.translate.currentLang;
    const currentPath = this.router.url.replace(/^\/(ar|en)/, '');
    const canonicalUrl = `https://haccosmetics.com/${currentLang}${currentPath}`;
    const alternateLang = currentLang === 'ar' ? 'en' : 'ar';
    const alternateUrl = `https://haccosmetics.com/${alternateLang}${currentPath}`;
    // Remove old canonical & alternate links first
    const head = this.document.head;
    head
      .querySelectorAll(`link[rel='canonical'], link[rel='alternate']`)
      .forEach((el) => el.remove());

    // Insert canonical and alternate links at the top of <head>
    // Use existing helper methods that insert the links before other head nodes
    try {
      this.insertAlternateFirst(
        currentLang,
        canonicalUrl,
        alternateLang,
        alternateUrl,
      );
      this.insertCanonicalFirst(canonicalUrl);
    } catch (e) {
      // Fallback: if helpers fail, append them (non-fatal)
      const canonical = this.document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      canonical.setAttribute('href', canonicalUrl);
      head.appendChild(canonical);

      const currentAlt = this.document.createElement('link');
      currentAlt.setAttribute('rel', 'alternate');
      currentAlt.setAttribute('hreflang', currentLang);
      currentAlt.setAttribute('href', canonicalUrl);
      head.appendChild(currentAlt);

      const otherAlt = this.document.createElement('link');
      otherAlt.setAttribute('rel', 'alternate');
      otherAlt.setAttribute('hreflang', alternateLang);
      otherAlt.setAttribute('href', alternateUrl);
      head.appendChild(otherAlt);
    }

    // og:url (important for social preview)
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
  }

  private insertCanonicalFirst(url: string): void {
    const head = this.document.head;

    head.querySelectorAll(`link[rel='canonical']`).forEach((el) => el.remove());

    const canonical = this.document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', url);

    head.insertBefore(canonical, head.firstChild);
  }
  private insertAlternateFirst(
    currentLang: string,
    currentUrl: string,
    altLang: string,
    altUrl: string,
  ): void {
    const head = this.document.head;

    head.querySelectorAll(`link[rel='alternate']`).forEach((el) => el.remove());

    // النسخة الحالية
    const current = this.document.createElement('link');
    current.setAttribute('rel', 'alternate');
    current.setAttribute('hreflang', currentLang + '-SA');
    current.setAttribute('href', currentUrl);
    head.insertBefore(current, head.firstChild);

    // النسخة الأخرى
    const other = this.document.createElement('link');
    other.setAttribute('rel', 'alternate');
    other.setAttribute('hreflang', altLang + '-SA');
    other.setAttribute('href', altUrl);
    head.insertBefore(other, head.firstChild);

    // x-default → يشير للنسخة العربية (مرجعية البحث)
    const xDefault = this.document.createElement('link');
    xDefault.setAttribute('rel', 'alternate');
    xDefault.setAttribute('hreflang', 'x-default');
    xDefault.setAttribute('href', currentUrl.replace(/\/(ar|en)/, '/ar'));
    head.insertBefore(xDefault, head.firstChild);
  }
  private updateCanonicalLink(url: string): void {
    // Remove any existing canonical link
    const existingCanonical = this.document.querySelector(
      'link[rel="canonical"]',
    );
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Create and append new canonical link
    const canonical = this.document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', url);
    this.document.head.prepend(canonical);
  }
  private addSchema(): void {
    const old = this.document.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    old.forEach((o) => o.remove());

    const currentLang = this.translate.currentLang || 'ar';

    const schema =
      currentLang === 'ar' ? this.getArabicSchema() : this.getEnglishSchema();

    const script = this.renderer.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);

    this.document.head.appendChild(script);
  }
  private getEnglishSchema(): Object {
    return {
      '@context': 'https://schema.org',
      '@type': 'PublicHealth',
      name: 'Hac Cosmetics',
      image: 'https://haccosmetics.com/images/navbar/2.webp',
      '@id': 'https://haccosmetics.com/en#brand', //
      url: 'https://haccosmetics.com/en',
      inLanguage: 'en', //
      telephone: '00966545372774',
      priceRange: '400 SR',
      address: {
        '@type': 'PostalAddress',
        streetAddress:
          'Riyadh Sulaymaniyah RHOB6847, 6847 Al Olaya, 2567, Al Olaya',
        addressLocality: 'Riyadh',
        postalCode: '00966',
        addressCountry: 'SA',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 24.695087,
        longitude: 46.6806472,
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '00:00',
        closes: '23:59',
      },
      sameAs: [
        'https://www.facebook.com/people/HAC/61573515937163/',
        'https://www.instagram.com/hac.cosmeceuticals/',
        'https://haccosmetics.com/ar',
      ],
    };
  }
  private getArabicSchema(): Object {
    return {
      '@context': 'https://schema.org',
      '@type': 'PublicHealth',
      name: 'هاك للمستحضرات التجميلية', //
      image: 'https://haccosmetics.com/images/navbar/2.webp',
      '@id': 'https://haccosmetics.com/ar#brand', //
      url: 'https://haccosmetics.com/ar',
      inLanguage: 'ar', //
      telephone: '00966545372774',
      priceRange: '400 ر.س', //
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'الرياض السليمانية RHOB6847، 6847 العليا، 2567، العليا', //
        addressLocality: 'الرياض', //
        postalCode: '00966',
        addressCountry: 'SA',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 24.695087,
        longitude: 46.6806472,
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'الاثنين', //
          'الثلاثاء',
          'الأربعاء',
          'الخميس',
          'الجمعة',
          'السبت',
          'الأحد',
        ],
        opens: '00:00',
        closes: '23:59',
      },
      sameAs: [
        'https://www.facebook.com/people/HAC/61573515937163/',
        'https://www.instagram.com/hac.cosmeceuticals/',
        'https://haccosmetics.com/en',
      ],
    };
  }
  private updateAlternateLinks(currentUrl: string, alternateUrl: string): void {
    // Remove existing alternate links
    const existingAlternates = this.document.querySelectorAll(
      'link[rel="alternate"]',
    );
    existingAlternates.forEach((link) => link.remove());
    const currentLang = this.translate.currentLang;

    // Add alternate language link
    const alternateLang = currentLang === 'ar' ? 'en-SA' : 'ar-SA';
    const altLink = this.document.createElement('link');
    altLink.setAttribute('rel', 'alternate');
    altLink.setAttribute('hreflang', alternateLang);
    altLink.setAttribute('href', alternateUrl);
    this.document.head.prepend(altLink);

    // Add current language alternate
    const currentAlt = this.document.createElement('link');
    currentAlt.setAttribute('rel', 'alternate');
    currentAlt.setAttribute('hreflang', currentLang + '-SA');
    currentAlt.setAttribute('href', currentUrl);
    this.document.head.prepend(currentAlt);

    // Add x-default (pointing to Arabic version)
    const xDefault = this.document.createElement('link');
    xDefault.setAttribute('rel', 'alternate');
    xDefault.setAttribute('hreflang', 'x-default');
    xDefault.setAttribute('href', currentUrl.replace(/\/(ar|en)/, '/ar'));
    this.document.head.prepend(xDefault);
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }

    // Reset meta tags updated flag
    this.metaTagsUpdated = false;
  }
}
