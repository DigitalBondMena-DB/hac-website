import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IAddress, ILocation } from '@core/interfaces/user.interface';
import { UserService } from '@core/services/user/user.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    ButtonComponent,
    LoadingComponent,
  ],
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.css'],
})
export class AddressComponent implements OnInit {
  private _fb = inject(FormBuilder);

  private _userService = inject(UserService);

  private _destroyRef = inject(DestroyRef);

  private _translateService = inject(TranslateService);

  private _toastr = inject(ToastrService);

  addressForm!: FormGroup;

  locations = signal<ILocation[]>([]);

  loading = signal(false);

  errorMessage = signal('');

  successMessage = signal('');

  isFormSubmitted = signal(false);

  currentLang = signal(this._translateService.currentLang || 'en');

  address: IAddress[] = [];

  ngOnInit(): void {
    this.initForm();
    this.getUserInfo();
    this.getLocations();
    // Subscribe to language changes
    this._translateService.onLangChange
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((event) => {
        this.currentLang.set(event.lang);
      });
  }

  getUserInfo(): void {
    this.loading.set(true);
    this._userService
      .getUserInfo()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (response) => {
          this.loading.set(false);
          if (response && response.row) {
            this.address = response.row.addresses;
            console.log(response.row);
            this.populateForm(response.row);
          }
        },
        error: (error) => {
          this.loading.set(false);
          // Use toastr for error notification
          const errorMsg =
            error?.message ||
            this._translateService.instant('profile.address.user_info_error');
          this._toastr.error(
            errorMsg,
            this._translateService.instant('profile.address.error_title')
          );
        },
      });
  }

  initForm(): void {
    /* id */
    this.addressForm = this._fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern('^05[0-9]{8}$')]],
      email: ['', [Validators.required, Validators.email]],
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
          this.loading.set(false);
          if (response && response.locations) {
            this.locations.set(response.locations);
          }
        },
        error: (error) => {
          this.loading.set(false);
          const errorMsg =
            error?.message ||
            this._translateService.instant('profile.address.locations_error');
          this._toastr.error(
            errorMsg,
            this._translateService.instant('profile.address.error_title')
          );
        },
      });
  }

  populateForm(userInformation: any): void {
    if (!userInformation) return;

    const nameArray = userInformation.name
      ? userInformation.name.split(' ')
      : ['', ''];
    const first_name = nameArray[0] || '';
    const last_name = nameArray.length > 1 ? nameArray.slice(1).join(' ') : '';

    this.addressForm.patchValue({
      first_name,
      last_name,
      address: userInformation.address || '',
      city: userInformation.city || '',
      phone: userInformation.phone || '',
      location_id: userInformation.location_id || '',
      email: userInformation.email || '',
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

  submition(): void {
    this.isFormSubmitted.set(true);

    if (this.addressForm.valid) {
      this.loading.set(true);
      const addressData = this.addressForm.value;
      this._userService
        .addNewAddress(addressData)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (response) => {
            this.loading.set(false);
            this._toastr.success(
              this._translateService.instant(
                'profile.address.address_added_success'
              ),
              this._translateService.instant('profile.address.success_title')
            );
            this.addressForm.reset();
            this.isFormSubmitted.set(false);
          },
          error: (error) => {
            this.loading.set(false);
            const errorMsg =
              error?.message ||
              this._translateService.instant('profile.address.address_error');
            this._toastr.error(
              errorMsg,
              this._translateService.instant('profile.address.error_title')
            );
          },
        });
    } else {
      this.addressForm.markAllAsTouched();
      this._toastr.warning(
        this._translateService.instant('profile.address.form_invalid'),
        this._translateService.instant('profile.address.validation_title')
      );
    }
  }

  // Helper method to reset form
  resetForm(): void {
    this.addressForm.reset();
    this.isFormSubmitted.set(false);
    this._toastr.info(
      this._translateService.instant('profile.address.form_reset'),
      this._translateService.instant('profile.address.info_title')
    );
  }
}
