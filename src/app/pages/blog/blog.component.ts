import {
  AsyncPipe,
  DatePipe,
  DOCUMENT,
  isPlatformBrowser,
  isPlatformServer,
} from '@angular/common';
import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
} from '@angular/router';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { SafeHtmlComponent } from '@core/safe-html/safe-html.component';
import { ApiService } from '@core/services/conf/api.service';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SectionHeadingComponent } from '@shared/components/section-heading/section-heading.component';
import { TalentImageCardComponent } from '@shared/components/talent-image-card/talent-image-card.component';
import { debounceTime, filter, Subscription } from 'rxjs';
import { RelatedBlogsComponent } from '../articles/components/related-blogs/related-blogs.component';
import { IBlog } from '../articles/res/interfaces/blogs';
import { ISingleBlog } from '../articles/res/interfaces/singleBlog';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [
    TalentImageCardComponent,
    SectionHeadingComponent,
    TranslateModule,
    RelatedBlogsComponent,
    SafeHtmlComponent,
    CustomTranslatePipe,
    AsyncPipe,
    DatePipe,
    RouterLink,
    ImageUrlDirective,
  ],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css',
})
export class BlogComponent implements OnInit, OnDestroy {
  _translate = inject(TranslateService);
  _languageService = inject(LanguageService);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  _apiService = inject(ApiService);
  _titleService = inject(Title);
  _metaService = inject(Meta);

  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private isBrowser = isPlatformBrowser(this.platformId);

  currentLanguage$ = inject(LanguageService).getLanguage();

  titles: string[] = [];
  blog: IBlog = {} as IBlog;
  relatedBlogs: IBlog[] = [];
  private subscriptions: Subscription[] = [];
  currentPageUrl = '';

  constructor() {}

  private decodeSlugFromUrl(slug: string): string {
    if (!slug) return '';
    try {
      return decodeURIComponent(slug);
    } catch (error) {
      console.warn('Failed to decode slug:', slug, error);
      return slug;
    }
  }

  private buildBlogUrl(blog: IBlog, lang: string): string {
    const rawSlug = lang === 'ar' ? blog.ar_slug : blog.en_slug;
    const decodedSlug = rawSlug ? this.decodeSlugFromUrl(rawSlug) : '';
    return `https://haccosmetics.com/${lang}/blog/${decodedSlug}`;
  }

  ngOnInit() {
    if (this.isBrowser || isPlatformServer(this.platformId)) {
      this.currentPageUrl = this.document.location?.href || '';
    }

    const routeSub = this._route.data.subscribe({
      next: (data) => {
        const blogData = data['blogData'] as ISingleBlog;

        if (blogData) {
          this.blog = blogData.blog;
          this.relatedBlogs = blogData.blogs || [];

          // Update meta tags initially (runs on SSR too)
          this.handleMeta(this.blog);

          // Subscribe to language changes to navigate to correct slug (browser only)
          const translateSub = this._translate.onLangChange
            .pipe(debounceTime(100))
            .subscribe((event) => {
              const newLang = event.lang;
              const rawSlug =
                newLang === 'ar' ? this.blog.ar_slug : this.blog.en_slug;

              if (rawSlug && rawSlug.trim()) {
                const decodedSlug = this.decodeSlugFromUrl(rawSlug);

                this._router
                  .navigate(['/', newLang, 'blog', decodedSlug])
                  .then(() => {
                    this.updateCurrentPageUrl();
                    this.handleMeta(this.blog);
                  });
              } else {
                this.handleMeta(this.blog);
              }
            });

          this.subscriptions.push(translateSub);

          // Subscribe to router events to ensure meta updated after navigation
          const routerSub = this._router.events
            .pipe(
              filter((event) => event instanceof NavigationEnd),
              debounceTime(100)
            )
            .subscribe(() => {
              this.updateCurrentPageUrl();
              this.handleMeta(this.blog);
            });

          this.subscriptions.push(routerSub);
        } else {
          console.error('No blog data available from resolver');
        }
      },
      error: (err) => {
        console.error('Error getting resolved blog data:', err);
      },
    });

    this.subscriptions.push(routeSub);
  }

  private updateCurrentPageUrl(): void {
    try {
      this.currentPageUrl =
        this.isBrowser || isPlatformServer(this.platformId)
          ? this.document.location?.href || ''
          : this.buildBlogUrl(this.blog, this._translate.currentLang || 'ar');
    } catch {
      this.currentPageUrl = this.buildBlogUrl(
        this.blog,
        this._translate.currentLang || 'ar'
      );
    }
  }

