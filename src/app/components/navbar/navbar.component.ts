import { isRamadanMonth } from './../../core/services/conf/api.config';
import {
  CommonModule,
  isPlatformBrowser,
  NgClass,
  NgOptimizedImage,
} from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AlertService } from '@shared/alert/alert.service';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, filter, take } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth/auth.service';
import { CartStateService } from '../../core/services/cart/cart-state.service';
import { LanguageService } from '../../core/services/lang/language.service';
import { SearchService } from '../../core/services/search/search.service';
import { WishlistService } from '../../core/services/wishlist/wishlist.service';
import { MegaMenuComponent } from '../mega-menu/mega-menu.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslateModule,
    MegaMenuComponent,
    NgOptimizedImage,
    NgClass,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnDestroy, OnInit {
  showMenu: boolean = false;
  showSearch: boolean = false;
  showMobileSearch: boolean = false;
  showDesktopSearch: boolean = false;
  showProductsMenu = false;
  showMobileProductsMenu = false;
  showMegaMenu = false;
  isMenuOpen = false;
  isRtl = false;
  isLoading = true;
  isRamadanMonth = isRamadanMonth;

  // Custom events for search state
  @Output() searchToggle = new EventEmitter<boolean>();

  // Constants
  private readonly DESKTOP_BREAKPOINT = 1280; // xl breakpoint in Tailwind (in pixels)
  private resizeSubscription?: Subscription;

  private _router = inject(Router);
  private _languageService = inject(LanguageService);
  private _searchService = inject(SearchService);
  private _wishlistService = inject(WishlistService);
  private _cartStateService = inject(CartStateService);
  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);
  private _alertService = inject(AlertService);

  _authService = inject(AuthService);

  // Get wishlist count as a signal
  wishlistCount = this._wishlistService.getWishlistCountSignal();

  // Get cart count as a signal
  cartCount = this._cartStateService.cartCount;

  currentLang$ = this._languageService.getLanguage();

  cartCountSignal = this._authService.cartCountSignal;
  // Add these properties to track clicked elements and dropdown triggers
  private lastClickedElement: HTMLElement | null = null;
  @ViewChild('langDropdownButton', { static: false })
  languageDropdownTrigger!: ElementRef<HTMLElement>;
  @ViewChild('megaMenuTrigger', { static: false })
  megaMenuTrigger!: ElementRef<HTMLElement>;
  @ViewChild('mobileProductsTrigger', { static: false })
  mobileProductsTrigger!: ElementRef<HTMLElement>;

  constructor(
    private renderer: Renderer2,
    private elementRef: ElementRef,
  ) { }

  ngOnInit(): void {
    // Set initial RTL state based on current language
    this.currentLang$.subscribe((lang) => {
      this.isRtl = lang === 'ar';
    });

    // Initialize skeleton loader - hide after styles are loaded
    if (isPlatformBrowser(this.platformId)) {
      // Try to hide skeleton after DOM content is loaded
      document.addEventListener('DOMContentLoaded', () => {
        // Add a small delay to ensure styles are applied
        setTimeout(() => {
          this.isLoading = false;
        }, 500);
      });

      // Fallback: If DOMContentLoaded already fired, hide skeleton after a short delay
      if (
        document.readyState === 'complete' ||
        document.readyState === 'interactive'
      ) {
        setTimeout(() => {
          this.isLoading = false;
        }, 500);
      }

      // Final fallback: Hide skeleton after 2 seconds regardless
      setTimeout(() => {
        this.isLoading = false;
      }, 2000);

      // Add resize listener to close mobile menu when screen size changes
      this.resizeSubscription = fromEvent(window, 'resize')
        .pipe(debounceTime(150))
        .subscribe(() => {
          this.checkScreenWidth();
        });

      // Initial screen width check
      this.checkScreenWidth();
    }

    // Load wishlist count
    this._wishlistService.loadWishlistCount();

    // Check if user is authenticated before initializing cart
    if (this._authService.isAuthenticated()) {
      // Directly fetch the cart to ensure we get the correct count immediately
      this._cartStateService.fetchCart();

      // Set up a periodic refresh every 30 seconds while the user is active
      const refreshCartInterval = setInterval(() => {
        if (
          document.visibilityState === 'visible' &&
          this._authService.isAuthenticated()
        ) {
          this._cartStateService.fetchCart();
        }
      }, 30000); // 30 seconds

      // Clean up interval on component destroy
      this.destroyRef.onDestroy(() => {
        clearInterval(refreshCartInterval);
      });
    } else {
      if (isPlatformBrowser(this.platformId)) {
        this.cartCountSignal.set(
          JSON.parse(localStorage.getItem('orderDetails') || '0').length,
        );
      }
    }

    // Set up event listener to refresh the wishlist count and cart
    // and monitor authentication state
    this._router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event: NavigationEnd) => {
        // Check if authenticated and load data accordingly
        if (this._authService.isAuthenticated()) {
          // For cart pages, we need to check orders and fetch cart
          if (event.url.includes('/cart')) {
            this._cartStateService.checkConfirmedOrders();
            this._cartStateService.fetchCart();
          }
          // // For other pages, just update cart count for the navbar
          // else {
          this._cartStateService.updateCartCount();
          // }
        }
      });
  }

  private checkScreenWidth(): void {
    if (window.innerWidth >= this.DESKTOP_BREAKPOINT && this.isMenuOpen) {
      this.isMenuOpen = false;
      document.body.classList.remove('scroll-lock');
    }
  }

  /**
   * Closes all dropdown menus except for the specified one
   * @param keepOpen The dropdown to keep open (or 'none' to close all)
   */
  public closeAllDropdownsExcept(
    keepOpen: 'menu' | 'search' | 'megaMenu' | 'mobileProducts' | 'none',
  ): void {
    if (keepOpen !== 'menu') {
      this.showMenu = false;
    }

    if (keepOpen !== 'search') {
      this.showSearch = false;
      this._searchService.toggleSearch(false);
    }

    if (keepOpen !== 'megaMenu') {
      this.showMegaMenu = false;
    }

    if (keepOpen !== 'mobileProducts') {
      this.showMobileProductsMenu = false;
    }
  }

  changeLang(lang: string): void {
    // If mobile menu is open, close it with animation first
    if (this.isMenuOpen) {
      const menuElement = this.elementRef.nativeElement.querySelector(
        '.mobile-menu-container .fixed',
      );
      if (menuElement) {
        menuElement.classList.remove('translate-x-0');
      }

      // After animation completes, hide the menu and change language
      setTimeout(() => {
        this.isMenuOpen = false;
        document.body.classList.remove('scroll-lock');
        this.performLanguageChange(lang);
      }, 300); // Match this with CSS transition duration
    } else {
      // Otherwise, just change language
      this.performLanguageChange(lang);
    }
  }

  /**
   * Generate the correct route for language switching
   * @param lang Target language code
   * @returns Route array for RouterLink
   */
  getLanguageRoute(lang: string): string[] {
    const currentUrl = this._router.url;
    const cleanUrl = currentUrl.includes('?')
      ? currentUrl.split('?')[0]
      : currentUrl;
    const segments = cleanUrl.split('/');

    if (segments.length > 1) {
      segments[1] = lang;
    }

    return [segments.join('/')];
  }

  // Helper method to perform the actual language change
  private performLanguageChange(lang: string): void {
    // Close all dropdowns
    this.closeAllDropdownsExcept('none');
    this.removeGlobalClickListener();
    // Allow any DOM updates to complete before changing language
    setTimeout(() => {
      const currentUrl = this._router.url;
      this._languageService.changeLanguage(lang, currentUrl);
      this.isRtl = lang === 'ar';
    }, 0);
  }

  toggleMenu(): void {
    // Toggle current state
    this.showMenu = !this.showMenu;

    // Close all other dropdowns
    if (this.showMenu) {
      this.closeAllDropdownsExcept('menu');
      this.lastClickedElement =
        this.languageDropdownTrigger?.nativeElement || null;

      setTimeout(() => {
        this.addGlobalClickListener((event: MouseEvent) => {
          this.handleOutsideClick(event, 'language');
        });

        // Focus the first dropdown item when menu opens
        const firstDropdownItem = document.querySelector(
          '#langDropdown li button',
        ) as HTMLElement;
        if (firstDropdownItem) {
          firstDropdownItem.focus();
        }
      }, 0);
    }
  }

  toggleMobileSearch() {
    this.showMobileSearch = !this.showMobileSearch;
    this.showDesktopSearch = false;
  }

  toggleDesktopSearch() {
    this.showDesktopSearch = !this.showDesktopSearch;
    this.showMobileSearch = false;
  }

  toggleSearch(event: Event): void {
    event.stopPropagation();

    // Toggle current state
    this.showSearch = !this.showSearch;

    // Close all other dropdowns if opening search
    if (this.showSearch) {
      this.closeAllDropdownsExcept('search');
    }

    // Notify search service about search toggle state
    this._searchService.toggleSearch(this.showSearch);

    // If opening search, focus the input after a short delay
    if (this.showSearch) {
      setTimeout(() => {
        const searchInput = document.getElementById(
          'desktop-search',
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);

      // Add click outside handler
      this.addGlobalClickListener((event: MouseEvent) => {
        const searchContainer =
          this.elementRef.nativeElement.querySelector('.search-container');
        if (
          searchContainer &&
          !searchContainer.contains(event.target as Node)
        ) {
          this.showSearch = false;
          this._searchService.toggleSearch(false);
          this.removeGlobalClickListener();
        }
      });
    }
  }

  toggleProductsMenu(event: Event) {
    event.stopPropagation();
    this.showProductsMenu = !this.showProductsMenu;
  }

  toggleMobileProductsMenu(event: Event) {
    event.stopPropagation();

    // Toggle current state
    this.showMobileProductsMenu = !this.showMobileProductsMenu;

    // Close all other dropdowns if opening mobile products menu
    if (this.showMobileProductsMenu) {
      this.closeAllDropdownsExcept('mobileProducts');

      // Add global click handler for outside clicks
      this.addGlobalClickListener((event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const mobileProductsMenu =
          this.elementRef.nativeElement.querySelector('.show-arrow .mt-2');
        const mobileProductsButton = this.mobileProductsTrigger?.nativeElement;

        if (
          mobileProductsMenu &&
          mobileProductsButton &&
          !mobileProductsMenu.contains(target) &&
          !mobileProductsButton.contains(target)
        ) {
          this.showMobileProductsMenu = false;
          this.removeGlobalClickListener();
        }
      });
    }
  }

  closeProductsMenu() {
    this.showProductsMenu = false;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    // Handle core menu dropdowns
    this.handleOutsideClick(event, 'all');
  }

  /**
   * Handles clicks outside of specific dropdown elements
   */
  private handleOutsideClick(
    event: MouseEvent,
    type: 'all' | 'language' | 'megamenu' | 'search',
  ) {
    const target = event.target as HTMLElement;

    // Handle language dropdown
    if (type === 'all' || type === 'language') {
      const langDropdown =
        this.elementRef.nativeElement.querySelector('#langDropdown');
      const langButton = this.languageDropdownTrigger?.nativeElement;

      if (
        this.showMenu &&
        langDropdown &&
        langButton &&
        !langDropdown.contains(target) &&
        !langButton.contains(target)
      ) {
        this.showMenu = false;
      }
    }

    // Handle mega menu
    if (type === 'all' || type === 'megamenu') {
      const megaMenu =
        this.elementRef.nativeElement.querySelector('app-mega-menu');
      const megaMenuButton = this.megaMenuTrigger?.nativeElement;

      if (
        this.showMegaMenu &&
        megaMenu &&
        megaMenuButton &&
        !megaMenu.contains(target) &&
        !megaMenuButton.contains(target)
      ) {
        this.showMegaMenu = false;
      }
    }

    // Handle mobile products menu
    if (this.showMobileProductsMenu) {
      const mobileProductsMenu =
        this.elementRef.nativeElement.querySelector('.show-arrow .mt-2');
      const mobileProductsButton = this.mobileProductsTrigger?.nativeElement;

      if (
        mobileProductsMenu &&
        mobileProductsButton &&
        !mobileProductsMenu.contains(target) &&
        !mobileProductsButton.contains(target)
      ) {
        this.showMobileProductsMenu = false;
      }
    }

    // Handle search
    if (type === 'all' || type === 'search') {
      const searchContainer =
        this.elementRef.nativeElement.querySelector('.search-container');
      if (
        this.showSearch &&
        searchContainer &&
        !searchContainer.contains(target)
      ) {
        this.showSearch = false;
        this._searchService.toggleSearch(false);
      }
    }
  }

  // Global click handler for one-time clicks
  private globalClickHandler: ((event: MouseEvent) => void) | null = null;

  /**
   * Adds a global click listener that self-removes after one execution
   */
  private addGlobalClickListener(handler: (event: MouseEvent) => void): void {
    this.removeGlobalClickListener(); // Clean up any existing handler

    this.globalClickHandler = (event: MouseEvent) => {
      handler(event);
      this.removeGlobalClickListener();
    };

    setTimeout(() => {
      document.addEventListener(
        'click',
        this.globalClickHandler as EventListener,
      );
    }, 0);
  }

  /**
   * Removes the global click listener
   */
  private removeGlobalClickListener(): void {
    if (this.globalClickHandler) {
      document.removeEventListener(
        'click',
        this.globalClickHandler as EventListener,
      );
      this.globalClickHandler = null;
    }
  }

  toggleMegaMenu(event: Event): void {
    event.stopPropagation();
    const clickedElement = event.target as HTMLElement;
    const listItem = clickedElement.closest('li');

    // If clicking the same li element, close the menu
    if (this.showMegaMenu && listItem && this.lastClickedElement === listItem) {
      this.showMegaMenu = false;
      this.lastClickedElement = null;
      return;
    }

    // Close all other dropdowns before opening mega menu
    this.closeAllDropdownsExcept('megaMenu');

    // Store the clicked element and open the menu
    this.lastClickedElement = listItem;
    this.showMegaMenu = true;

    // Add global click handler
    if (this.showMegaMenu) {
      this.addGlobalClickListener((event: MouseEvent) => {
        this.handleOutsideClick(event, 'megamenu');
      });
    }
  }

  toggleMobileMenu(): void {
    // If menu is currently closed and we're opening it
    if (!this.isMenuOpen) {
      // First set isMenuOpen to true to show the container and background
      this.isMenuOpen = true;

      // Close all dropdowns when opening mobile menu
      this.closeAllDropdownsExcept('none');

      // Prevent body scroll when menu is open
      if (isPlatformBrowser(this.platformId)) {
        document.body.classList.add('scroll-lock');

        // Focus the mobile search input after a short delay to allow the menu to render
        setTimeout(() => {
          const mobileSearchInput = document.getElementById(
            'mobile-search',
          ) as HTMLInputElement;
          if (mobileSearchInput) {
            mobileSearchInput.focus();
          }
        }, 300);
      }
    } else {
      // If menu is open and we're closing it
      // First trigger the animation by removing the transform class
      const menuElement = this.elementRef.nativeElement.querySelector(
        '.mobile-menu-container .fixed',
      );
      if (menuElement) {
        menuElement.classList.remove('translate-x-0');
      }

      // After animation completes, hide the menu completely
      setTimeout(() => {
        this.isMenuOpen = false;
        // Restore body scroll
        if (isPlatformBrowser(this.platformId)) {
          document.body.classList.remove('scroll-lock');
        }
      }, 300); // Match this with CSS transition duration
    }
  }

  /**
   * Handles navigation when the profile icon is clicked
   * Redirects to login page if not authenticated, otherwise goes to profile
   */
  navigateToProfile(): void {
    let lang = '';
    this.currentLang$.subscribe((next) => (lang = next));

    if (this._authService.isAuthenticated()) {
      // User is authenticated, navigate to profile page
      this._router.navigate(['/', lang, 'profile']);
    } else {
      this.showSuccessAlert('/images/common/unauth.webp', 'unauth');

      // User is not authenticated, redirect to login page with updated path
      this._router.navigate(['/', lang, 'login']);
    }
  }

  private showSuccessAlert(imagePath: string, titleKey: string): void {
    this._alertService.showNotification({
      imagePath: imagePath,
      translationKeys: {
        title: titleKey,
      },
    });
  }

  /**
   * Check if user is authenticated
   * @returns boolean indicating authentication status
   */
  isAuthenticated(): boolean {
    return this._authService.isAuthenticated();
  }

  /**
   * Logs out the current user and redirects to home page
   */
  logout(): void {
    this._authService.logout().subscribe({
      next: () => {
        // Explicitly reset wishlist data
        this._wishlistService.resetWishlist();

        // Explicitly reset cart data
        this._cartStateService.resetCart();
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem('user_data');
          localStorage.removeItem('checkout-data');
          localStorage.removeItem('order-summary');
          localStorage.removeItem('orderDetails');
        }
        this.cartCountSignal.set(0);
        // Closing mobile menu if open after logout
        if (this.isMenuOpen) {
          this.toggleMobileMenu();
        }
      },
      error: (error) => {
        console.error('Logout error:', error);
      },
    });
  }

  onSearchInput(event: Event): void {
    const searchInput = event.target as HTMLInputElement;
    const searchQuery = searchInput.value.trim().toLowerCase();

    // Handle Escape key to close search
    if (event instanceof KeyboardEvent && event.key === 'Escape') {
      this.showSearch = false;
      this._searchService.toggleSearch(false);
      return;
    }

    // Update search query in service
    this._searchService.updateSearchQuery(searchQuery);

    // If not already on shopping page and search has content, navigate there
    if (searchQuery && !this._router.url.includes('/shopping')) {
      // Get the current language and navigate to shopping page with search query parameter
      this.currentLang$.pipe(take(1)).subscribe((lang) => {
        this._router.navigate(['/', lang, 'shopping'], {
          queryParams: { q: searchQuery },
        });
      });
    } else if (searchQuery && this._router.url.includes('/shopping')) {
      // If already on shopping page, just update the URL with the search query
      this._router.navigate([], {
        queryParams: { q: searchQuery },
        queryParamsHandling: 'merge', // Keep other query parameters
      });
    } else if (!searchQuery && this._router.url.includes('/shopping')) {
      // If search is cleared and we're on shopping page, remove the q parameter
      this._router.navigate([], {
        queryParams: { q: null },
        queryParamsHandling: 'merge', // Keep other query parameters
      });
    }
  }

  /**
   * Handle keyboard events for dropdown menu items
   */
  handleDropdownKeydown(event: KeyboardEvent, lang?: string): void {
    // Handle Enter key - select the language
    if (event.key === 'Enter' && lang) {
      this.changeLang(lang);
      event.preventDefault();
    }

    // Handle Escape key - close the dropdown
    if (event.key === 'Escape') {
      this.showMenu = false;
      this.removeGlobalClickListener();
      event.preventDefault();

      // Return focus to the dropdown button
      setTimeout(() => {
        if (this.languageDropdownTrigger?.nativeElement) {
          this.languageDropdownTrigger.nativeElement.focus();
        }
      }, 0);
    }

    // Handle arrow keys for navigation within dropdown
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();

      const currentElement = event.target as HTMLElement;
      const listItems = Array.from(
        document.querySelectorAll('#langDropdown li button'),
      );
      const currentIndex = listItems.indexOf(currentElement);

      if (event.key === 'ArrowDown' && currentIndex < listItems.length - 1) {
        (listItems[currentIndex + 1] as HTMLElement).focus();
      } else if (event.key === 'ArrowUp' && currentIndex > 0) {
        (listItems[currentIndex - 1] as HTMLElement).focus();
      }
    }
  }

  /**
   * Handle keyboard events for mega menu dropdown
   */
  handleMegaMenuKeydown(event: KeyboardEvent): void {
    // Toggle mega menu on Enter key
    if (event.key === 'Enter') {
      this.showMegaMenu = !this.showMegaMenu;
      event.preventDefault();

      // If opening, add global click handler
      if (this.showMegaMenu) {
        this.addGlobalClickListener((event: MouseEvent) => {
          this.handleOutsideClick(event, 'megamenu');
        });
      }
    }

    // Close mega menu on Escape key
    if (event.key === 'Escape' && this.showMegaMenu) {
      this.showMegaMenu = false;
      event.preventDefault();
    }
  }

  /**
   * Handle keyboard events for mobile products menu
   */
  handleMobileMenuKeydown(event: KeyboardEvent): void {
    // Toggle mobile products menu on Enter key
    if (event.key === 'Enter') {
      this.showMobileProductsMenu = !this.showMobileProductsMenu;
      event.preventDefault();
    }

    // Close mobile products menu on Escape key
    if (event.key === 'Escape' && this.showMobileProductsMenu) {
      this.showMobileProductsMenu = false;
      event.preventDefault();
    }
  }

  ngOnDestroy(): void {
    // Clean up all subscriptions
    this.resizeSubscription?.unsubscribe();

    // Remove any global click handlers
    this.removeGlobalClickListener();

    // Restore body scroll when component is destroyed
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('scroll-lock');
    }
    this.renderer.destroy();
  }
}
