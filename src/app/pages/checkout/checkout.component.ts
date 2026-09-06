import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { IAddress } from '@core/interfaces/user.interface';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { CartStateService } from '@core/services/cart/cart-state.service';
import { LanguageService } from '@core/services/lang/language.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { ServiceCardComponent } from '../about-us/components/service-card/service-card.component';
import { IFeatures } from '../contact-us/res/contact-us.interface';
import { ContactUsService } from '../contact-us/res/contact-us.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RouterOutlet,
    ServiceCardComponent,
    CustomTranslatePipe,
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent {
  private _cartStateService = inject(CartStateService);

  private contactUsService = inject(ContactUsService);

  private _notificationService = inject(NotificationService);

  private _router = inject(Router);

  languageService = inject(LanguageService);

  // Use signals from cart state
  features = signal<IFeatures[]>([]);

  order = this._cartStateService.order;

  orderDetails = this._cartStateService.orderDetails;

  loading = false;

  currentLang$: Observable<string> = this.languageService.getLanguage();

  selectedAddress: IAddress | null = null;

  ngOnInit(): void {
    this.getFeatures();
  }
  /**
   * Check if a given route is active
   */
  // isActiveRoute(route: string): boolean {
  //   return this._router.url.includes(route);
  // }

  /**
   * Handle address selection from the address component
   */
  onAddressSelected(address: IAddress): void {
    this.selectedAddress = address;
    if (address) {
      this._notificationService.success(
        'checkout.address_selected',
        'checkout.success'
      );
    }
  }

  /**
   * Navigate to the next step
   */
  // goToNextStep(currentStep: string): void {
  //   this.languageService.getLanguage().subscribe((lang) => {
  //     if (currentStep === 'checkout-address') {
  //       this._router.navigate(['/', lang, 'checkout', 'order-summary']);
  //     } else if (currentStep === 'order-summary') {
  //       this._router.navigate(['/', lang, 'checkout', 'payment']);
  //     }
  //   });
  // }

  private getFeatures(): void {
    this.contactUsService.getFeatures().subscribe({
      next: (response: any) => {
        if (response) {
          this.features.set(response.features || []);
        }
      },
    });
  }
}
