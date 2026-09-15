import { DOCUMENT, Location } from '@angular/common';
import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RoutesRecognized,
} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private selectedLanguage$: BehaviorSubject<string>;
  private isArabic$: BehaviorSubject<boolean>;
  private renderer: Renderer2;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private title: Title,
    private location: Location,
    rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document
  ) {
    // Create a Renderer2 instance for safe DOM manipulation (SSR & Client)
    this.renderer = rendererFactory.createRenderer(null, null);

    let initialLang = 'ar';
    
    // location.path() works securely on both SSR and Client
    const url = this.location.path() || this.document.location?.pathname || '';
    
    if (
      url.includes('/en/') ||
      url.endsWith('/en') ||
      url.includes('#/en')
    ) {
      initialLang = 'en';
    }

    this.selectedLanguage$ = new BehaviorSubject<string>(initialLang);
    this.isArabic$ = new BehaviorSubject<boolean>(initialLang === 'ar');

    // Apply language & direction securely
    this.setHtmlLangAndDir(initialLang);
    this.translate.use(initialLang);

    this.router.events
      .pipe(
        filter(
          (event): event is RoutesRecognized | NavigationEnd =>
            event instanceof RoutesRecognized ||
            event instanceof NavigationEnd
        )
      )
      .subscribe((event) => {
        let routeLang: string | null | undefined = null;
        if (event instanceof RoutesRecognized) {
          routeLang = event.state.root.firstChild?.paramMap.get('lang');
        } else if (event instanceof NavigationEnd) {
          routeLang = this.route.snapshot.firstChild?.paramMap.get('lang');
        }

        if (routeLang && (routeLang === 'ar' || routeLang === 'en')) {
          if (this.selectedLanguage$.value !== routeLang) {
            this.selectedLanguage$.next(routeLang);
            this.isArabic$.next(routeLang === 'ar');

            // Apply language & direction securely
            this.setHtmlLangAndDir(routeLang);
            this.translate.use(routeLang);
          }
        }

        if (event instanceof NavigationEnd) {
          // Set dynamic title Routes using data.titleKey
          let currentRoute = this.route.root;
          while (currentRoute.firstChild) {
            currentRoute = currentRoute.firstChild;
          }

          const titleKey = currentRoute.snapshot.data['titleKey'];
          if (titleKey) {
            this.translate.get(titleKey).subscribe((translatedTitle) => {
              const finalTitle = translatedTitle.toUpperCase();
              this.title.setTitle(finalTitle);
            });
          }
        }
      });
  }

  private setHtmlLangAndDir(lang: string) {
    const htmlTag = this.document.documentElement;
    this.renderer.setAttribute(htmlTag, 'lang', lang);
    this.renderer.setAttribute(htmlTag, 'dir', lang === 'ar' ? 'rtl' : 'ltr');
  }

  getLanguage() {
    return this.selectedLanguage$.asObservable();
  }

  getIsArabic() {
    return this.isArabic$.asObservable();
  }

  changeLanguage(lang: string, currentUrl: string) {
    // Remove query parameters if they exist
    const cleanUrl = currentUrl.includes('?')
      ? currentUrl.split('?')[0]
      : currentUrl;

    // Split the URL and replace the language code
    const segments = cleanUrl.split('/');
    if (segments.length > 1) {
      segments[1] = lang;
    }

    // Navigate to the new language URL without query parameters
    this.router.navigate([segments.join('/')]);
    this.translate.use(lang);
  }
}
