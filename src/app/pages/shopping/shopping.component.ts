import {
  animate,
  group,
  query,
  stagger,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ICategory, ISubcategory } from '@core/interfaces/common.model';
import { Globalsearch } from '@core/interfaces/globalsearch';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { CommonService } from '@core/services/common/common.service';
import { API_CONFIG } from '@core/services/conf/api.config';
import { ApiService } from '@core/services/conf/api.service';
import { SearchService } from '@core/services/search/search.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ShoppingSkeletonComponent } from '@shared/components/skeleton/shopping-skeleton/shopping-skeleton.component';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ArticlesHeaderComponent } from '../articles/components/articles-header/articles-header.component';
import { SharedBestSellerComponent } from '../home/components/best-seller/components/shared-best-seller/shared-best-seller.component';
import { IAllProduct } from './res/products.interface';
import { ProductsService } from './res/products.service';

export type StockFilterType = 'all' | 'available' | 'unavailable';

@Component({
  selector: 'app-shopping',
  standalone: true,
  imports: [
    ArticlesHeaderComponent,
    CommonModule,
    TranslateModule,
    SharedBestSellerComponent,
    ReactiveFormsModule,
    FormsModule,
    CustomTranslatePipe,
    ShoppingSkeletonComponent,
    RouterModule,
  ],
  templateUrl: './shopping.component.html',
  styleUrl: './shopping.component.css',
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
    trigger('filterAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate(
          '350ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('productGridAnimation', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger('50ms', [
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
    trigger('badgeAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('250ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'scale(0.8)' })
        ),
      ]),
    ]),
    trigger('chipAnimation', [
      transition(':enter', [
        style({ opacity: 0, width: 0, marginRight: 0 }),
        group([
          animate('300ms ease', style({ opacity: 1 })),
          animate('300ms ease', style({ width: '*' })),
          animate('300ms ease', style({ marginRight: '*' })),
        ]),
      ]),
      transition(':leave', [
        group([
          animate('200ms ease', style({ opacity: 0 })),
          animate('200ms ease', style({ width: 0 })),
          animate('200ms ease', style({ marginRight: 0 })),
        ]),
      ]),
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate(
          '300ms ease-out',
          style({ transform: 'translateX(0)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ transform: 'translateX(100%)', opacity: 0 })
        ),
      ]),
    ]),
    trigger('cardHover', [
      state(
        'normal',
        style({
          transform: 'translateY(0)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        })
      ),
      state(
        'hovered',
        style({
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 15px rgba(0, 0, 0, 0.15)',
        })
      ),
      transition('normal <=> hovered', animate('200ms ease-in-out')),
    ]),
  ],
  host: { ngSkipHydration: 'true' },
})
export class ShoppingComponent implements OnInit, OnDestroy {
  // ===== Services =====
  private readonly _translate = inject(TranslateService);

  private readonly productsService = inject(ProductsService);

  private readonly categoryService = inject(CommonService);

  private readonly apiService = inject(ApiService);

  private readonly searchService = inject(SearchService);

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly platformId = inject(PLATFORM_ID);

  // ===== Constants =====
  readonly API_CONFIG_IMAGE = API_CONFIG.BASE_URL_IMAGE;

  // Check if running in browser
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // ===== State Management =====
  readonly selectedFilters = signal<string[]>([]);

  readonly filteredProducts = signal<IAllProduct[]>([]);

  readonly paginatedProducts = signal<IAllProduct[]>([]);

  readonly stockFilter = signal<StockFilterType>('all');

  readonly currentPage = signal<number>(1);

  readonly totalPages = signal<number>(1);

  readonly searchQuery = signal<string>('');

  readonly categoryId = signal<string | null>(null);

  readonly categoryName = signal<string | null>(null);

  readonly subcategoryId = signal<string | null>(null);

  readonly subcategoryName = signal<string | null>(null);

  readonly isLoading = signal<boolean>(true);

  // Card hover states
  productHoverStates: { [key: number]: string } = {};

  products: IAllProduct[] = [];

  categories: ICategory[] = [];

  // ===== Subscriptions =====
  private searchSubscription: Subscription | null = null;
  private searchToggleSubscription: Subscription | null = null;
  private searchQuerySubscription: Subscription | null = null;
  private routeParamsSubscription: Subscription | null = null;

  // ===== Pagination Configuration =====
  readonly pageSize = 9; // Products per page

  // ===== Price Range Configuration =====
  minPrice: number = 1;
  maxPrice: number = 50000;

  // ===== Mutation Observer =====
  private mutationObserver: MutationObserver | null = null;

  // ===== New State Management for API-driven filtering =====
  readonly subcategoriesForCategory = signal<Map<string, ISubcategory[]>>(
    new Map()
  );
  readonly selectedCategoryIds = signal<string[]>([]);
  readonly selectedSubcategoryIds = signal<string[]>([]);

  // ===== Lifecycle Hooks =====
  /**
   * Initializes the component by fetching products and categories
   */
  ngOnInit(): void {
    this.getAllCategories();
    this.setupSearchListener();
    this.setupRouteParamsListener();

    // Subscribe to search toggle events
    this.searchToggleSubscription = this.searchService.searchToggle$.subscribe(
      (isOpen) => this.onNavbarSearchToggle(isOpen)
    );

    // Subscribe to search query events with debounce
    this.searchQuerySubscription = this.searchService.searchQuery$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((query) => {
        // Update local search query state
        this.searchQuery.set(query);

        // Apply search filter to existing products
        this.applySearchFilter();
      });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }

    if (this.searchToggleSubscription) {
      this.searchToggleSubscription.unsubscribe();
    }

    if (this.searchQuerySubscription) {
      this.searchQuerySubscription.unsubscribe();
    }

