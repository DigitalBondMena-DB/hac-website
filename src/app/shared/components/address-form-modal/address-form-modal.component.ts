import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ILocation } from '@core/interfaces/user.interface';
import { UserService } from '@core/services/user/user.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-address-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './address-form-modal.component.html',
  styleUrls: ['./address-form-modal.component.css'],
})
export class AddressFormModalComponent implements OnInit {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() formSubmit = new EventEmitter<any>();

  addressForm!: FormGroup;
  locations = signal<ILocation[]>([]);
  isLocationsLoading = signal(false);
  isFormSubmitting = signal(false);
  private _translateService = inject(TranslateService);

  private _userService = inject(UserService);
  private _formBuilder = inject(FormBuilder);

  ngOnInit(): void {
    this.initAddressForm();
    this.getLocations();
  }

  /**
   * Initialize the address form
   */
  initAddressForm(): void {
    this.addressForm = this._formBuilder.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern('^05[0-9]{8}$')]],
      email: ['', [Validators.required, Validators.email]],
      location_id: ['', [Validators.required]],
    });
  }

  /**
   * Load locations for the address form
   */
  getLocations(): void {
    this.isLocationsLoading.set(true);
    this._userService.getLocations().subscribe({
      next: (response) => {
        if (response && response.locations) {
          this.locations.set(response.locations);
        } else {
          console.error('No locations available');
        }
        this.isLocationsLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading locations:', error);
        this.isLocationsLoading.set(false);
      },
    });
  }

  /**
   * Check if a form field is invalid
   */
  isFieldInvalid(field: string): boolean {
    const control = this.addressForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
  getErrorMessage(field: string): string {
    const control = this.addressForm.get(field);
    if (!control || control.valid) return '';

    // Using translate service to get messages from i18n files
    if (control.hasError('required')) {
      return this._translateService.instant(
        `auth.register.register-form.address.validation.${field}.required`
      );
    }

    if (field === 'email' && control.hasError('email')) {
      return this._translateService.instant(
        'auth.register.register-form.address.validation.email.invalid'
      );
    }

    if (control.hasError('pattern')) {
      if (field === 'phone') {
        return this._translateService.instant(
          'auth.register.register-form.address.validation.phone.pattern'
        );
      }
    }

    return '';
  }

  /**
   * Submit the address form
   */
  submitAddress(): void {
    if (this.addressForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.addressForm.controls).forEach((key) => {
        const control = this.addressForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isFormSubmitting.set(true);

    // Get form data with location_id as number
    const addressData = {
      ...this.addressForm.value,
      location_id: Number(this.addressForm.value.location_id),
    };

    // Emit the form data to the parent component
    this.formSubmit.emit(addressData);
  }

  /**
   * Reset the address form
   */
  resetAddressForm(): void {
    this.addressForm.reset();
  }

  /**
   * Close the modal
   */
  closeModal(): void {
    this.close.emit();
  }

  /**
   * Prevent click events from propagating to the backdrop
   */
  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}
