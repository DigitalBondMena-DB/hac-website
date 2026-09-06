import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { IYotoPlaced } from '@core/interfaces/iyoto';
import { IAddress, IUserInfo } from '@core/interfaces/user.interface';
import { CartStateService } from '@core/services/cart/cart-state.service';
import { OrdersService } from '@core/services/cart/orders.service';
import { LanguageService } from '@core/services/lang/language.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { OtoService } from '@core/services/oto/oto.service';
import { UserService } from '@core/services/user/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { OrderSummaryComponent } from '@shared/components/order-summary/order-summary.component';
import { Observable } from 'rxjs';
import { ArticlesHeaderComponent } from '../../../articles/components/articles-header/articles-header.component';
import { TamaraService } from './tamara/services/tamara.service';

export enum PaymentMethod {
  CASH_ON_DELIVERY = 1,
  ONLINE_PAYMENT_VISA = 2,
  ONLINE_PAYMENT_MADA = 6,
  ONLINE_PAYMENT_Apple_Pay = 11,
  ONLINE_PAYMENT_STC_Pay = 12,
  ONLINE_PAYMENT_Apple_Pay_Mada = 13,
  ONLINE_PAYMENT_Google_Pay = 16,
  ONLINE_PAYMENT_TAMARA = 999,
}
/*
[
    {
        "PaymentMethodId": 2,
        "PaymentMethodCode": "vm",
        "PaymentMethodAr": "فيزا / ماستر",
        "PaymentMethodEn": "VISA/MASTER",
        "IsDirectPayment": false,
        "ServiceCharge": 0.108,
        "TotalAmount": 1,
        "CurrencyIso": "KWD",
        "ImageUrl": "https://sa.myfatoorah.com/imgs/payment-methods/vm.png",
        "IsEmbeddedSupported": true,
        "PaymentCurrencyIso": "SAR"
    },
    {
        "PaymentMethodId": 6,
        "PaymentMethodCode": "md",
        "PaymentMethodAr": "مدى",
        "PaymentMethodEn": "mada",
        "IsDirectPayment": false,
        "ServiceCharge": 0.093,
        "TotalAmount": 1,
        "CurrencyIso": "KWD",
        "ImageUrl": "https://sa.myfatoorah.com/imgs/payment-methods/md.png",
        "IsEmbeddedSupported": true,
        "PaymentCurrencyIso": "SAR"
    },
    {
        "PaymentMethodId": 11,
        "PaymentMethodCode": "ap",
        "PaymentMethodAr": "أبل باي",
        "PaymentMethodEn": "Apple Pay",
        "IsDirectPayment": false,
        "ServiceCharge": 0.108,
        "TotalAmount": 1,
        "CurrencyIso": "KWD",
        "ImageUrl": "https://sa.myfatoorah.com/imgs/payment-methods/ap.png",
        "IsEmbeddedSupported": true,
        "PaymentCurrencyIso": "SAR"
    },
    {
        "PaymentMethodId": 12,
        "PaymentMethodCode": "stc",
        "PaymentMethodAr": "STC Pay",
        "PaymentMethodEn": "STC Pay",
        "IsDirectPayment": false,
        "ServiceCharge": 0.009,
        "TotalAmount": 1,
        "CurrencyIso": "KWD",
        "ImageUrl": "https://sa.myfatoorah.com/imgs/payment-methods/stc.png",
        "IsEmbeddedSupported": true,
        "PaymentCurrencyIso": "SAR"
    },
    {
        "PaymentMethodId": 13,
        "PaymentMethodAr": "أبل باي (مدى)",
        "PaymentMethodEn": "Apple Pay (mada)",
        "PaymentMethodCode": "ap",
        "IsDirectPayment": false,
        "ServiceCharge": 0.093,
        "TotalAmount": 1,
        "CurrencyIso": "KWD",
        "ImageUrl": "https://sa.myfatoorah.com/imgs/payment-methods/ap.png",
        "IsEmbeddedSupported": true,
        "PaymentCurrencyIso": "SAR"
    },
    {
        "PaymentMethodId": 16,
        "PaymentMethodCode": "gp",
        "PaymentMethodAr": "Google Pay",
        "PaymentMethodEn": "Google Pay",
        "IsDirectPayment": false,
        "ServiceCharge": 0.108,
        "TotalAmount": 1,
        "CurrencyIso": "KWD",
        "ImageUrl": "https://sa.myfatoorah.com/imgs/payment-methods/gp.png",
        "IsEmbeddedSupported": true,
        "PaymentCurrencyIso": "SAR"
    }
]

*/
@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonComponent,
    LoadingComponent,
    OrderSummaryComponent,
    ArticlesHeaderComponent,
  ],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent implements OnInit {
  private _cartState = inject(CartStateService);
  private _ordersService = inject(OrdersService);
  private _notificationService = inject(NotificationService);
  private _destroyRef = inject(DestroyRef);
  private _router = inject(Router);
  private _languageService = inject(LanguageService);
  private _userService = inject(UserService);
  private _userInfo = inject(UserService);
  private _tamaraService = inject(TamaraService);
  private _otoService = inject(OtoService);

  private _route = inject(ActivatedRoute);
  // State management
  isSubmitting = signal(false);
  selectedPaymentMethod = signal<PaymentMethod | null>(null);

  // Payment method enum for template access
  PaymentMethod = PaymentMethod;

  // Track if we're navigating away to prevent unnecessary redirects
  private isNavigatingAway = false;

  // Track if we've already handled the failed payment to prevent double execution
  private hasHandledFailedPayment = signal(false);

  // Data from cart state
  order = this._cartState.order;
  orderDetails = this._cartState.orderDetails;

  // Selected address ID passed from the address step
  selectedAddressId = signal<number | null>(null);
  selectedAddress = signal<IAddress | null>(null);

  // Observable for current language
  currentLang$: Observable<string> = this._languageService.getLanguage();

  langIs: string = '';
  ngOnInit(): void {
    console.log('ngOnInit');
    this.checkForFailedPayment();

    this.currentLang$.subscribe((lang) => {
      this.langIs = lang;
    });
  }

  /**
   * Set the selected payment method
   */
  selectPaymentMethod(method: PaymentMethod): void {
    this.selectedPaymentMethod.set(method);
  }

  /**
   * Check for failed payment query parameter and handle accordingly
   */
  private checkForFailedPayment(): void {
    this._route.queryParamMap
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((queryParams) => {
        const checkoutStatus = queryParams.get('checkout');

        if (checkoutStatus === 'fail' && !this.hasHandledFailedPayment()) {
          // Mark as handled to prevent double execution
          this.hasHandledFailedPayment.set(true);

          // Get current language to show appropriate error message
          this._languageService
            .getLanguage()
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe((currentLang) => {
              const errorMessages = {
                title: {
                  en: 'Payment Failed',
                  ar: 'فشل الدفع',
                },
                message: {
                  en: 'Your payment could not be processed. Please try again with a different payment method.',
                  ar: 'لم نتمكن من معالجة عملية الدفع. يرجى المحاولة مرة أخرى بطريقة دفع مختلفة.',
                },
              };

              this._notificationService.error(
                errorMessages.title[currentLang as 'en' | 'ar'] ||
                  errorMessages.title.en,
                errorMessages.message[currentLang as 'en' | 'ar'] ||
                  errorMessages.message.en
              );
            });

          // Clear the query parameters to prevent showing the error again on refresh
          this._router.navigate([], {
            relativeTo: this._route,
            queryParams: {},
            replaceUrl: true,
          });
        }
      });
  }

  getDeviceType(): { platform: string; is_mobile: boolean } {
    const userAgent =
      navigator.userAgent || navigator.vendor || (window as any).opera;

    // Check for iOS
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      return { platform: 'iOS', is_mobile: true };
    }

    // Check for Android
    if (/android/i.test(userAgent)) {
      return { platform: 'Android', is_mobile: true };
    }

    // Default to Web (desktop or responsive mobile web)
    const isMobile = /Mobi|Android/i.test(userAgent);
    return { platform: 'Web', is_mobile: isMobile };
  }

  /**
   * Handle order placement based on payment method
   */
  handleOrderPlacement(): void {
    if (!this.selectedPaymentMethod()) {
      this._notificationService.error(
        'Payment Method Required',
        'Please select a payment method to continue'
      );
      return;
    }

    if (this.selectedPaymentMethod() === PaymentMethod.CASH_ON_DELIVERY) {
      this.placeOrder();
    } else if (
      this.selectedPaymentMethod() === PaymentMethod.ONLINE_PAYMENT_VISA ||
      this.selectedPaymentMethod() === PaymentMethod.ONLINE_PAYMENT_MADA ||
      this.selectedPaymentMethod() === PaymentMethod.ONLINE_PAYMENT_Apple_Pay ||
      this.selectedPaymentMethod() === PaymentMethod.ONLINE_PAYMENT_STC_Pay ||
      this.selectedPaymentMethod() ===
        PaymentMethod.ONLINE_PAYMENT_Apple_Pay_Mada ||
      this.selectedPaymentMethod() ===
        PaymentMethod.ONLINE_PAYMENT_Google_Pay ||
      this.selectedPaymentMethod() === PaymentMethod.ONLINE_PAYMENT_TAMARA
    ) {
      this.redirectToPaymentGateway();
    }
  }

  /**
   * Submit order with cash-on-delivery payment
   */
  placeOrder(): void {
    this.isSubmitting.set(true);
    this._ordersService
      .placeOrder(this.order().id, { paymentId: null })
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (response: any) => {
          this.isSubmitting.set(false);
          console.log(response);
          // Navigate to track order page with order ID
          let currentLang = 'en';
          this._languageService.getLanguage().subscribe((lang) => {
            currentLang = lang;
          });
          this._router.navigate([
            '/',
            currentLang,
            'checkout',
            'track-order',
            this.order().user_id,
          ]);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this._notificationService.error(
            'Order Error',
            'Failed to place your order. Please try again.'
          );
        },
      });
  }

  /**
   * Redirect to online payment gateway
   */
  redirectToPaymentGateway(): void {
    this.isSubmitting.set(true);
    this.getUserInfo();
  }

  getUserInfo(): void {
    this._userInfo
      .getUserInfo()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((next) => {
        if (next.row) {
          this.paymentSession(next.row);
        }
      });
  }

  createOTOOrder() {
    const data: IYotoPlaced = {
      orderId: this.order().id.toString(),
      createShipment: '2025-01-01',
      deliveryOptionId: 1,
      payment_method: 'VISA',
      amount: this.order().total,
      amount_due: this.order().total,
      currency: 'SAR',
      customsValue: this.order().total.toString(),
      customsCurrency: 'SAR',
      packageCount: 1,
      packageWeight: 1,
      boxWidth: 1,
      boxLength: 1,
      boxHeight: 1,
      orderDate: '2025-01-01',
      deliverySlotDate: '2025-01-01',
      deliverySlotTo: '2025-01-01',
      deliverySlotFrom: '2025-01-01',
      senderName: 'John Doe',
      items: this.orderDetails().map((item) => ({
        productId: item.product_id,
        name: item.product?.en_name || item.product?.ar_name || 'Product',
        price: Number(item.unit_price),
        quantity: Number(item.quantity),
        sku: item.product_id.toString(),
      })),
      customer: {
        name: 'Mohamed Dawoud',
        email: 'm.dawoud@hayatalafkar.com',
        mobile: '+966 545372774',
        address: 'Al Olaya',
        city: 'Riyadh',
        country: 'Saudi Arabia',
        postcode: '12241',
      },
    };
    this._otoService.createORder(data).subscribe((response) => {
      console.log(response);
    });
  }

  paymentSession(userData: IUserInfo): void {
    if (this.selectedPaymentMethod() === PaymentMethod.ONLINE_PAYMENT_TAMARA) {
      this.redirectToTamaraPaymentGateway();
      return;
    }

    const user = {
      name: userData.name,
      amount: this.order().total,
      email: userData.email,
      mobile: userData.phone,
      order_id: this.order().id,
      payment_id: this.selectedPaymentMethod() || 1,
    };

    this._ordersService
      .createPaymentSession(user)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((response) => {
        window.location.href = response.payment_url;
      });
  }

  redirectToTamaraPaymentGateway(): void {
    this.isSubmitting.set(true);

    this._userService
      .getUserInfo()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (userInfo) => {
          if (userInfo?.row) {
            const userData = userInfo.row;
            const order = this.order();
            const orderDetails = this.orderDetails();
            const deviceInfo = this.getDeviceType();

            const tamaraCheckoutData = {
              total_amount: {
                amount: order.total,
                currency: 'SAR',
              },
              shipping_amount: {
                amount: order.shipping,
                currency: 'SAR',
              },
              tax_amount: {
                amount: order.tax,
                currency: 'SAR',
              },
              order_reference_id: order.id,
              order_number: order.id,
              discount: {
                amount: {
                  amount: order.promo_code_value,
                  currency: 'SAR',
                },
                name: 'Promo Code Discount',
              },
              items: orderDetails.map((item) => ({
                name:
                  item.product?.en_name || item.product?.ar_name || 'Product',
                type: 'Physical',
                reference_id: item.product_id.toString(),
                sku: item.product_id.toString(),
                quantity: item.quantity,
                discount_amount: {
                  amount: 0,
                  currency: 'SAR',
                },
                tax_amount: {
                  amount: 0,
                  currency: 'SAR',
                },
                unit_price: {
                  amount: parseFloat(item.unit_price),
                  currency: 'SAR',
                },
                total_amount: {
                  amount: parseFloat(item.subtotal),
                  currency: 'SAR',
                },
              })),
              consumer: {
                email: userData.email,
                first_name: userData.addresses[0].first_name,
                last_name: userData.addresses[0].last_name,
                phone_number: userData.addresses[0].phone,
              },
              country_code: 'SA',
              description: `Order #${order.id}`,
              merchant_url: {
                cancel: `https://haccosmetics.com/${this.langIs}/checkout/payment`,
                failure: `https://haccosmetics.com/${this.langIs}/checkout/payment`,
                success: `https://haccosmetics.com/${this.langIs}/checkout/track-order?order-id=${order.id}`,
                notification: `https://digitalbondmena.com/mesoshop/api/handleWebhook`,
              },
              payment_type: 'PAY_BY_INSTALMENTS',
              billing_address: {
                city: order.address.city,
                country_code: 'SA',
                first_name: order.address.first_name,
                last_name: order.address.last_name,
                line1: order.address.address,
                line2: order.address.notes || '',
                phone_number: order.address.phone,
                region: order.address.city,
              },
              shipping_address: {
                city: order.address.city,
                country_code: 'SA',
                first_name: order.address.first_name,
                last_name: order.address.last_name,
                line1: order.address.address,
                line2: order.address.notes || '',
                phone_number: order.address.phone,
                region: order.address.city,
              },
              platform: deviceInfo.platform,
              is_mobile: deviceInfo.is_mobile,
              locale: this.langIs === 'ar' ? 'ar_SA' : 'en_US',
              additional_data: {},
            };

            this._tamaraService
              .createPaymentSession(tamaraCheckoutData)
              .pipe(takeUntilDestroyed(this._destroyRef))
              .subscribe({
                next: (response) => {
                  this.isSubmitting.set(false);
                  const res = response as any;
                  if (response.checkout_url) {
                    const tamaraData = {
                      order_id: response.order_id.toString(),
                      order_id_db: order.id.toString(),
                    };
                    this._ordersService
                      .tamaraWebhook(tamaraData)
                      .pipe(takeUntilDestroyed(this._destroyRef))
                      .subscribe((response) => {
                        console.log('response', response);
                        window.location.href = res.checkout_url;
                      });
                  } else {
                    this._notificationService.error(
                      'Payment Error',
                      'Failed to initialize Tamara payment. Please try again.'
                    );
                  }
                },
                error: (error) => {
                  this.isSubmitting.set(false);
                  console.error('Tamara payment error:', error);
                  this._notificationService.error(
                    'Payment Error',
                    'Failed to initialize Tamara payment. Please try again.'
                  );
                },
              });
          }
        },
        error: (error) => {
          this.isSubmitting.set(false);
          console.error('Failed to get user info:', error);
          this._notificationService.error(
            'User Error',
            'Failed to get user information. Please try again.'
          );
        },
      });
  }
}
/*
 https://haccosmetics.com//ar/checkout/track-order?paymentId=0808501410234886980383&Id=0808501410234886980383
*/
