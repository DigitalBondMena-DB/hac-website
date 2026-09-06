import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  input,
  OnDestroy,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { LanguageService } from '@core/services/lang/language.service';
import { TamaraConfigService } from '@core/services/tamara/tamara-config.service';

@Component({
  selector: 'app-tamara-widget',
  standalone: true,
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div
      class="tamara-widget-container"
      [attr.dir]="currentLanguage() === 'ar' ? 'rtl' : 'ltr'"
    >
      <!-- Official Tamara widget element as per documentation -->
      <tamara-widget
        type="tamara-summary"
        inline-type="2"
        [attr.amount]="amount()"
      >
      </tamara-widget>
    </div>
  `,
  styleUrls: ['./tamara-widget.component.css'],
})
export class TamaraWidgetComponent implements OnDestroy {
  private _languageService = inject(LanguageService);
  private _tamaraConfig = inject(TamaraConfigService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Input properties
  amount = input.required<number>();
  publicKey = input<string>(this._tamaraConfig.getPublicKey());
  country = input<string>(this._tamaraConfig.getCountry());
  widgetType = input<string>('tamara-summary');

  // Signals
  currentLanguage = signal<string>('ar');
  private isWidgetInitialized = signal(false);

  constructor() {
    // Track language changes
    this._languageService.getLanguage().subscribe((lang) => {
      this.currentLanguage.set(lang);
      // Refresh widget when language changes (after initialization)
      if (this.isWidgetInitialized()) {
        this.refreshWidget();
      }
    });

    // Initialize widget when component initializes
    effect(() => {
      if (this.isBrowser && this.amount() > 0) {
        this.initializeTamaraWidget();
      }
    });
  }

  private initializeTamaraWidget(): void {
    if (!this.isBrowser) return;

    // Set global Tamara widget configuration as per official docs
    this.setGlobalConfig();

    // Load the official Tamara widget script
    this.loadTamaraScript();
  }

  private setGlobalConfig(): void {
    // Set the global tamaraWidgetConfig as specified in Tamara docs
    (window as any).tamaraWidgetConfig = {
      lang: this.currentLanguage(), // ar|en
      country: this.country(), // ISO country code (SA, AE, etc.)
      publicKey: this.publicKey(), // Tamara public key
      style: {
        fontSize: '16px',
        badgeRatio: 1, // Logo size ratio
      },
      amount: this.amount(),
    };
  }

  private loadTamaraScript(): void {
    // Check if script already exists
    const existingScript = document.getElementById('tamara-widget-v2-script');
    if (existingScript) {
      // Script exists, just refresh the widget
      this.refreshWidget();
      return;
    }

    // Create the official Tamara widget script element
    const script = document.createElement('script');
    script.id = 'tamara-widget-v2-script';
    script.src = 'https://cdn-sandbox.tamara.co/widget-v2/tamara-widget.js';
    script.defer = true;

    script.onload = () => {
      console.log('Tamara Widget V2 script loaded successfully');
      this.isWidgetInitialized.set(true);
    };

    script.onerror = () => {
      console.error('Failed to load Tamara Widget V2 script');
    };

    document.head.appendChild(script);
  }

  private refreshWidget(): void {
    // Update global config for language/country changes
    if ((window as any).tamaraWidgetConfig) {
      (window as any).tamaraWidgetConfig.lang = this.currentLanguage();
      (window as any).tamaraWidgetConfig.country = this.country();
    }

    // Call refresh method as specified in Tamara docs
    if (
      (window as any).TamaraWidgetV2 &&
      (window as any).TamaraWidgetV2.refresh
    ) {
      (window as any).TamaraWidgetV2.refresh();
      console.log('Tamara widget refreshed for language/country change');
    }
  }

  ngOnDestroy(): void {
    // Clean up if needed
    this.isWidgetInitialized.set(false);
  }
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    tamaraWidgetConfig: any;
    TamaraWidgetV2: any;
  }
}