    if (this.routeParamsSubscription) {
      this.routeParamsSubscription.unsubscribe();
    }

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }

  /**
   * Sets up listener for route query parameters
   * Handles category and subcategory filtering from URL
   */
  private setupRouteParamsListener(): void {
    // Track previous route parameters to avoid duplicate API calls
    let previousCategoryId: string | null = null;
    let previousSubcategoryId: string | null = null;
    let previousSearchQuery: string | null = null;
    let previousPage: number = 1;

    this.routeParamsSubscription = this.route.queryParams.subscribe(
      (params) => {
        const categoryId = params['categoryId'];
        const subcategoryId = params['subcategoryId'];
        const searchQuery = params['q']; // Get search query from URL if present
        const page = params['page'] ? parseInt(params['page'], 10) : 1;

        // Only make API calls if parameters have changed
        const categoryChanged = categoryId !== previousCategoryId;
        const subcategoryChanged = subcategoryId !== previousSubcategoryId;
        const searchQueryChanged = searchQuery !== previousSearchQuery;
        const pageChanged = page !== previousPage;

        // Update tracking variables
        previousCategoryId = categoryId;
        previousSubcategoryId = subcategoryId;
        previousSearchQuery = searchQuery;
        previousPage = page;

        // Update page state if it changed
        if (pageChanged && page >= 1) {
          this.currentPage.set(page);
        }

        // If search query is present in URL, update the search state
        if (searchQuery) {
          this.searchQuery.set(searchQuery);
          // Also update the search service to maintain consistency
          this.searchService.updateSearchQuery(searchQuery);
          // Update search input field if it exists
          setTimeout(() => {
            if (this.isBrowser) {
              const searchInput = document.getElementById(
                'desktop-search'
              ) as HTMLInputElement;
              if (searchInput) {
                searchInput.value = searchQuery;
              }
            }
          }, 100);
        }

        // If neither filter parameter changed, don't make a new API call
        // Note: We still process the search query above even if no API call is needed
        if (!categoryChanged && !subcategoryChanged) {
          if (searchQueryChanged && this.products.length > 0) {
            // If only search query changed and we already have products, just apply search filter
            this.applySearchFilter();
          } else if (pageChanged) {
            // If only page changed, always update paginated products
            // No need to check filteredProducts length as we might need to load page 1 data
            if (this.filteredProducts().length > 0) {
              this.updatePaginatedProducts();
            } else if (this.products.length === 0) {
              // If no products loaded yet, load them
              this.getAllProducts();
            }
          } else if (!searchQueryChanged && !pageChanged) {
            // If no changes at all and we have no products, load initial data
            if (this.products.length === 0) {
              this.getAllProducts();
            }
          }
          return;
        }

        this.isLoading.set(true);

        if (categoryId) {
          // Set category ID parameter
          this.categoryId.set(categoryId);

          // Reset subcategory filters
          this.subcategoryId.set(null);
          this.subcategoryName.set(null);

          // Set up API filters
          this.selectedCategoryIds.set([categoryId]);
          this.selectedSubcategoryIds.set([]);

          // Update URL to reflect the change, preserve page if valid
          const queryParams: any = { categoryId };
          if (page > 1) {
            queryParams.page = page;
          }

          this.router.navigate(
            ['/' + this._translate.currentLang + '/shopping'],
            {
              queryParams,
              replaceUrl: true,
            }
          );

          // Use globalSearch instead of old API
          this.fetchFilteredProducts();

          // Set category name and checkbox state
          this.setCategoryUIState(categoryId);

          // Fetch subcategories for this category
          this.fetchSubcategoriesForCategory(categoryId);
        } else if (subcategoryId) {
          // Set subcategory ID parameter
          this.subcategoryId.set(subcategoryId);

          // Reset category filters
          this.categoryId.set(null);
          this.categoryName.set(null);

          // Find the parent category for this subcategory and set it up
          this.handleSubcategorySelection(subcategoryId);
        } else {
          // No category/subcategory filter, get all products
          // Only fetch if we're transitioning from having a filter to no filter
          if (categoryChanged || subcategoryChanged) {
            // Reset category and subcategory filters
            this.selectedCategoryIds.set([]);
            this.selectedSubcategoryIds.set([]);
            this.getAllProducts();
          }
        }
      }
    );
  }

  // ===== Public Methods =====
  /**
   * Sets up event listener for the navbar search input
   */
  private setupSearchListener(): void {
    // Only run in browser environment
    if (!this.isBrowser) {
      return;
    }

    // Initial attempt to find the search input
    this.checkAndSetupSearchInput();

    // Create MutationObserver to detect when search input is added to the DOM
    const observer = new MutationObserver(() => {
      this.checkAndSetupSearchInput();
    });

    // Start observing the document body for DOM changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Clean up observer on component destroy
    this.mutationObserver = observer;
  }

  /**
   * Checks for search input element and sets up listeners
   */
  private checkAndSetupSearchInput(): void {
    // Only run in browser environment
    if (!this.isBrowser) {
      return;
    }

    const searchInput = document.getElementById(
      'desktop-search'
    ) as HTMLInputElement;

    // If we found the input and haven't subscribed yet
    if (searchInput && !this.searchSubscription) {
      // If we have an active search query, update the input field
      if (this.searchQuery()) {
        searchInput.value = this.searchQuery();
      }

      // We don't need to set up a local subscription for the input events
      // since the navbar component already handles this through the search service

      // Check if there's a query parameter in the URL for search
      const urlParams = new URLSearchParams(window.location.search);
      const searchParam = urlParams.get('q');

      if (searchParam) {
        searchInput.value = searchParam;
        this.searchQuery.set(searchParam.trim().toLowerCase());
        this.resetPagination();
        this.applyFilters();
      }
    }
  }

  /**
   * Handles category filter toggle events
   * Updates selected filters based on checkbox state
   * Maintains language-aware category slugs
   */
  toggleFilter(category: ICategory, event: any): void {
    console.log(category);
    console.log(event);
    const isChecked =
      event.checked !== undefined ? event.checked : event.target.checked;
    const currentFilters = this.selectedFilters();
    console.log(currentFilters);

    const currentLang = this._translate.currentLang;
    const categorySlug =
      currentLang === 'en' ? category.en_slug : category.ar_slug;

    // If a subcategory filter is active and we're checking a category filter,
    // clear the subcategory filter from the route
    if (isChecked && this.subcategoryId()) {
      this.subcategoryId.set(null);
      this.subcategoryName.set(null);

      // Update URL to remove subcategory parameter, but maintain categoryId
      this.router.navigate(['/' + currentLang + '/shopping'], {
        queryParams: { categoryId: category.id },
        replaceUrl: true,
      });
    }

    if (isChecked) {
      // Add category slug to UI filters if not already present
      if (!currentFilters.includes(categorySlug)) {
        this.selectedFilters.set([...currentFilters, categorySlug]);
      }

      // Add category ID to API filter
      this.selectedCategoryIds.update((ids) => {
        if (!ids.includes(category.id.toString())) {
          return [...ids, category.id.toString()];
        }
        return ids;
      });

      // Fetch subcategories for this category to show as filter options
      this.fetchSubcategoriesForCategory(category.id.toString());

      // Don't clear subcategory IDs - allow multiple subcategory selection under same category
    } else {
      // UNCHECKING A CATEGORY - Clear both category and its subcategories
      console.log(isChecked);

      // Remove from UI filters
      this.selectedFilters.set(
        currentFilters.filter((item) => item !== categorySlug)
      );

      // Remove from API filter
      this.selectedCategoryIds.update((ids) =>
        ids.filter((id) => id !== category.id.toString())
      );

      // Remove ALL subcategory IDs that belong to this category
      this.selectedSubcategoryIds.update((ids) => {
        // Keep subcategory IDs that don't belong to the removed category
        const subcategories = Array.from(
          this.subcategoriesForCategory().values()
        ).flat();
        return ids.filter((id) => {
          const subcategory = subcategories.find(
            (sub) => sub.id.toString() === id
          );
          return subcategory && subcategory.category_id !== category.id;
        });
      });

      // Clear route parameters if this was the active category/subcategory
      if (
        this.categoryId() === category.id.toString() ||
        this.subcategoryId()
      ) {
        this.categoryId.set(null);
        this.categoryName.set(null);
        this.subcategoryId.set(null);
        this.subcategoryName.set(null);

        // Update URL to remove both category and subcategory parameters
        this.router.navigate(['/' + currentLang + '/shopping'], {
          replaceUrl: true,
        });
      }
    }

    // Call globalSearch API with current filters
    this.fetchFilteredProducts();
  }

  /**
   * Toggles the stock availability filter
   * Updates the filter state and applies filters
   */
  toggleAvailabilityFilter(isAvailable: boolean, event?: any): void {
    // Get the actual checked state from the event if provided
    const actuallyChecked = event ? event.checked : undefined;

    // If the current filter is already set to the same value, toggle it off
    if (
      (isAvailable && this.stockFilter() === 'available') ||
      (!isAvailable && this.stockFilter() === 'unavailable')
    ) {
      this.stockFilter.set('all');
    } else {
      this.stockFilter.set(isAvailable ? 'available' : 'unavailable');
    }

    // If all filters are now removed, reset to show all products
    if (
      this.selectedFilters().length === 0 &&
      this.selectedCategoryIds().length === 0 &&
      this.selectedSubcategoryIds().length === 0 &&
      this.stockFilter() === 'all' &&
      this.minPrice === 1 &&
      this.maxPrice === 50000 &&
      !this.searchQuery()
    ) {
      this.getAllProducts();
    } else {
      // Call globalSearch API with updated filters
      this.fetchFilteredProducts();
    }
  }

  /**
   * Handles price range changes during slider movement
   * Updates UI but doesn't trigger API call
   */
  onPriceChange(): void {
    this.adjustPriceRange();
    // Don't apply filters here - wait for Apply button
  }

  /**
   * Handles the completion of price range sliding
   * Checks if price is back to default
   */
  onPriceRangeComplete(): void {
    // Check if we're back to default price range and no other filters
    const isDefaultPrice =
      Math.abs(this.minPrice - 1) < 5 && Math.abs(this.maxPrice - 50000) < 5;

    if (
      isDefaultPrice &&
      this.selectedFilters().length === 0 &&
      this.selectedCategoryIds().length === 0 &&
      this.selectedSubcategoryIds().length === 0 &&
      this.stockFilter() === 'all' &&
      !this.searchQuery()
    ) {
      // Force reset to exact defaults
      this.resetPriceToDefault();
    }
  }

  /**
   * Applies the current price filter
   * Triggers API call with current price range
   */
  applyPriceFilter(): void {
    // Call API with current filters including price range
    this.fetchFilteredProducts();
  }

  /**
   * Resets price filters to default values
   */
  resetPriceToDefault(): void {
    this.minPrice = 1;
    this.maxPrice = 50000;

    if (
      this.selectedFilters().length === 0 &&
      this.selectedCategoryIds().length === 0 &&
      this.selectedSubcategoryIds().length === 0 &&
      this.stockFilter() === 'all' &&
      !this.searchQuery()
    ) {
      this.getAllProducts();
    } else {
      // Call API with updated filters
      this.fetchFilteredProducts();
    }
  }

  /**
   * Clears all active filters
   * Resets checkboxes to unchecked state
   * Restores full product list
   */
  clearAllFilters(): void {
    // Reset all filter state
    this.selectedFilters.set([]);
    this.selectedCategoryIds.set([]);
    this.selectedSubcategoryIds.set([]);
    this.stockFilter.set('all');
    this.minPrice = 1;
    this.maxPrice = 50000;
    this.searchQuery.set('');
    this.categoryId.set(null);
    this.categoryName.set(null);
    this.subcategoryId.set(null);
    this.subcategoryName.set(null);

    // Clear the search input field
    if (this.isBrowser) {
      const searchInput = document.getElementById(
        'desktop-search'
      ) as HTMLInputElement;
      if (searchInput) {
        searchInput.value = '';
      }
    }

    // Also update the search service to maintain consistency
    this.searchService.updateSearchQuery('');

    // Reset all checkboxes in the UI
    this.resetCheckboxes();

    // Update URL to remove all query parameters
    this.router.navigate(['/' + this._translate.currentLang + '/shopping'], {
      replaceUrl: true,
      queryParams: {}, // Clear all query parameters
    });

    // Fetch all products since we've cleared all filters
    this.getAllProducts();
  }

  /**
   * Handles badge removal events
   * Updates selected filters
   * Unchecks corresponding category checkbox
   */
  onBadgeRemoved(badge: string): void {
    const currentFilters = this.selectedFilters();

    // Remove from UI filters
    this.selectedFilters.set(
      currentFilters.filter((filter) => filter !== badge)
    );

    // Uncheck the corresponding checkbox in UI
    this.uncheckCategoryCheckbox(badge);

    // Find the category that matches this badge
    const currentLang = this._translate.currentLang;
    const category = this.categories.find(
      (cat) => (currentLang === 'en' ? cat.en_slug : cat.ar_slug) === badge
    );

    // If we found the category, remove it from selected category IDs
    if (category) {
      const categoryId = category.id.toString();
      this.selectedCategoryIds.update((ids) =>
        ids.filter((id) => id !== categoryId)
      );

      // Also remove any subcategories belonging to this category
      this.selectedSubcategoryIds.update((ids) => {
        // Get all subcategories
        const subcategories = Array.from(
          this.subcategoriesForCategory().values()
        ).flat();
        // Filter out subcategories belonging to the removed category
        return ids.filter((id) => {
          const subcategory = subcategories.find(
            (sub) => sub.id.toString() === id
          );
          return subcategory && subcategory.category_id !== category.id;
        });
      });

      // Check if this badge corresponds to the current category filter in URL
      if (category.id.toString() === this.categoryId()) {
        this.categoryId.set(null);
        this.categoryName.set(null);

        // Update URL to remove the category ID parameter
        this.router.navigate(
          ['/' + this._translate.currentLang + '/shopping'],
          {
            replaceUrl: true,
          }
        );
      }
    } else {
      // If it's not a category badge, it might be a subcategory badge
      // Check all subcategories from all categories
      const allSubcategories = Array.from(
        this.subcategoriesForCategory().values()
      ).flat();
      const subcategory = allSubcategories.find(
        (sub) => (currentLang === 'en' ? sub.en_slug : sub.ar_slug) === badge
      );

      if (subcategory) {
        // Remove this subcategory from selected subcategories
        const subcategoryId = subcategory.id.toString();
        this.selectedSubcategoryIds.update((ids) =>
          ids.filter((id) => id !== subcategoryId)
        );

        // Call API with updated filters
        this.fetchFilteredProducts();
        return;
      }
    }

    // If we removed the last filter, reset to full product list
    if (
      this.selectedFilters().length === 0 &&
      this.selectedCategoryIds().length === 0 &&
      this.selectedSubcategoryIds().length === 0 &&
      this.stockFilter() === 'all' &&
      this.minPrice === 1 &&
      this.maxPrice === 50000 &&
      !this.searchQuery()
    ) {
      this.getAllProducts();
    } else {
      // Call API with updated filters
      this.fetchFilteredProducts();
    }
  }

  /**
   * Navigate to the specified page
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.navigateToPage(page);
    }
  }

  /**
   * Navigate to the previous page
   */
  previousPage(): void {
    if (this.currentPage() > 1) {
      this.navigateToPage(this.currentPage() - 1);
    }
  }

  /**
   * Navigate to the next page
   */
  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.navigateToPage(this.currentPage() + 1);
    }
  }

  /**
   * Navigate to a specific page using URL parameters
   */
  private navigateToPage(page: number): void {
    const currentParams = { ...this.route.snapshot.queryParams };

    // Remove page parameter if going to page 1, otherwise set it
    if (page === 1) {
      delete currentParams['page'];
    } else {
      currentParams['page'] = page.toString();
    }

    this.router.navigate([], {
      queryParams: currentParams,
      queryParamsHandling: 'merge',
    });
  }

  /**
   * Opens the navbar search box when clicking the search hint
   */
  openSearchBox(): void {
    // Use the search service to open the search
    this.searchService.toggleSearch(true);

    // Find the navbar search button and click it as a fallback
    if (this.isBrowser) {
      const searchButton = document.querySelector(
        '.search-container button'
      ) as HTMLButtonElement;
      if (searchButton) {
        searchButton.click();
      }
    }
  }

  /**
   * Syncs the shopping component's search state with the navbar search
   * @param isNavbarSearchOpen Whether the navbar search is open
   */
  public onNavbarSearchToggle(isNavbarSearchOpen: boolean): void {
    if (isNavbarSearchOpen && this.isBrowser) {
      setTimeout(() => {
        const searchInput = document.getElementById(
          'desktop-search'
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    } else if (!isNavbarSearchOpen && this.searchQuery()) {
      // If navbar search is closed and we had a search query, clear it
      // this.clearSearchFilter();
    }
  }

  /**
   * Clears only the search filter
   */

  clearSearchFilter(): void {
    // Clear local search query state
    this.searchQuery.set('');

    // Also update the search service to maintain consistency
    this.searchService.updateSearchQuery('');

    // Clear the search input field in the UI
    if (this.isBrowser) {
      const searchInput = document.getElementById(
        'desktop-search'
      ) as HTMLInputElement;
      if (searchInput) {
        searchInput.value = '';
      }
    }

    // Remove search query parameter from URL
    this.router.navigate([], {
      queryParams: { q: null },
      queryParamsHandling: 'merge', // Keep other query parameters
    });

    // Since search is a local filter, we can just reset the local filter
    this.filteredProducts.set(this.products);
    this.updatePaginationAfterFiltering();
  }

  // ===== Private Methods =====
  /**
   * Applies current filters to product list
   * Filters products based on selected category slugs and stock status
   * Handles language-specific category matching
   */
  private applyFilters(): void {
    const selectedSlugs = this.selectedFilters();
    const currentLang = this._translate.currentLang;
    const stockFilterValue = this.stockFilter();
    const searchQuery = this.searchQuery();

    // If no filters are applied and stock filter is 'all', just show all products
    const isDefaultPrice =
      Math.abs(this.minPrice - 1) < 5 && Math.abs(this.maxPrice - 50000) < 5;

    if (
      selectedSlugs.length === 0 &&
      stockFilterValue === 'all' &&
      isDefaultPrice &&
      !searchQuery
    ) {
      // Force reset to exact defaults
      this.minPrice = 1;
      this.maxPrice = 50000;
      this.resetFilters();
      return;
    }

    let filtered = this.products;

    // Apply search filter first for better performance
    // (reduce the dataset before applying other filters)
    if (searchQuery) {
      filtered = filtered.filter((product) => {
        // Get language-specific name and description
        const productName =
          currentLang === 'en'
            ? product.en_name?.toLowerCase() || ''
            : product.ar_name?.toLowerCase() || '';

        const productDescription =
          currentLang === 'en'
            ? product.en_description?.toLowerCase() || ''
            : product.ar_description?.toLowerCase() || '';

        // Get language-specific slugs for product and its category
        const productSlug =
          currentLang === 'en'
            ? product.en_slug?.toLowerCase() || ''
            : product.ar_slug?.toLowerCase() || '';

        const categorySlug =
          currentLang === 'en'
            ? product.category?.en_slug?.toLowerCase() || ''
            : product.category?.ar_slug?.toLowerCase() || '';

        const subcategorySlug = product.subcategory
          ? currentLang === 'en'
            ? product.subcategory.en_slug?.toLowerCase() || ''
            : product.subcategory.ar_slug?.toLowerCase() || ''
          : '';

        // More comprehensive search across multiple fields
        return (
          productName.includes(searchQuery) ||
          productDescription.includes(searchQuery) ||
          productSlug.includes(searchQuery) ||
          categorySlug.includes(searchQuery) ||
          subcategorySlug.includes(searchQuery) ||
          // Optional fields from any custom product properties
          (product as any).sku?.toLowerCase()?.includes(searchQuery) ||
          (product as any).barcode?.toLowerCase()?.includes(searchQuery)
        );
      });
    }

    // Apply category filters - this takes precedence over subcategory filters
    if (selectedSlugs.length > 0) {
      // If we have manual category filters applied, they should override subcategory context
      if (this.subcategoryId() && !this.categoryId()) {
        // Clear subcategory context since category filters take precedence
        this.subcategoryId.set(null);
        this.subcategoryName.set(null);

        // Don't update URL here, as that was already handled in toggleFilter
      }

      filtered = filtered.filter((product) => {
        const productSlug =
          currentLang === 'en'
            ? product.category?.en_slug
            : product.category?.ar_slug;
        return selectedSlugs.includes(productSlug || '');
      });
    }

    // Apply stock status filter
    if (stockFilterValue === 'available') {
      filtered = filtered.filter((product) => product.stock_status === true);
    } else if (stockFilterValue === 'unavailable') {
      filtered = filtered.filter((product) => product.stock_status === false);
    }

    // Apply price filter
    filtered = filtered.filter((product) => {
      // Convert product price to number
      let productPrice = 0;

      if (typeof product.price === 'string') {
        productPrice = parseFloat(product.price);
      } else if (typeof product.price === 'number') {
        productPrice = product.price;
      } else if (product.price_after_sale) {
        // Try to use price_after_sale if price is invalid
        productPrice =
          typeof product.price_after_sale === 'string'
            ? parseFloat(product.price_after_sale)
            : product.price_after_sale;
      }

      // Handle NaN cases
      if (isNaN(productPrice)) {
        return false;
      }

      return productPrice >= this.minPrice && productPrice <= this.maxPrice;
    });

    // First update filtered products
    this.filteredProducts.set(filtered);

    // Then update total pages
    const newTotalPages = Math.max(
      1,
      Math.ceil(filtered.length / this.pageSize)
    );
    this.totalPages.set(newTotalPages);

    // Only reset to page 1 if current page is invalid or if we're not coming from URL
    const currentPageValue = this.currentPage();
    if (currentPageValue > newTotalPages || currentPageValue < 1) {
      this.currentPage.set(1);
    }

    // Finally update the paginated products
    this.updatePaginatedProducts();
  }

  /**
   * Updates the paginated products based on current page and page size
   */
  private updatePaginatedProducts(): void {
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    const filtered = this.filteredProducts();

    const paginatedItems = filtered.slice(start, end);
    this.paginatedProducts.set(paginatedItems);
  }

  /**
   * Reset filters to show all products but keep pagination state
   */
  private resetFilters(): void {
    // Force reset price to exact defaults
    this.minPrice = 1;
    this.maxPrice = 50000;

    // Reset to show all products
    this.filteredProducts.set(this.products);

    // Recalculate total pages based on all products
    const totalPages = Math.max(
      1,
      Math.ceil(this.products.length / this.pageSize)
    );
    this.totalPages.set(totalPages);

    // Reset to first page
    this.currentPage.set(1);

    // Update paginated products
    this.updatePaginatedProducts();
  }

  /**
   * Reset pagination to first page
   */
  private resetPagination(): void {
    this.currentPage.set(1);
    // Also clear page parameter from URL if it exists
    const currentParams = { ...this.route.snapshot.queryParams };
    if (currentParams['page']) {
      delete currentParams['page'];
      this.router.navigate([], {
        queryParams: currentParams,
        queryParamsHandling: 'merge',
      });
    }
  }

  /**
   * Fetches all products from the API
   * Initializes the product list and filtered products
   */
  private getAllProducts(): void {
    this.isLoading.set(true);
    this.productsService.getAllProducts().subscribe({
      next: (response: any) => {
        this.products = response.products || [];

        // Reset filters for clean state
        this.selectedCategoryIds.set([]);
        this.selectedSubcategoryIds.set([]);

        // Apply any search filter if active
        if (this.searchQuery()) {
          this.applySearchFilter();
        } else {
          this.filteredProducts.set(this.products);
        }

        // Update pagination
        const initialTotalPages = Math.ceil(
          this.filteredProducts().length / this.pageSize
        );
        this.totalPages.set(Math.max(1, initialTotalPages));

        // Only reset to page 1 if current page is invalid or if we're not coming from URL
        const currentPageValue = this.currentPage();
        if (currentPageValue > initialTotalPages || currentPageValue < 1) {
          this.currentPage.set(1);
        }

        this.updatePaginatedProducts();

        this.isLoading.set(false);

        // Initialize hover states for products
        this.initProductHoverStates();
      },
      error: (err) => {
        console.error('Error fetching products:', err);
        this.products = [];
        this.filteredProducts.set([]);
        this.paginatedProducts.set([]);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Fetches all categories from the API
   * Initializes the category list for filtering
   */
  private getAllCategories(): void {
    this.categoryService.getAllCategories().subscribe((response: any) => {
      this.categories = response.categories;
    });
  }

  /**
   * Resets all checkbox inputs to unchecked state
   */
  private resetCheckboxes(): void {
    if (!this.isBrowser) {
      return;
    }

    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox: any) => {
      checkbox.checked = false;
    });
  }

  /**
   * Unchecks the checkbox for a specific category
   */
  private uncheckCategoryCheckbox(badge: string): void {
    if (!this.isBrowser) {
      return;
    }

    const checkbox = document.querySelector(
      `input[type="checkbox"][data-slug="${badge}"]`
    ) as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = false;
    }
  }

  /**
   * Adjusts price range to maintain minimum gap
   */
  private adjustPriceRange(): void {
    if (this.minPrice > this.maxPrice - 50) {
      this.minPrice = this.maxPrice - 50;
    }
    if (this.maxPrice < this.minPrice + 50) {
      this.maxPrice = this.minPrice + 50;
    }
  }

  /**
   * Track product card hover state
   */
  onProductMouseEnter(productId: number): void {
    this.productHoverStates[productId] = 'hovered';
  }

  onProductMouseLeave(productId: number): void {
    this.productHoverStates[productId] = 'normal';
  }

  /**
   * Initialize product hover states after products are loaded
   */
  private initProductHoverStates(): void {
    this.products.forEach((product) => {
      this.productHoverStates[product.id] = 'normal';
    });
  }

  /**
   * Builds the global search request object from current filters
   */
  private buildGlobalSearchRequest(): Globalsearch {
    const userId = this.productsService.authService.getUserId();

    if (!userId) {
      console.warn('User ID is not available, using empty string');
    }

    return {
      user_id: userId || '',
      category_ids: this.selectedCategoryIds(),
      subcategory_ids: this.selectedSubcategoryIds(),
      min_price: this.minPrice,
      max_price: this.maxPrice,
      stock_status:
        this.stockFilter() === 'available'
          ? '1'
          : this.stockFilter() === 'unavailable'
          ? '0'
          : undefined,
    };
  }

  /**
   * Fetches products using the global search API
   */
  private fetchFilteredProducts(): void {
    this.isLoading.set(true);

    // Reset other filters when using category/subcategory filters from megamenu
    if (
      (this.categoryId() || this.subcategoryId()) &&
      (this.selectedCategoryIds().length > 0 ||
        this.selectedSubcategoryIds().length > 0)
    ) {
      this.stockFilter.set('all');
      this.minPrice = 1;
      this.maxPrice = 50000;
    }

    // If no filters are applied, get all products
    if (
      this.selectedCategoryIds().length === 0 &&
      this.selectedSubcategoryIds().length === 0 &&
      this.stockFilter() === 'all' &&
      this.minPrice === 1 &&
      this.maxPrice === 50000
    ) {
      this.getAllProducts();
      return;
    }

    const searchRequest = this.buildGlobalSearchRequest();

    this.productsService.globalSearch(searchRequest).subscribe({
      next: (response: any) => {
        this.products = response.products || [];

        // Apply any local search filter if active
        if (this.searchQuery()) {
          this.applySearchFilter();
        } else {
          this.filteredProducts.set(this.products);
          this.updatePaginationAfterFiltering();
        }

        this.isLoading.set(false);
        this.initProductHoverStates();
      },
      error: (err) => {
        console.error('Error fetching filtered products:', err);
        this.products = [];
        this.filteredProducts.set([]);
        this.paginatedProducts.set([]);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Updates pagination after filtering
   */
  private updatePaginationAfterFiltering(): void {
    const totalPages = Math.max(
      1,
      Math.ceil(this.filteredProducts().length / this.pageSize)
    );
    this.totalPages.set(totalPages);

    // Reset to first page when filters change
    this.resetPagination();

    // Update paginated products
    this.updatePaginatedProducts();
  }

  /**
   * Applies search filter to products returned from API
   */
  private applySearchFilter(): void {
    const searchQuery = this.searchQuery().trim().toLowerCase();

    if (!searchQuery) {
      // No search query, just use the API results
      this.filteredProducts.set(this.products);
    } else {
      const currentLang = this._translate.currentLang;

      // Filter products locally based on search query
      const filtered = this.products.filter((product) => {
        // Get language-specific name and description
        const productName =
          currentLang === 'en'
            ? product.en_name?.toLowerCase() || ''
            : product.ar_name?.toLowerCase() || '';

        const productDescription =
          currentLang === 'en'
            ? product.en_description?.toLowerCase() || ''
            : product.ar_description?.toLowerCase() || '';

        // Get language-specific slugs for product and its category
        const productSlug =
          currentLang === 'en'
            ? product.en_slug?.toLowerCase() || ''
            : product.ar_slug?.toLowerCase() || '';

        const categorySlug =
          currentLang === 'en'
            ? product.category?.en_slug?.toLowerCase() || ''
            : product.category?.ar_slug?.toLowerCase() || '';

        const subcategorySlug = product.subcategory
          ? currentLang === 'en'
            ? product.subcategory.en_slug?.toLowerCase() || ''
            : product.subcategory.ar_slug?.toLowerCase() || ''
          : '';

        // More comprehensive search across multiple fields
        return (
          productName.includes(searchQuery) ||
          productDescription.includes(searchQuery) ||
          productSlug.includes(searchQuery) ||
          categorySlug.includes(searchQuery) ||
          subcategorySlug.includes(searchQuery) ||
          // Optional fields from any custom product properties
          (product as any).sku?.toLowerCase()?.includes(searchQuery) ||
          (product as any).barcode?.toLowerCase()?.includes(searchQuery)
        );
      });

      this.filteredProducts.set(filtered);
    }

    // Update pagination based on filtered results
    this.updatePaginationAfterFiltering();
  }

  /**
   * Fetches subcategories for a category from the API
   * @param categoryId The category ID
   */
  private fetchSubcategoriesForCategory(categoryId: string): void {
    // Check if we already have the subcategories cached
    if (this.subcategoriesForCategory().has(categoryId)) {
      // We already have the subcategories, so create badges for them
      this.createSubcategoryBadges(categoryId);
      return;
    }

    // Find category in existing categories
    const category = this.categories.find(
      (c) => c.id.toString() === categoryId
    );

    if (
      category &&
      category.subcategories &&
      category.subcategories.length > 0
    ) {
      // Use subcategories from the category if available
      this.subcategoriesForCategory.update((map) => {
        const newMap = new Map(map);
        newMap.set(categoryId, category.subcategories);
        return newMap;
      });

      // Create badges for these subcategories
      this.createSubcategoryBadges(categoryId);
    } else {
      // Show loading state
      this.isLoading.set(true);

      // Call API to get subcategories for this category
      this.apiService
        .get(`${API_CONFIG.CATEGORY.GET_ALL}/${categoryId}/subcategories`, {
          user_id: this.productsService.authService.getUserId(),
        })
        .subscribe({
          next: (response: any) => {
            const subcategories = response.subcategories || [];

            // Cache these subcategories
            this.subcategoriesForCategory.update((map) => {
              const newMap = new Map(map);
              newMap.set(categoryId, subcategories);
              return newMap;
            });

            // Create badges for these subcategories
            this.createSubcategoryBadges(categoryId);

            this.isLoading.set(false);
          },
          error: (err) => {
            console.error('Error fetching subcategories:', err);
            // Set empty array on error
            this.subcategoriesForCategory.update((map) => {
              const newMap = new Map(map);
              newMap.set(categoryId, []);
              return newMap;
            });
            this.isLoading.set(false);
          },
        });
    }
  }

  /**
   * Creates badges for subcategories of a selected category
   * @param categoryId The category ID whose subcategories should be displayed as badges
   */
  private createSubcategoryBadges(categoryId: string): void {
    // Get subcategories for this category
    const subcategories = this.subcategoriesForCategory().get(categoryId) || [];

    if (subcategories.length === 0) return;
  }

  /**
   * Toggles a subcategory filter when a subcategory badge is clicked
   * @param subcategory The subcategory to toggle
   * @param isSelected Whether the subcategory is being selected or deselected
   */
  toggleSubcategoryFilter(
    subcategory: ISubcategory,
    isSelected: boolean
  ): void {
    // Get parent category ID
    const parentCategoryId = subcategory.category_id.toString();
    const subcategoryId = subcategory.id.toString();
    const currentLang = this._translate.currentLang;

    if (isSelected) {
      // Add this subcategory to selected subcategories
      this.selectedSubcategoryIds.update((ids) => {
        if (!ids.includes(subcategoryId)) {
          return [...ids, subcategoryId];
        }
        return ids;
      });

      // Make sure the parent category is selected in API state
      if (!this.selectedCategoryIds().includes(parentCategoryId)) {
        this.selectedCategoryIds.update((ids) => [...ids, parentCategoryId]);
      }

      // Update UI state - check parent category checkbox and add to selectedFilters
      const parentCategory = this.categories.find(
        (cat) => cat.id.toString() === parentCategoryId
      );

      if (parentCategory) {
        const categorySlug =
          currentLang === 'en'
            ? parentCategory.en_slug
            : parentCategory.ar_slug;

        // Add parent category to UI filters if not already present
        const currentFilters = this.selectedFilters();
        if (categorySlug && !currentFilters.includes(categorySlug)) {
          this.selectedFilters.set([...currentFilters, categorySlug]);
        }

        // Check the parent category checkbox in UI
        setTimeout(() => {
          if (this.isBrowser) {
            const checkbox = document.querySelector(
              `input[type="checkbox"][data-slug="${categorySlug}"]`
            ) as HTMLInputElement;
            if (checkbox) {
              checkbox.checked = true;
            }
          }
        }, 100);
      }
    } else {
      // Remove this subcategory from selected subcategories
      this.selectedSubcategoryIds.update((ids) =>
        ids.filter((id) => id !== subcategoryId)
      );

      // Check if there are any other subcategories selected from the same parent category
      const remainingSubcategoriesFromParent =
        this.selectedSubcategoryIds().filter((id) => {
          const subcategories = Array.from(
            this.subcategoriesForCategory().values()
          ).flat();
          const subcategory = subcategories.find(
            (sub) => sub.id.toString() === id
          );
          return (
            subcategory &&
            subcategory.category_id.toString() === parentCategoryId
          );
        });

      // If no more subcategories from this parent category are selected,
      // uncheck the parent category as well
      if (remainingSubcategoriesFromParent.length === 0) {
        // Remove parent category from API state
        this.selectedCategoryIds.update((ids) =>
          ids.filter((id) => id !== parentCategoryId)
        );

        // Remove parent category from UI state
        const parentCategory = this.categories.find(
          (cat) => cat.id.toString() === parentCategoryId
        );

        if (parentCategory) {
          const categorySlug =
            currentLang === 'en'
              ? parentCategory.en_slug
              : parentCategory.ar_slug;

          // Remove parent category from UI filters
          const currentFilters = this.selectedFilters();
          if (categorySlug && currentFilters.includes(categorySlug)) {
            this.selectedFilters.set(
              currentFilters.filter((filter) => filter !== categorySlug)
            );
          }

          // Uncheck the parent category checkbox in UI
          setTimeout(() => {
            if (this.isBrowser) {
              const checkbox = document.querySelector(
                `input[type="checkbox"][data-slug="${categorySlug}"]`
              ) as HTMLInputElement;
              if (checkbox) {
                checkbox.checked = false;
              }
            }
          }, 100);
        }
      }
    }

    // Call globalSearch API with updated filters
    this.fetchFilteredProducts();
  }

  /**
   * Sets the category UI state
   * @param categoryId The category ID
   */
  private setCategoryUIState(categoryId: string): void {
    const currentLang = this._translate.currentLang;

    // Find the category to get its name and slug
    const category = this.categories.find(
      (c) => c.id.toString() === categoryId
    );

    if (category) {
      const categoryName =
        currentLang === 'en' ? category.en_name : category.ar_name;
      const categorySlug =
        currentLang === 'en' ? category.en_slug : category.ar_slug;

      this.categoryName.set(categoryName);

      // Add category to selected filters and check checkbox
      const currentFilters = this.selectedFilters();
      if (categorySlug && !currentFilters.includes(categorySlug)) {
        this.selectedFilters.set([...currentFilters, categorySlug]);
      }

      // The checkbox state will be automatically updated due to the [checked] binding
      // in the template that checks selectedFilters().includes(categorySlug)
    }
  }

  /**
   * Handles subcategory selection
   * @param subcategoryId The subcategory ID
   */
  private handleSubcategorySelection(subcategoryId: string): void {
    // We need to find the parent category for this subcategory
    // First, let's check if we have it in our cached subcategories
    let parentCategoryId: string | null = null;
    let subcategoryInfo: ISubcategory | null = null;

    // Search through all cached subcategories
    for (const [catId, subcategories] of this.subcategoriesForCategory()) {
      const foundSubcategory = subcategories.find(
        (sub) => sub.id.toString() === subcategoryId
      );
      if (foundSubcategory) {
        parentCategoryId = catId;
        subcategoryInfo = foundSubcategory;
        break;
      }
    }

    if (parentCategoryId && subcategoryInfo) {
      // We found the parent category, set up the filters
      this.setupSubcategoryFilter(
        parentCategoryId,
        subcategoryId,
        subcategoryInfo
      );
    } else {
      // We need to fetch the subcategory info from API
      // For now, let's use globalSearch with just the subcategory ID
      this.selectedSubcategoryIds.set([subcategoryId]);
      this.fetchFilteredProducts();
    }
  }

  /**
   * Sets up subcategory filter with parent category
   */
  private setupSubcategoryFilter(
    parentCategoryId: string,
    subcategoryId: string,
    subcategoryInfo: ISubcategory
  ): void {
    const currentLang = this._translate.currentLang;

    // Set up API filters - parent category + this subcategory
    this.selectedCategoryIds.set([parentCategoryId]);
    this.selectedSubcategoryIds.set([subcategoryId]);

    // Set subcategory name
    const subcategoryName =
      currentLang === 'en' ? subcategoryInfo.en_name : subcategoryInfo.ar_name;
    this.subcategoryName.set(subcategoryName);

    // Find and set parent category info
    const parentCategory = this.categories.find(
      (cat) => cat.id.toString() === parentCategoryId
    );

    if (parentCategory) {
      const categoryName =
        currentLang === 'en' ? parentCategory.en_name : parentCategory.ar_name;
      const categorySlug =
        currentLang === 'en' ? parentCategory.en_slug : parentCategory.ar_slug;

      this.categoryName.set(categoryName);

      // Add parent category to selected filters
      if (categorySlug) {
        this.selectedFilters.set([categorySlug]);
      }

      // The checkbox will be automatically checked due to the [checked] binding
    }

    // Fetch products with current filters
    this.fetchFilteredProducts();
  }

  /**
   * Generates an array of page numbers for pagination controls
   */
  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total === 0) {
      return [1];
    }

    // Show max 5 page numbers with current page in the middle when possible
    const pageNumbers: number[] = [];
    const maxVisiblePages = 5;

    if (total <= maxVisiblePages) {
      // If we have 5 or fewer pages, show all
      for (let i = 1; i <= total; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Calculate start and end for showing pages with current in middle
      let start = Math.max(current - Math.floor(maxVisiblePages / 2), 1);
      let end = start + maxVisiblePages - 1;

      // Adjust if end is beyond total pages
      if (end > total) {
        end = total;
        start = Math.max(end - maxVisiblePages + 1, 1);
      }

      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers.length ? pageNumbers : [1];
  }

  /**
   * Generate query parameters for a specific page
   */
  getPageQueryParams(page: number): any {
    const currentParams = { ...this.route.snapshot.queryParams };

    // Remove page parameter if going to page 1, otherwise set it
    if (page === 1) {
      delete currentParams['page'];
    } else {
      currentParams['page'] = page.toString();
    }

    return currentParams;
  }
}
