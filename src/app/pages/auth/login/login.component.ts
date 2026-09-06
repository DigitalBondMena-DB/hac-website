import {
  animate,
  query,
  stagger,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { AsyncPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { LanguageService } from '@core/services/lang/language.service';
import { UserRole } from '@core/services/user/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { AlertService } from '@shared/alert/alert.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ToastrService } from 'ngx-toastr';
import { ArticlesHeaderComponent } from '../../articles/components/articles-header/articles-header.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ArticlesHeaderComponent,
    TranslateModule,
    ReactiveFormsModule,
    ButtonComponent,
    AsyncPipe,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
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
    trigger('inputAnimation', [
      transition(':enter', [
        query(
          'input, label, div, .text-red-500',
          [
            style({ opacity: 0, transform: 'translateY(10px)' }),
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
    trigger('imageAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('700ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
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
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate(
          '200ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'translateY(-10px)' })
        ),
      ]),
    ]),
  ],
})
export class LoginComponent implements OnInit {
  private _fb = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _toastr = inject(ToastrService);
  private _router = inject(Router);
  private _languageService = inject(LanguageService);
  private _alertService = inject(AlertService);
  currentLang$ = this._languageService.getLanguage();
  loginForm!: FormGroup;
  isLoading = signal(false);

  // Make UserRole available in template
  UserRole = UserRole;

  // Animation state
  shakeState = signal('idle');

  // Mega menu state
  isMegaMenuOpen = signal(false);

  // Form state signals
  emailTouched = signal(false);
  passwordTouched = signal(false);
  formSubmitted = signal(false);

  // Computed values for validation state
  emailInvalid = computed(() => {
    // Only show validation errors if the field has been interacted with
    // or the form has been submitted
    if (!this.email) return false;
    if (!(this.emailTouched() || this.formSubmitted())) return false;
    return this.email.invalid;
  });

  passwordInvalid = computed(() => {
    // Only show validation errors if the field has been interacted with
    // or the form has been submitted
    if (!this.password) return false;
    if (!(this.passwordTouched() || this.formSubmitted())) return false;
    return this.password.invalid;
  });

  // Simple computed value for form validation - kept for future use
  formInvalid = computed(() => this.loginForm?.invalid ?? false);

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.loginForm = this._fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  toggleMegaMenu(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isMegaMenuOpen.update((state) => !state);

    // Close menu when clicking outside
    if (this.isMegaMenuOpen()) {
      setTimeout(() => {
        document.addEventListener('click', this.closeMegaMenu);
      });
    }
  }

  closeMegaMenu = (): void => {
    this.isMegaMenuOpen.set(false);
    document.removeEventListener('click', this.closeMegaMenu);
  };

  registerAs(type: 'user' | 'business'): void {
    this.isMegaMenuOpen.set(false);
    // Role selection will be handled by the router navigation
  }

  submition() {
    this.formSubmitted.set(true);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.emailTouched.set(true);
      this.passwordTouched.set(true);
      this.triggerShakeAnimation();
      return;
    }

    this.isLoading.set(true);

    this._authService.login(this.loginForm.value).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        let lang = '';
        this.currentLang$.subscribe((next) => (lang = next));
        if (response.access_token) {
          this._alertService.showNotification({
            imagePath: '/images/common/settings.webp',
            translationKeys: {
              title: 'Login_successful',
            },
          });
          this.loginForm.reset();
          this._router.navigate(['/', lang]);
        } else if (response.ar_error) {
          let lang = '';
          this.currentLang$.subscribe((next) => (lang = next));
          this._alertService.showNotification({
            imagePath: '/images/common/unauth.webp',
            translationKeys: {
              title: lang === 'ar' ? response.ar_error : response.en_error,
            },
          });

          this.triggerShakeAnimation();
        } else {
          this._alertService.showNotification({
            imagePath: '/images/common/unauth.webp',
            translationKeys: {
              title: 'Login_failed',
            },
          });
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        const errorMessage =
          error?.error?.message || 'Login failed. Please try again.';
        let lang = '';
        this.currentLang$.subscribe((next) => (lang = next));
        this._alertService.showNotification({
          imagePath: '/images/common/unauth.webp',
          translationKeys: {
            title:
              lang === 'ar' ? errorMessage.ar_error : errorMessage.en_error,
          },
        });
        this.triggerShakeAnimation();
      },
    });
  }

  onEmailBlur() {
    this.emailTouched.set(true);
  }

  onPasswordBlur() {
    this.passwordTouched.set(true);
  }

  triggerShakeAnimation() {
    this.shakeState.set('shake');
    setTimeout(() => {
      this.shakeState.set('idle');
    }, 500);
  }

  // Helper methods for template
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
