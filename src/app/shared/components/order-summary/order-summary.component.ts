import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IAddress } from '@core/interfaces/user.interface';
import { CartStateService } from '@core/services/cart/cart-state.service';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink],
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.css'],
})
export class OrderSummaryComponent {
  @Input() selectedAddress: IAddress | null = null;
  @Input() showDeliveryFee = true;
  @Input() COD = false;
  @Input() showActionButton = true;
  @Input() actionButtonText = 'summary.complete-the-order';
  @Input() nextRoute = '';

  private _cartState = inject(CartStateService);
  languageService = inject(LanguageService);

  // Cart data
  order = this._cartState.order;
  orderDetails = this._cartState.orderDetails;

  // Observable for current language
  currentLang$: Observable<string> = this.languageService.getLanguage();

  /**
   * Format price to show decimal places correctly
   * Handles null, undefined, string, and number values safely
   */
  formatPrice(price: number | string | undefined | null): string {
    if (price === undefined || price === null) return '0.00';

    try {
      const numPrice = typeof price === 'string' ? parseFloat(price) : price;
      // Check if numPrice is NaN or null before calling toFixed
      if (numPrice === null || isNaN(numPrice)) return '0.00';
      return numPrice.toFixed(2);
    } catch (error) {
      console.error('Error formatting price:', error);
      return '0.00';
    }
  }
}