  private handleMeta(blog: IBlog): void {
    if (!blog) return;

    const currentLang = this._translate.currentLang || 'ar';
    const title =
      currentLang === 'en' ? blog.en_meta_title : blog.ar_meta_title;
    const description =
      currentLang === 'en' ? blog.en_meta_text : blog.ar_meta_text;
    const imageUrl = blog.main_image
      ? `https://digitalbondmena.com/mesoshop/${blog.main_image}`
      : '';
    const url = this.buildBlogUrl(blog, currentLang);

    // Preload image only in browser
    if (this.isBrowser || (isPlatformServer(this.platformId) && imageUrl)) {
      try {
        const preloadLink = this.document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = 'image';
        preloadLink.href = imageUrl;
        (preloadLink as any).fetchPriority = 'high';
        this.document.head.appendChild(preloadLink);
      } catch (e) {
        console.warn('Preload link failed:', e);
      }
    }

    // Remove existing meta tags that we control
    this.removeMetaTags();

    // Title & Description (Meta service works on SSR)
    if (title) {
      this._titleService.setTitle(title);
      this._metaService.updateTag({
        name: 'description',
        content: description || '',
      });
    }

    // Open Graph
    if (title)
      this._metaService.updateTag({ property: 'og:title', content: title });
    if (description)
      this._metaService.updateTag({
        property: 'og:description',
        content: description,
      });
    if (imageUrl)
      this._metaService.updateTag({ property: 'og:image', content: imageUrl });
    this._metaService.updateTag({ property: 'og:url', content: url });
    this._metaService.updateTag({ property: 'og:type', content: 'article' });

    // Twitter
    if (title)
      this._metaService.updateTag({ name: 'twitter:title', content: title });
    if (description)
      this._metaService.updateTag({
        name: 'twitter:description',
        content: description,
      });
    if (imageUrl)
      this._metaService.updateTag({ name: 'twitter:image', content: imageUrl });
    this._metaService.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this._metaService.updateTag({ name: 'twitter:url', content: url });

    // Update alternate links and canonical using document (works SSR too)
    this.updateAlternateLinks(blog);
    this.updateCanonicalUrl(blog);
  }

  private updateAlternateLinks(blog: IBlog): void {
    if (!blog) return;

    // Remove all existing alternate links first (works in SSR too)
    try {
      const existingAlts = this.document.querySelectorAll(
        'link[rel="alternate"]'
      );
      existingAlts.forEach((link: Element) => link.remove());
    } catch (e) {
      // ignore
    }

    const currentLang = this._translate.currentLang || 'ar';
    const alternateLang = currentLang === 'ar' ? 'en' : 'ar';

    const hreflangLinks = [
      {
        hreflang: 'x-default',
        href: this.buildBlogUrl(blog, 'ar'),
        slug: blog.ar_slug,
      },
      {
        hreflang: currentLang,
        href: this.buildBlogUrl(blog, currentLang),
        slug: currentLang === 'ar' ? blog.ar_slug : blog.en_slug,
      },
      {
        hreflang: alternateLang,
        href: this.buildBlogUrl(blog, alternateLang),
        slug: alternateLang === 'ar' ? blog.ar_slug : blog.en_slug,
      },
    ];

    hreflangLinks.forEach(({ hreflang, href, slug }) => {
      const shouldAdd =
        hreflang === 'x-default'
          ? !!(blog.ar_slug && blog.ar_slug.trim())
          : !!(slug && slug.trim());
      if (shouldAdd) {
        try {
          const altLink = this.document.createElement('link');
          altLink.setAttribute('rel', 'alternate');
          altLink.setAttribute('hreflang', hreflang);
          altLink.setAttribute('href', href);
          this.document.head.appendChild(altLink);
        } catch (e) {
          console.warn('Failed to add alternate link', hreflang, e);
        }
      }
    });
  }

  private updateCanonicalUrl(blog: IBlog): void {
    if (!blog) return;

    const currentLang = this._translate.currentLang || 'ar';
    const canonicalUrl = this.buildBlogUrl(blog, currentLang);

    try {
      // Remove existing canonical(s)
      const existing = this.document.querySelectorAll('link[rel="canonical"]');
      existing.forEach((el: Element) => el.remove());

      // Add canonical
      const link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', canonicalUrl);
      this.document.head.appendChild(link);
    } catch (e) {
      console.warn('Failed to set canonical', e);
    }
  }

  private removeMetaTags(): void {
    const metaTagsToRemove = [
      'description',
      'og:title',
      'og:description',
      'og:image',
      'og:url',
      'og:type',
      'twitter:title',
      'twitter:description',
      'twitter:image',
      'twitter:card',
      'twitter:url',
    ];

    metaTagsToRemove.forEach((tag) => {
      try {
        this._metaService.removeTag(`name='${tag}'`);
        this._metaService.removeTag(`property='${tag}'`);
      } catch (e) {
        // ignore
      }
    });

    // Also remove any link[rel="canonical"] or link[rel="alternate"] previously injected
    try {
      const existingLinks = this.document.querySelectorAll(
        'link[rel="canonical"], link[rel="alternate"]'
      );
      existingLinks.forEach((l: Element) => l.remove());
    } catch (e) {
      // ignore
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
