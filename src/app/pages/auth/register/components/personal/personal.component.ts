import {
  animate,
  keyframes,
  query,
  stagger,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { AsyncPipe, NgIf } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { LanguageService } from '@core/services/lang/language.service';
import { UserRole } from '@core/services/user/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { AlertService } from '@shared/alert/alert.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { RegisterComponent } from '../../register.component';

// Custom validator to check if passwords match
function passwordMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password?.value !== confirmPassword?.value) {
    confirmPassword?.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }

  return null;
}

@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    ButtonComponent,
    RouterLink,
    AsyncPipe,
    NgIf,
  ],
  templateUrl: './personal.component.html',
  styleUrl: './personal.component.css',
  animations: [
    trigger('formAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '500ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('fieldAnimation', [
      transition(':enter', [
        query(
          '.flex-grow-1, div[class*=mb-]',
          [
            style({ opacity: 0, transform: 'translateY(15px)' }),
            stagger(80, [
              animate(
                '400ms ease-out',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
    trigger('iconAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.5) rotate(-10deg)' }),
        animate(
          '600ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          style({ opacity: 1, transform: 'scale(1) rotate(0deg)' })
        ),
      ]),
    ]),
    trigger('pulse', [
      transition(':enter', [
        animate(
          '1s',
          keyframes([
            style({ transform: 'scale(1)', offset: 0 }),
            style({ transform: 'scale(1.05)', offset: 0.5 }),
            style({ transform: 'scale(1)', offset: 1.0 }),
          ])
        ),
      ]),
    ]),
    trigger('shake', [
      state(
        'idle',
        style({
          transform: 'translateX(0)',
        })
      ),
      state(
        'shake',
        style({
          transform: 'translateX(0)',
        })
      ),
      transition('idle => shake', [
        animate('50ms', style({ transform: 'translateX(-10px)' })),
        animate('100ms', style({ transform: 'translateX(10px)' })),
        animate('100ms', style({ transform: 'translateX(-10px)' })),
        animate('100ms', style({ transform: 'translateX(10px)' })),
        animate('50ms', style({ transform: 'translateX(0)' })),
      ]),
    ]),
  ],
})
export class PersonalComponent implements OnInit {
  private _fb = inject(FormBuilder);
  private _languageService = inject(LanguageService);
  private _authService = inject(AuthService);
  private _toastr = inject(ToastrService);
  private _router = inject(Router);
  private _alertService = inject(AlertService);
  private _route = inject(ActivatedRoute);
  private _parent = inject(RegisterComponent);

  // Make UserRole available to template
  UserRole = UserRole;

  currentLang$ = this._languageService.getLanguage();

  registerForm!: FormGroup;
  isLoading = false;

  // File handling for business registration
  commercialFile: File | null = null;
  vatFile: File | null = null;
  commercialFileRequired = false;
  vatFileRequired = false;

  // User role from parent component
  get userRole(): UserRole {
    return this._parent.userRole;
  }

  // Animation state
  shakeState = signal('idle');

  ngOnInit(): void {
    this.initForm();

  }

  initForm() {
    const baseForm = {
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phone: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.pattern('^05[0-9]{8}$'),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    };

    // Add business-specific fields if registering as business
    if (this.userRole === UserRole.BUSINESS) {
      this.commercialFileRequired = true;
      this.vatFileRequired = true;

      this.registerForm = this._fb.group(
        {
          ...baseForm,
          trade_name: ['', [Validators.required]],
          national_address: ['', [Validators.required]],
        },
        { validators: passwordMatchValidator }
      );
    } else {
      this.registerForm = this._fb.group(baseForm, {
        validators: passwordMatchValidator,
      });
    }
  }

  onCommercialFileChange(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.commercialFile = fileInput.files[0];
    } else {
      this.commercialFile = null;
    }
  }

  onVatFileChange(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.vatFile = fileInput.files[0];
    } else {
      this.vatFile = null;
    }
  }

  submition() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.triggerShakeAnimation();
      return;
    }

    // For business registration, check if required files are uploaded
    if (this.userRole === UserRole.BUSINESS) {
      if (!this.commercialFile || !this.vatFile) {
        this.triggerShakeAnimation();
        return;
      }
    }

    const formValues = this.registerForm.value;

    const registerData: any = {
      name: `${formValues.firstName} ${formValues.lastName}`,
      email: formValues.email,
      phone: formValues.phone,
      password: formValues.password,
      role: this.userRole.toString(), // Add the role to the registration data
    };

    // Add business-specific fields if applicable
    if (this.userRole === UserRole.BUSINESS) {
      registerData.trade_name = formValues.trade_name;
      registerData.national_address = formValues.national_address;
    }

    this.isLoading = true;

    // For business registration with files, use FormData
    if (
      this.userRole === UserRole.BUSINESS &&
      this.commercialFile &&
      this.vatFile
    ) {
      const formData = new FormData();

      // Add all fields to FormData
      Object.keys(registerData).forEach((key) => {
        formData.append(key, registerData[key]);
      });

      // Add files
      formData.append('commercial_file', this.commercialFile);
      formData.append('vat_file', this.vatFile);

      this._authService
        .registerAsBusiness(formData)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: this.handleRegistrationSuccess.bind(this),
          error: this.handleRegistrationError.bind(this),
        });
    } else {
      // Regular registration without files for normal users
      this._authService
        .register(registerData)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: this.handleRegistrationSuccess.bind(this),
          error: this.handleRegistrationError.bind(this),
        });
    }
  }

  handleRegistrationSuccess(response: any) {
    let lang = '';
    this._languageService.getLanguage().subscribe((next) => {
      lang = next;
    });

    if (
      response?.user?.message !== undefined ||
      response?.message !== undefined
    ) {
      this._alertService.showNotification({
        imagePath: '/images/common/settings.webp',
        translationKeys: {
          title: 'Registration_successful',
        },
      });
      this._router.navigate([`/${lang}/login`]);
    } else {
      this._alertService.showNotification({
        imagePath: '/images/common/unauth.webp',
        translationKeys: {
          title: 'Registration failed',
        },
      });
      this.triggerShakeAnimation();
    }
  }

  handleRegistrationError(error: any) {
    if (error?.error?.errors && typeof error.error.errors === 'object') {
      // Loop through all error keys in the response
      Object.keys(error.error.errors).forEach((key) => {
        const messages = error.error.errors[key];
        if (Array.isArray(messages)) {
          // Display each message for this key
          messages.forEach((message) => {
            this._alertService.showNotification({
              imagePath: '/images/common/unauth.webp',
              translationKeys: {
                title: message,
              },
            });
          });
        }
      });
    } else {
      this._alertService.showNotification({
        imagePath: '/images/common/unauth.webp',
        translationKeys: {
          title: 'Registration failed',
        },
      });
    }
    this.triggerShakeAnimation();
  }

  triggerShakeAnimation() {
    this.shakeState.set('shake');
    setTimeout(() => {
      this.shakeState.set('idle');
    }, 500);
  }

  // Helper methods for template
  get firstName() {
    return this.registerForm.get('firstName');
  }

  get lastName() {
    return this.registerForm.get('lastName');
  }

  get phone() {
    return this.registerForm.get('phone');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  // Business-specific form controls
  get tradeName() {
    return this.registerForm.get('trade_name');
  }

  get nationalAddress() {
    return this.registerForm.get('national_address');
  }
}
