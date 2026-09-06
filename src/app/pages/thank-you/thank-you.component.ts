import {
  animate,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageService } from '@core/services/lang/language.service';
import { ThankYouStateService } from '@core/services/thank-you/thank-you-state.service';
import { TranslateModule } from '@ngx-translate/core';
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
export class ThankYouComponent implements OnInit, OnDestroy {
  private _thankYouState = inject(ThankYouStateService);
  private _languageService = inject(LanguageService);
  private _router = inject(Router);

  orderData = this._thankYouState.orderData;
  currentLang = 'ar';

  ngOnInit(): void {
    this._languageService
      .getLanguage()
      .pipe(take(1))
      .subscribe((lang) => {
        this.currentLang = lang || 'ar';
      });
  }

  /**
   * Navigate back to shopping page
   */
  continueShopping(): void {
    this._router.navigate(['/', this.currentLang, 'shopping']);
  }

  /**
   * Navigate back to home page
   */
  goHome(): void {
    this._router.navigate(['/', this.currentLang]);
  }

  ngOnDestroy(): void {
    this._thankYouState.clearSubmittedOrder();
  }
}
