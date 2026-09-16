import {
  animate,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule, Location } from '@angular/common';
import { Component, computed, OnInit, inject } from '@angular/core';
import { Meta, DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { LanguageService } from '@core/services/lang/language.service';
import { ThankYouStateService } from '@core/services/thank-you/thank-you-state.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';

@Component({
  selector: 'app-thank-you',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(16px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.92)' }),
        animate('350ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
  ],
})
export class ThankYouComponent implements OnInit {
  private _thankYouState = inject(ThankYouStateService);
  private _languageService = inject(LanguageService);
  private _translateService = inject(TranslateService);
  private _router = inject(Router);
  private _location = inject(Location);
  private _meta = inject(Meta);
  private _sanitizer = inject(DomSanitizer);

  orderData = this._thankYouState.orderData;
  safeDriveFileUrl = computed(() => {
    const url = this.orderData()?.drive_file_url;

    return url ? this._sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });

  get currentLang(): string {
    return this._translateService.currentLang || 'ar';
  }

  ngOnInit(): void {
    this._meta.updateTag({
      name: 'robots',
      content: 'noindex, nofollow',
    });
    this._meta.updateTag({
      name: 'googlebot',
      content: 'noindex, nofollow',
    });

    this._languageService
      .getLanguage()
      .pipe(take(1))
      .subscribe((lang) => {
        if (lang) {
          this._translateService.use(lang);
        }
      });
  }

  /**
   * Switch language between Arabic and English on Thank You page
   */
  switchLanguage(lang: 'ar' | 'en'): void {
    if (this.currentLang === lang) return;
    this._router.navigate(['/', lang, 'thankYou']).then(() => {
      this._translateService.use(lang);
    });
  }

  /**
   * Return to the product that the user came from
   */
  backToProduct(): void {
    const slug = this.orderData()?.product_slug;
    if (slug) {
      this._router.navigate(['/', this.currentLang, 'product-details', slug]);
    } else {
      this._location.back();
    }
  }
}


