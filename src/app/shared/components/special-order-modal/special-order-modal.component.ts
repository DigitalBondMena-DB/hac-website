import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '@core/services/auth/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export interface ISpecialOrderFormData {
  name: string;
  city: string;
  phone: string;
  email: string;
  doctor_name: string;
  hospital_name: string;
  doctor_code: string;
  address?: string;
  product_id: number | string;
  quantity: number;
}

@Component({
  selector: 'app-special-order-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './special-order-modal.component.html',
  styleUrls: ['./special-order-modal.component.css'],
})
export class SpecialOrderModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() productId!: number | string;
  @Input() quantity: number = 1;
  @Input() productName: string = '';
  @Input() isSubmitting: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() formSubmit = new EventEmitter<ISpecialOrderFormData>();

  orderForm!: FormGroup;
  currentQuantity = signal<number>(1);

  private _fb = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _translateService = inject(TranslateService);

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen && !this.isSubmitting) {
      this.closeModal();
    }
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['quantity'] && this.quantity) {
      this.currentQuantity.set(Math.max(1, Number(this.quantity) || 1));
    }

    if (changes['isOpen']) {
      if (this.isOpen) {
        if (!this.orderForm) {
          this.initForm();
        }
        this.prefillUserData();
      } else {
        this.resetFormValidationState();
      }
    }
  }

  /**
   * Initialize the reactive form with validations
   */
  private initForm(): void {
    this.orderForm = this._fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
          Validators.pattern(/^[^0-9\u0660-\u0669]+$/),
        ],
      ],
      city: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern('^05[0-9]{8}$'),
        ],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
        ],
      ],
      doctor_name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      hospital_name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      doctor_code: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
        ],
      ],
    });

    this.currentQuantity.set(Math.max(1, Number(this.quantity) || 1));
  }

  /**
   * Prevent typing numeric digits into the name input
   */
  onNameKeyPress(event: KeyboardEvent): boolean {
    if (
      ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(
        event.key
      ) ||
      event.ctrlKey ||
      event.metaKey
    ) {
      return true;
    }
    // Block any digits (0-9 and Arabic-Indic ٠-٩)
    if (/[0-9\u0660-\u0669]/.test(event.key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  /**
   * Strip any numbers from name input (including copy-paste)
   */
  onNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input) return;

    // Remove 0-9 and Arabic-Indic digits ٠-٩
    const cleaned = input.value.replace(/[0-9\u0660-\u0669]/g, '');
    if (input.value !== cleaned) {
      input.value = cleaned;
    }
    this.orderForm.get('name')?.setValue(cleaned);
  }

  /**
   * Prevent typing any non-digit keys into phone input
   */
  onPhoneKeyPress(event: KeyboardEvent): boolean {
    if (
      ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(
        event.key
      ) ||
      event.ctrlKey ||
      event.metaKey
    ) {
      return true;
    }
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  /**
   * Strip any non-digit characters from phone input (including copy-paste)
   */
  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input) return;

    // Convert Arabic/Eastern digits to western digits if pasted
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    let val = input.value;
    for (let i = 0; i < 10; i++) {
      val = val.replace(new RegExp(arabicDigits[i], 'g'), i.toString());
    }

    // Only allow numbers, max 10 digits
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    if (input.value !== cleaned) {
      input.value = cleaned;
    }
    this.orderForm.get('phone')?.setValue(cleaned);
  }

  /**
   * Pre-fill authenticated user data if available and fields are empty
   */
  private prefillUserData(): void {
    if (!this.orderForm) return;

    if (this._authService.isAuthenticated()) {
      const userData = this._authService.getUserData();
      if (userData) {
        const fullName = [userData.first_name, userData.last_name]
          .filter(Boolean)
          .join(' ')
          .trim();

        if (!this.orderForm.get('name')?.value && fullName) {
          this.orderForm.patchValue({ name: fullName });
        }
        if (!this.orderForm.get('email')?.value && userData.email) {
          this.orderForm.patchValue({ email: userData.email });
        }
        if (!this.orderForm.get('phone')?.value && userData.phone) {
          const cleanedPhone = (userData.phone || '').replace(/\D/g, '').slice(0, 10);
          this.orderForm.patchValue({ phone: cleanedPhone });
        }
      }
    }
  }

  /**
   * Check if a specific form field is invalid and has been touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const control = this.orderForm?.get(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  /**
   * Get localized validation error message for a field
   */
  getErrorMessage(fieldName: string): string {
    const control = this.orderForm?.get(fieldName);
    if (!control || control.valid) return '';

    if (control.hasError('required')) {
      return this._translateService.instant(`special_order.validation.${fieldName}.required`);
    }

    if (fieldName === 'name' && control.hasError('pattern')) {
      return this._translateService.instant('special_order.validation.name.pattern');
    }

    if (fieldName === 'email' && (control.hasError('email') || control.hasError('pattern'))) {
      return this._translateService.instant('special_order.validation.email.invalid');
    }

    if (fieldName === 'phone' && control.hasError('pattern')) {
      return this._translateService.instant('special_order.validation.phone.pattern');
    }

    if (control.hasError('minlength')) {
      return this._translateService.instant(`special_order.validation.${fieldName}.minlength`);
    }

    return '';
  }

  /**
   * Increment current quantity
   */
  incrementQuantity(): void {
    if (this.isSubmitting) return;
    this.currentQuantity.update((q) => q + 1);
  }

  /**
   * Decrement current quantity (min 1)
   */
  decrementQuantity(): void {
    if (this.isSubmitting) return;
    this.currentQuantity.update((q) => (q > 1 ? q - 1 : 1));
  }

  /**
   * Submit the special order
   */
  submitOrder(): void {
    if (this.isSubmitting) return;

    if (!this.orderForm || this.orderForm.invalid) {
      if (this.orderForm) {
        Object.keys(this.orderForm.controls).forEach((key) => {
          this.orderForm.get(key)?.markAsTouched();
        });
      }
      return;
    }

    const formRaw = this.orderForm.value;
    const finalQuantity = Math.max(1, this.currentQuantity() || 1);

    const payload: ISpecialOrderFormData = {
      name: (formRaw.name || '').trim(),
      city: (formRaw.city || '').trim(),
      phone: (formRaw.phone || '').trim(),
      email: (formRaw.email || '').trim(),
      doctor_name: (formRaw.doctor_name || '').trim(),
      hospital_name: (formRaw.hospital_name || '').trim(),
      doctor_code: (formRaw.doctor_code || '').trim(),
      address: (formRaw.city || '').trim(),
      product_id: this.productId,
      quantity: finalQuantity,
    };

    this.formSubmit.emit(payload);
  }

  /**
   * Reset form values and validation state
   */
  resetForm(): void {
    if (this.orderForm) {
      this.orderForm.reset();
      this.prefillUserData();
    }
  }

  private resetFormValidationState(): void {
    if (this.orderForm) {
      this.orderForm.markAsPristine();
      this.orderForm.markAsUntouched();
    }
  }

  /**
   * Close modal
   */
  closeModal(): void {
    if (this.isSubmitting) return;
    this.close.emit();
  }

  /**
   * Prevent backdrop click bubbling from inside the modal card
   */
  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}
