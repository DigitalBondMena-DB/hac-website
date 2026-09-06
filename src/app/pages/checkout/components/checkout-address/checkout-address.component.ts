import { AsyncPipe, CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  EventEmitter,
  OnInit,
  Output,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IAddress, ILocation } from '@core/interfaces/user.interface';
import { CartStateService } from '@core/services/cart/cart-state.service';
import { OrdersService } from '@core/services/cart/orders.service';
import { LanguageService } from '@core/services/lang/language.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { UserService } from '@core/services/user/user.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { OrderSummaryComponent } from '@shared/components/order-summary/order-summary.component';
import { ArticlesHeaderComponent } from '../../../articles/components/articles-header/articles-header.component';

@Component({
  selector: 'app-checkout-address',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    ButtonComponent,
    LoadingComponent,
    OrderSummaryComponent,
    ArticlesHeaderComponent,
    RouterLink,
    AsyncPipe,
  ],
  templateUrl: './checkout-address.component.html',
  styleUrls: ['./checkout-address.component.css'],
})
export class CheckoutAddressComponent implements OnInit {
  @Output() addressSelected = new EventEmitter<IAddress | null>();
  @Output() newAddressAdded = new EventEmitter<IAddress>();

  private _fb = inject(FormBuilder);
  private _userService = inject(UserService);
  private _destroyRef = inject(DestroyRef);
  private _translateService = inject(TranslateService);
  private _notificationService = inject(NotificationService);
  private _languageService = inject(LanguageService).getLanguage();
  private _ordersService = inject(OrdersService);
  private _cartState = inject(CartStateService);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);

  addressForm!: FormGroup;
  locations = signal<ILocation[]>([]);
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  isFormSubmitted = signal(false);
  currentLang$ = inject(LanguageService).getLanguage();
  // Track if the user has existing addresses
  addresses = signal<IAddress[]>([]);
  hasAddresses = signal(false);
  selectedAddressId = signal<number | null>(null);

  // Show add new address form only when user has no addresses
  showAddAddressForm = signal(false);

  // Add new signal for order submission
  isSubmitting = signal(false);

  // Get order data from cart state
  order = this._cartState.order;
  orderDetails = this._cartState.orderDetails;

  ngOnInit(): void {
    this.initForm();
    this.processResolverData();
  }

  /**
   * Process data from resolvers
   */
  processResolverData(): void {
    // Get user address data from resolver
    const addressData = this._route.snapshot.data['addressData'];
    if (addressData && addressData.row) {
      // Process addresses
      if (addressData.row.addresses) {
        this.addresses.set(addressData.row.addresses);
        const hasUserAddresses = addressData.row.addresses.length > 0;
        this.hasAddresses.set(hasUserAddresses);

        // Only show the form when user has no addresses
        this.showAddAddressForm.set(!hasUserAddresses);

        if (hasUserAddresses) {
          // If addresses exist, select the first one by default
          this.selectAddress(addressData.row.addresses[0]);
        } else {
          // No addresses, populate form with user info
          this.populateForm(addressData.row);
        }
      }
    }

    // Get locations data from resolver
    const locationsData = this._route.snapshot.data['locationsData'];
    if (locationsData && locationsData.locations) {
      this.locations.set(locationsData.locations);
    } else {
      // Fallback to service call if resolver data is not available
      this.getLocations();
    }
  }

  /**
   * Load user data: addresses and available locations
   * This method serves as a fallback if resolver data is not available
   */
  getUserInfo(): void {
    // First load locations if not already loaded
    if (this.locations().length === 0) {
      this.getLocations();
    }

    // Then get user addresses if not already loaded
    if (this.addresses().length === 0) {
      this.getUserAddresses();
    }
  }

  getUserAddresses(): void {
    this.loading.set(true);
    this._userService
      .getUserInfo()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (response) => {
          this.loading.set(false);
          if (response && response.row && response.row.addresses) {
            this.addresses.set(response.row.addresses);
            const hasUserAddresses = response.row.addresses.length > 0;
            this.hasAddresses.set(hasUserAddresses);

            // Only show the form when user has no addresses
            this.showAddAddressForm.set(!hasUserAddresses);

            if (hasUserAddresses) {
              // If addresses exist, select the first one by default
              this.selectAddress(response.row.addresses[0]);
            } else {
              // No addresses, populate form with user info
              this.populateForm(response.row);
            }
          }
        },
        error: (error) => {
          this.loading.set(false);
          const errorMsg = error?.message || 'checkout.address.user_info_error';
          this._notificationService.error(
            errorMsg,
            'checkout.address.error_title'
          );
        },
      });
  }

  initForm(): void {
    this.addressForm = this._fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],

      phone: ['', [Validators.required, Validators.pattern('^05[0-9]{8}$')]],
      email: ['', [Validators.required, Validators.email]],
      user_id: [''],
      location_id: ['', [Validators.required]],
    });
  }

  getLocations(): void {
    this.loading.set(true);
    this._userService
      .getLocations()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (response) => {
          if (response && response.locations) {
            this.locations.set(response.locations);
          } else {
            // No locations available - show notification
            this._notificationService.warning(
              'checkout.address.no_locations',
              'checkout.address.warning_title'
            );
          }
        },
        error: (error) => {
          const errorMsg = error?.message || 'checkout.address.locations_error';
          this._notificationService.error(
            errorMsg,
            'checkout.address.error_title'
          );
        },
        complete: () => {
          // Don't set loading to false yet, as we still need to load addresses
        },
      });
  }

  populateForm(userInformation: any): void {
    if (!userInformation) return;
    const first_name = userInformation.name.split(' ')[0];
    const last_name = userInformation.name.split(' ')[1];

    this.addressForm.patchValue({
      first_name: first_name,
      last_name: last_name,
      address: userInformation.address || '',
      city: userInformation.city || '',
      phone: userInformation.phone || '',
      email: userInformation.email || '',
      user_id: userInformation.id || '',
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.addressForm.get(field);
    return (
      !!control &&
      control.invalid &&
      (control.touched || this.isFormSubmitted())
    );
  }

  callTetApi() {
    this.addressForm.value;
    const data = {
      ...this.addressForm.value,
      location_id: Number(this.addressForm.value.location_id),
      orderDetails: this.orderDetails(),
    };
    this._userService.callTetApi(data).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
  getErrorMessage(field: string): string {
    const control = this.addressForm.get(field);
    if (!control || control.valid) return '';

    if (control.hasError('required')) {
      return this._translateService.instant(
        `checkout.form.validation.${field}.required`
      );
    }

    if (field === 'email' && control.hasError('email')) {
      return this._translateService.instant(
        'checkout.form.validation.email.invalid'
      );
    }

    if (control.hasError('pattern')) {
      if (field === 'phone') {
        return this._translateService.instant(
          'checkout.form.validation.phone.pattern'
        );
      }
    }

    return '';
  }

  submitNewAddress(): void {
    this.isFormSubmitted.set(true);

    if (this.addressForm.valid) {
      this.loading.set(true);
      const addressData = this.addressForm.value;
      this._userService
        .addNewAddress(addressData)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (response) => {
            // Don't set loading to false yet - we need to get all addresses
            this._notificationService.success(
              'checkout.address.address_added_success',
              'checkout.address.success_title'
            );

            // After successfully adding the address, fetch all addresses again
            // This ensures we have the complete address data with correct location
            this.refreshUserAddresses();
          },
          error: (error) => {
            this.loading.set(false);
            const errorMsg = error?.message || 'checkout.address.address_error';
            this._notificationService.error(
              errorMsg,
              'checkout.address.error_title'
            );
          },
        });
    } else {
      this.addressForm.markAllAsTouched();
    }
  }

  /**
   * Refresh addresses from backend after adding a new address
   */
  refreshUserAddresses(): void {
    this._userService
      .getUserInfo()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (response) => {
          this.loading.set(false);
          if (response && response.row && response.row.addresses) {
            const allAddresses = response.row.addresses;
            this.addresses.set(allAddresses);
            this.hasAddresses.set(allAddresses.length > 0);
            this.showAddAddressForm.set(false);

            // Find the newly added address (should be the last one)
            if (allAddresses.length > 0) {
              const newAddress = allAddresses[allAddresses.length - 1];

              // Select this address
              this.selectAddress(newAddress);

              // Emit the new address to parent component
              this.newAddressAdded.emit(newAddress);
            }
          }
        },
        error: (error) => {
          this.loading.set(false);
          const errorMsg = error?.message || 'checkout.address.refresh_error';
          this._notificationService.error(
            errorMsg,
            'checkout.address.error_title'
          );
        },
      });
  }

  resetForm(): void {
    this.addressForm.reset();
    this.isFormSubmitted.set(false);
    // this._notificationService.info(
    //   'checkout.address.form_reset',
    //   'checkout.address.info_title'
    // );
  }

  /**
   * Select address
   */
  selectAddress(address: IAddress): void {
    if (address && address.id) {
      this.selectedAddressId.set(address.id);

      // Call checkout endpoint to update order with the selected address
      if (this.order() && this.order().id) {
        const orderId = this.order().id.toString();
        const addressId = address.id.toString();

        this.isSubmitting.set(true);

        this._ordersService
          .checkout(addressId, orderId)
          .pipe(takeUntilDestroyed(this._destroyRef))
          .subscribe({
            next: (response: any) => {
              if (response && response.order) {
                // Update order data in cart state
                this._cartState.updateOrder(response.order);
                this._notificationService.success(
                  'checkout.address.address_selected_success',
                  'checkout.address.success_title'
                );
              }
              this.isSubmitting.set(false);
            },
            error: (err: any) => {
              console.error('Error updating order with address:', err);
              this._notificationService.error(
                'checkout.address.refresh_error',
                'checkout.address.error_title'
              );
              this.isSubmitting.set(false);
            },
          });
      }
    } else {
      this._notificationService.warning(
        'checkout.address.invalid_address',
        'checkout.address.warning_title'
      );
    }
  }

  toggleAddressForm(): void {
    // Only if user has addresses, allow toggling the form
    if (this.hasAddresses()) {
      this.showAddAddressForm.update((value) => !value);

      // Reset selected address if showing form
      if (this.showAddAddressForm()) {
        this.selectedAddressId.set(null);
        this.addressSelected.emit(null);
      } else if (this.addresses().length > 0 && !this.selectedAddressId()) {
        // If hiding form and no address selected, select the first one
        this.selectAddress(this.addresses()[0]);
      }
    }
  }

  isAddressSelected(address: IAddress): boolean {
    return this.selectedAddressId() === address.id;
  }

  /**
   * Get the currently selected address object
   */
  getSelectedAddress(): IAddress | null {
    console.log(this.selectedAddressId());
    if (!this.selectedAddressId()) return null;
    const address = this.addresses().find(
      (addr) => addr.id === this.selectedAddressId()
    );
    return address || null;
  }
}
