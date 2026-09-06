import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { LanguageService } from '@core/services/lang/language.service';
import { UserService } from '@core/services/user/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { OrderDetailsSkeletonComponent } from '@shared/components/skeleton/order-details-skeleton/order-details-skeleton.component';
import { SafeHtmlComponent } from '../../../../core/safe-html/safe-html.component';
import { ILastOrderResponse } from '../../../profile/components/orders/res/order.interface';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [
    TranslateModule,
    CommonModule,
    ImageUrlDirective,
    TranslateModule,
    CustomTranslatePipe,
    SafeHtmlComponent,

    RouterLink,
    AsyncPipe,
    OrderDetailsSkeletonComponent,
  ],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css',
})
export class OrderDetailsComponent {
  private _userService = inject(UserService);
  private _destroyRef = inject(DestroyRef);

  currentLang$ = inject(LanguageService).getLanguage();
  lastOrder = signal<ILastOrderResponse | null>(null);
  loading = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    this.getLastOrder();
  }

  getLastOrder(): void {
    this.loading.set(true);
    this._userService.getUserLastOrder().subscribe({
      next: (response: ILastOrderResponse) => {
        this.loading.set(false);
        if (response && response.order !== null) {
          this.lastOrder.set(response);
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error?.message || 'Error fetching last order');
        console.error('Error fetching last order:', error);
      },
      complete: () => {
        // Ensure loading is turned off when the subscription completes
        this.loading.set(false);
      },
    });
  }
}
