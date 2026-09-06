import { isPlatformBrowser, NgClass } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ICategory } from '@core/interfaces/common.model';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';
import { LanguageService } from '../../core/services/lang/language.service';
import { CommonService } from './../../core/services/common/common.service';

interface CategoryResponse {
  categories: ICategory[];
}

@Component({
  selector: 'app-mega-menu',
  standalone: true,
  imports: [TranslateModule, NgClass, RouterLink, CustomTranslatePipe],
  templateUrl: './mega-menu.component.html',
  styleUrl: './mega-menu.component.css',
})
export class MegaMenuComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('menuContent') menuContent!: ElementRef;
  @Input() isMobile: boolean = false;
  @Output() closeMenu = new EventEmitter<void>();

  contentHeight = 0;
  private resizeSub?: Subscription;
  private langSub?: Subscription;
  isLoading = signal(true);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  currentLang = 'en';
  width!: number | string;

  // Inject services
  protected languageService = inject(LanguageService);
  private router = inject(Router);
  private commonService = inject(CommonService);

  // Access categories from the cache signal directly
  private categoriesSignal = this.commonService.categories;

  categories = computed(() => {
    const categoryData = this.categoriesSignal() as CategoryResponse | null;

    if (categoryData && Array.isArray(categoryData.categories)) {
      return categoryData.categories;
    }

    return [];
  });

  // Set up an effect to update loading state when categories change
  constructor(private elementRef: ElementRef) {
    effect(() => {
      // This will run whenever categoriesSignal changes
      const categoryData = this.categoriesSignal();
      if (categoryData) {
        this.isLoading.set(false);
      }
    });
  }

  // Helper function to generate placeholder arrays for loading state
  generateArray(size: number): number[] {
    return Array(size)
      .fill(0)
      .map((_, index) => index);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.updateWidth();
      // Use fromEvent with debounce to handle resize efficiently
      this.resizeSub = fromEvent(window, 'resize')
        .pipe(debounceTime(100))
        .subscribe(() => this.updateWidth());
    }

    this.loadCategories();
    this.setupLanguageSubscription();

    // Only add document click handler in browser environment and only for desktop
    if (this.isBrowser && !this.isMobile) {
      // Add document click handler with a small delay
      setTimeout(() => {
        document.addEventListener('click', this.handleDocumentClick);
      }, 100);
    }
  }

  private setupLanguageSubscription() {
    this.langSub = this.languageService.getLanguage().subscribe((lang) => {
      this.currentLang = lang;
    });
  }

  // Store the handler as a property so we can remove it later
  private handleDocumentClick = (event: Event) => {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeMenu.emit();
    }
  };

  ngAfterViewInit() {
    if (!this.isBrowser) return;

    // Initial height adjustment
    setTimeout(() => {
      this.adjustMenuHeight();
    }, 0);
  }

  ngOnDestroy() {
    // Cleanup event listeners
    if (this.isBrowser) {
      document.removeEventListener('click', this.handleDocumentClick);
    }

    if (this.resizeSub) {
      this.resizeSub.unsubscribe();
    }

    if (this.langSub) {
      this.langSub.unsubscribe();
    }
  }

  private adjustMenuHeight() {
    if (this.menuContent?.nativeElement) {
      this.contentHeight = this.menuContent.nativeElement.scrollHeight;
    }
  }

  /**
   * Load categories directly from category API
   */
  loadCategories() {
    // If we already have categories cached, we don't need to do anything
    if (this.categoriesSignal()) {
      this.isLoading.set(false);
      return;
    }

    // Fetch categories directly from the categories API
    this.commonService
      .getAllCategories()
      .pipe(tap(() => this.isLoading.set(false)))
      .subscribe({
        error: (err) => {
          console.error('Error fetching categories:', err);
          this.isLoading.set(false);
        },
      });
  }

  /**
   * Navigate to shopping page filtered by category
   * @param category The category to filter by
   */
  navigateToCategory(category: ICategory) {
    this.closeMenu.emit();
    this.router.navigate(['/', this.currentLang, 'shopping'], {
      queryParams: {
        categoryId: category.id,
      },
    });
  }

  /**
   * Navigate to shopping page filtered by subcategory
   * @param subcategoryId The subcategory ID to filter by
   */
  navigateToSubcategory(subcategoryId: string) {
    this.router.navigate(['/', this.currentLang, 'shopping'], {
      queryParams: {
        subcategoryId,
      },
    });
    this.closeMenu.emit();
  }

  calculateMenuWidth() {
    // Calculate width based on categories length, but with some constraints
    const categoryCount = this.categories().length;
    if (categoryCount === 0) {
      return '300px'; // Minimum width
    }

    // Set minimum width based on category count
    const baseWidth = Math.max(300, categoryCount * 280);

    // Get window width
    const windowWidth = window.innerWidth;

    // Ensure menu doesn't exceed 80% of window width
    const maxWidth = Math.min(baseWidth, windowWidth * 0.8);
    return `${maxWidth}px`;
  }

  updateWidth() {
    if (!this.isBrowser) return;

    if (this.isMobile) {
      this.width = '100%'; // Mobile view always gets full width
    } else {
      this.width = this.calculateMenuWidth();
    }

    // Always adjust height when width changes
    setTimeout(() => this.adjustMenuHeight(), 0);
  }
}
