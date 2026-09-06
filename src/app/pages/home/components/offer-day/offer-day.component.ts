import { isRamadanMonth } from './../../../../core/services/conf/api.config';
import { AsyncPipe, PercentPipe } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { SafeHtmlComponent } from '@core/safe-html/safe-html.component';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { ArrowButtonComponent } from '@shared/components/arrow-button/arrow-button.component';
import { OfferDaySkeletonComponent } from '@shared/components/skeleton/offer-day-skeleton/offer-day-skeleton.component';
import { Offer, RandomProduct } from '../../res/home.interfaces';

@Component({
  selector: 'app-offer-day',
  standalone: true,
  imports: [
    TranslateModule,
    ArrowButtonComponent,
    PercentPipe,
    CustomTranslatePipe,
    SafeHtmlComponent,
    ImageUrlDirective,
    RouterLink,
    AsyncPipe,
    OfferDaySkeletonComponent,
  ],
  templateUrl: './offer-day.component.html',
  styleUrl: './offer-day.component.css',
})
export class OfferDayComponent {
  isRamadanMonth = isRamadanMonth;
  _languageService = inject(LanguageService);

  currentLang$ = this._languageService.getLanguage();

  isArabic = false;

  // Track loading state - default to true until data is loaded
  @Input() isLoading = true;

  lang = this._languageService.getIsArabic().subscribe((isArabic) => {
    this.isArabic = isArabic;
  });

  @Input({ required: true }) randomProducts: RandomProduct[] = [];
  @Input({ required: true }) lastOffer: Offer | null = null;

  /**
   * Format text with first two words black and rest white, preserving HTML
   */
  formatRichText(text: string): string {
    if (!text) return '';

    // Strip HTML to count actual words
    const textWithoutHtml = text.replace(/<[^>]*>/g, '');
    const words = textWithoutHtml
      .split(' ')
      .filter((word) => word.trim() !== '');

    if (words.length <= 2) {
      return `<span class="text-black">${text}</span>`;
    }

    // Find the first two words in the original text
    let tempText = text;
    let wordCount = 0;
    let firstTwoWordsEndIndex = 0;

    for (let i = 0; i < tempText.length; i++) {
      // Skip HTML tags
      if (tempText[i] === '<') {
        while (i < tempText.length && tempText[i] !== '>') {
          i++;
        }
        continue;
      }

      // Check if we're at a word boundary (space)
      if (tempText[i] === ' ' && i > 0 && tempText[i - 1] !== '>') {
        wordCount++;
        if (wordCount === 2) {
          firstTwoWordsEndIndex = i;
          break;
        }
      }
    }

    // If we found the split point
    if (firstTwoWordsEndIndex > 0) {
      const firstPart = tempText.substring(0, firstTwoWordsEndIndex);
      const secondPart = tempText.substring(firstTwoWordsEndIndex);
      return `<span class="text-black">${firstPart}</span><span class="text-white">${secondPart}</span>`;
    }

    // Fallback to original text
    return text;
  }
}
