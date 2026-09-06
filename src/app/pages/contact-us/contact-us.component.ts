import {
  animate,
  query,
  stagger,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IQuotes } from '@core/interfaces/common.model';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { API_CONFIG } from '@core/services/conf/api.config';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ArrowButtonComponent } from '@shared/components/arrow-button/arrow-button.component';
import { BannerComponent } from '@shared/components/banner/banner.component';
import { ContactUsSkeletonComponent } from '@shared/components/skeleton/contact-us-skeleton/contact-us-skeleton.component';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ServiceCardComponent } from '../about-us/components/service-card/service-card.component';
import {
  IContactUs,
  IContactUsForm,
  IFeatures,
} from './res/contact-us.interface';
import { ContactUsService } from './res/contact-us.service';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [
    TranslateModule,
    BannerComponent,
    ServiceCardComponent,
    ArrowButtonComponent,
    CustomTranslatePipe,
    ReactiveFormsModule,
    CommonModule,
    ContactUsSkeletonComponent,
  ],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '400ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('formAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate(
          '500ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('cardAnimation', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger('100ms', [
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
    trigger('cardHover', [
      state(
        'normal',
        style({
          transform: 'translateY(0)',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        })
      ),
      state(
        'hovered',
        style({
          transform: 'translateY(-10px)',
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
        })
      ),
      transition('normal <=> hovered', animate('300ms ease-in-out')),
    ]),
  ],
})
export class ContactUsComponent implements OnInit {
  private contactUsService = inject(ContactUsService);

  private fb = inject(FormBuilder);

  private toastr = inject(ToastrService);

  private translateService = inject(TranslateService);

  // Using signals for reactive state management
  features = signal<IFeatures[]>([]);
  contactUs = signal<IContactUs>({} as IContactUs);
  breaks = signal<IQuotes[]>([]);
  isSubmitting = signal<boolean>(false);

  // Card hover state tracking
  cardStates: { [key: number]: string } = {};

  // Form group
  contactForm!: FormGroup;

  // Constants
  readonly API_CONFIG = API_CONFIG.BASE_URL_IMAGE;

  ngOnInit(): void {
    this.initForm();
    this.loadPageData();
  }

  /**
   * Initialize contact form with validators
   */
  private initForm(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      last_name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^05[0-9]{8}$')]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  /**
   * Loads all page data in parallel
   */
  private loadPageData(): void {
    // Load features and contact info
    this.getFeatures();
    this.getContactUs();
  }

  /**
   * Fetches features and quotes data
   */
  private getFeatures(): void {
    this.contactUsService.getFeatures().subscribe({
      next: (response: any) => {
        if (response) {
          this.features.set(response.features || []);
          this.breaks.set(response.breaks || []);
        }
      },
    });
  }

  /**
   * Fetches contact information
   */
  getContactUs(): void {
    this.contactUsService.getContactUs().subscribe({
      next: (response: any) => {
        if (response) {
          console.log(response);
          this.contactUs.set(response.contact);
        }
      },
    });
  }

  /**
   * Submit contact form
   */
  onSubmit(): void {
    if (this.contactForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.contactForm.controls).forEach((key) => {
        const control = this.contactForm.get(key);
        control?.markAsTouched();
      });

      this.toastr.warning(
        this.translateService.instant(
          'contact-us.form.validation.fields_required'
        ),
        this.translateService.instant('contact-us.form.validation.error_title')
      );
      return;
    }

    const formData: IContactUsForm = this.contactForm.value;
    this.isSubmitting.set(true);

    const finalData = {
      name: formData.name.split(' ')[0],
      last_name: formData.name.split(' ')[1],
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
    };
    // Call the contact form submission API
    this.contactUsService
      .getContactUsForm(finalData)
      .pipe(
        catchError((error) => {
          console.error('Error submitting form:', error);
          this.toastr.error(
            this.translateService.instant(
              'contact-us.form.submission.error_message'
            ),
            this.translateService.instant(
              'contact-us.form.submission.error_title'
            )
          );
          return of(null);
        }),
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.toastr.success(
              this.translateService.instant(
                'contact-us.form.submission.success_message'
              ),
              this.translateService.instant(
                'contact-us.form.submission.success_title'
              )
            );
            this.contactForm.reset();
          }
        },
      });
  }

  /**
   * Get form control validity class
   */
  getControlClass(controlName: string): string {
    const control = this.contactForm.get(controlName);
    if (!control) return '';

    return control.touched
      ? control.invalid
        ? 'border-red-500'
        : 'border-green-500'
      : '';
  }

  /**
   * Card hover event handlers
   */
  onCardMouseEnter(cardId: number): void {
    this.cardStates[cardId] = 'hovered';
  }

  onCardMouseLeave(cardId: number): void {
    this.cardStates[cardId] = 'normal';
  }
}
