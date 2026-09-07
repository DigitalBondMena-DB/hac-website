import { AsyncPipe } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { CommonService } from '@core/services/common/common.service';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { AboutUsService } from 'src/app/pages/about-us/res/about-us.service';
import { IContactUs } from 'src/app/pages/contact-us/res/contact-us.interface';
import { ContactUsService } from 'src/app/pages/contact-us/res/contact-us.service';
import { SafeHtmlComponent } from '../../core/safe-html/safe-html.component';
import { isNationalDay } from '@core/services/conf/api.config';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    TranslateModule,
    CustomTranslatePipe,
    RouterLink,
    AsyncPipe,
    SafeHtmlComponent,
    CustomTranslatePipe,
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent implements OnInit {
  private commonService = inject(CommonService);
  private languageService = inject(LanguageService);
  private aboutService = inject(AboutUsService);
  private contactUsService = inject(ContactUsService);
  readonly isNationalDay = isNationalDay
  navItems = [
    {
      routLink: '',
      translateWord: 'home'
    },
    {
      routLink: 'shopping',
      translateWord: 'products'
    },
    {
      routLink: 'blogs',
      translateWord: 'articles'
    },
    {
      routLink: 'shopping',
      translateWord: 'shopping_now'
    },
    {
      routLink: 'about-us',
      translateWord: 'who_we_are'
    },
    {
      routLink: 'contact-us',
      translateWord: 'contact_Us'
    },
    {
      routLink: 'privacy',
      translateWord: 'privacy'
    }
  ]

  // Initialize with safe default values
  contactUs = signal<IContactUs>({
    id: 0,
    en_address: '',
    ar_address: '',
    phone: '',
    email: '',
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    active_status: 0,
    created_at: '',
    updated_at: '',
  });

  footerTitle: string = '';

  // Access the cached categories from CommonService
  private categoriesData = this.commonService.categories;

  // Create a computed signal for the categories
  categories = computed(() => {
    const data = this.categoriesData();
    return data?.categories || [];
  });

  currentLang$ = this.languageService.getLanguage();

  constructor() {
    // Set up effect to load categories if not already cached
    effect(() => {
      if (!this.categoriesData()) {
        this.loadCategories();
      }
    });
  }

  ngOnInit(): void {
    this.getContactUs();
    this.getFooterTitle();
  }

  getContactUs(): void {
    this.contactUsService.getContactUs().subscribe({
      next: (response: any) => {
        if (response && response.contact) {
          this.contactUs.set(response.contact);
        }
      },
      error: (error) => {
        console.error('Error fetching contact information:', error);
      },
    });
  }

  /**
   * Load categories if they're not already in the cache
   */
  private loadCategories(): void {
    this.commonService.getAllCategories().subscribe();
  }

  getFooterTitle() {
    this.aboutService.getAboutData().subscribe({
      next: (res: any) => {
        if (res && res.aboutdata) {
          this.footerTitle = res.aboutdata;
        }
      },
      error: (error) => {
        console.error('Error fetching footer title:', error);
      },
    });
  }
}
