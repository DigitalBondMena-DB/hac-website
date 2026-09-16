import { isRamadanMonth } from './../../core/services/conf/api.config';
import {
  CommonModule,
  DOCUMENT,
  isPlatformBrowser,
  NgClass,
  NgOptimizedImage,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  Renderer2,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AlertService } from '@shared/alert/alert.service';
import { fromEvent, timer } from 'rxjs';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent implements OnDestroy, OnInit {
  showMenu = signal<boolean>(false);
  showSearch = signal<boolean>(false);
  showMobileSearch = signal<boolean>(false);
  showDesktopSearch = signal<boolean>(false);
  showProductsMenu = signal<boolean>(false);
  showMobileProductsMenu = signal<boolean>(false);
  showMegaMenu = signal<boolean>(false);
  isMenuVisible = signal<boolean>(false);
  isMenuAnimating = signal<boolean>(false);
  isRtl = signal<boolean>(false);
  isLoading = signal<boolean>(true);
  readonly isRamadanMonth = isRamadanMonth;

  // Constants
  private readonly DESKTOP_BREAKPOINT = 1280; // xl breakpoint in Tailwind (in pixels)

  private _router = inject(Router);
  private _languageService = inject(LanguageService);
  private _searchService = inject(SearchService);
  private _wishlistService = inject(WishlistService);
  private _cartStateService = inject(CartStateService);
  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);
  private _alertService = inject(AlertService);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);

  _authService = inject(AuthService);

  // Get wishlist count as a signal
  wishlistCount = this._wishlistService.getWishlistCountSignal();

  // Get cart count as a signal
  cartCount = this._cartStateService.cartCount;

  currentLang$ = this._languageService.getLanguage();

  cartCountSignal = this._authService.cartCountSignal;

  // View queries as signals
  languageDropdownTrigger = viewChild<ElementRef<HTMLElement>>('langDropdownButton');
  langDropdown = viewChild<ElementRef<HTMLElement>>('langDropdown');
  megaMenuTrigger = viewChild<ElementRef<HTMLElement>>('megaMenuTrigger');
  megaMenu = viewChild<ElementRef<HTMLElement>>('megaMenu');
  mobileProductsTrigger = viewChild<ElementRef<HTMLElement>>('mobileProductsTrigger');
  mobileProductsMenu = viewChild<ElementRef<HTMLElement>>('mobileProductsMenu');
  desktopSearchInput = viewChild<ElementRef<HTMLInputElement>>('desktopSearch');
  mobileSearchInput = viewChild<ElementRef<HTMLInputElement>>('mobileSearch');
  searchContainer = viewChild<ElementRef<HTMLElement>>('searchContainer');
  langDropdownItems = viewChildren<ElementRef<HTMLElement>>('langDropdownItem');

  ngOnInit(): void {
    // Set initial RTL state based on current language
    this.currentLang$.subscribe((lang) => {
      this.isRtl.set(lang === 'ar');
    });

    // Initialize skeleton loader - hide after styles are loaded
    if (isPlatformBrowser(this.platformId)) {
      timer(500).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.isLoading.set(false);
      });

      if (
        document.readyState === 'complete' ||
        document.readyState === 'interactive'
      ) {
        timer(500).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
          this.isLoading.set(false);
        });
      }

      timer(2000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.isLoading.set(false);
      });

      // Add resize listener to close mobile menu when screen size changes
      fromEvent(window, 'resize')
        .pipe(debounceTime(150), takeUntilDestroyed(this.destroyRef))
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
          JSON.parse(localStorage.getItem('orderDetails') || '[]').length,
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
          // For other pages, just update cart count for the navbar
          this._cartStateService.updateCartCount();
        }
      });
  }

  private checkScreenWidth(): void {
    if (window.innerWidth >= this.DESKTOP_BREAKPOINT && this.isMenuVisible()) {
      this.isMenuVisible.set(false);
      this.isMenuAnimating.set(false);
      if (isPlatformBrowser(this.platformId)) {
        this.renderer.removeClass(this.document.body, 'scroll-lock');
      }
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
      this.showMenu.set(false);
    }

    if (keepOpen !== 'search') {
      this.showSearch.set(false);
      this._searchService.toggleSearch(false);
    }

    if (keepOpen !== 'megaMenu') {
      this.showMegaMenu.set(false);
    }

    if (keepOpen !== 'mobileProducts') {
      this.showMobileProductsMenu.set(false);
    }
  }

  changeLang(lang: string): void {
    // If mobile menu is open, close it with animation first
    if (this.isMenuVisible()) {
      this.isMenuAnimating.set(false);
      
      // After animation completes, hide the menu and change language
      setTimeout(() => {
        this.isMenuVisible.set(false);
        if (isPlatformBrowser(this.platformId)) {
          this.renderer.removeClass(this.document.body, 'scroll-lock');
        }
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
    // Allow any DOM updates to complete before changing language
    setTimeout(() => {
      const currentUrl = this._router.url;
      this._languageService.changeLanguage(lang, currentUrl);
      this.isRtl.set(lang === 'ar');
    }, 0);
  }

  toggleMenu(): void {
    // Toggle current state
    this.showMenu.update(v => !v);

    // Close all other dropdowns
    if (this.showMenu()) {
      this.closeAllDropdownsExcept('menu');

      setTimeout(() => {
        // Focus the first dropdown item when menu opens
        const items = this.langDropdownItems();
        if (items.length > 0) {
          items[0].nativeElement.focus();
        }
      }, 0);
    }
  }

  toggleMobileSearch() {
    this.showMobileSearch.update(v => !v);
    this.showDesktopSearch.set(false);
  }

  toggleDesktopSearch() {
    this.showDesktopSearch.update(v => !v);
    this.showMobileSearch.set(false);
  }

  toggleSearch(event: Event): void {
    event.stopPropagation();

    // Toggle current state
    this.showSearch.update(v => !v);

    // Close all other dropdowns if opening search
    if (this.showSearch()) {
      this.closeAllDropdownsExcept('search');
    }

    // Notify search service about search toggle state
    this._searchService.toggleSearch(this.showSearch());

    // If opening search, focus the input after a short delay
    if (this.showSearch()) {
      setTimeout(() => {
        const searchInput = this.desktopSearchInput()?.nativeElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  }

  toggleProductsMenu(event: Event) {
    event.stopPropagation();
    this.showProductsMenu.update(v => !v);
  }

  toggleMobileProductsMenu(event: Event) {
    event.stopPropagation();

    // Toggle current state
    this.showMobileProductsMenu.update(v => !v);

    // Close all other dropdowns if opening mobile products menu
    if (this.showMobileProductsMenu()) {
      this.closeAllDropdownsExcept('mobileProducts');
    }
  }

  closeProductsMenu() {
    this.showProductsMenu.set(false);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Handle language dropdown
    if (this.showMenu()) {
      const langDropdown = this.langDropdown()?.nativeElement;
      const langButton = this.languageDropdownTrigger()?.nativeElement;
      if (langDropdown && langButton && !langDropdown.contains(target) && !langButton.contains(target)) {
        this.showMenu.set(false);
      }
    }

    // Handle mega menu
    if (this.showMegaMenu()) {
      const megaMenu = this.megaMenu()?.nativeElement;
      const megaMenuButton = this.megaMenuTrigger()?.nativeElement;
      if (megaMenu && megaMenuButton && !megaMenu.contains(target) && !megaMenuButton.contains(target)) {
        this.showMegaMenu.set(false);
      }
    }

    // Handle mobile products menu
    if (this.showMobileProductsMenu()) {
      const mobileProductsMenu = this.mobileProductsMenu()?.nativeElement;
      const mobileProductsButton = this.mobileProductsTrigger()?.nativeElement;
      if (mobileProductsMenu && mobileProductsButton && !mobileProductsMenu.contains(target) && !mobileProductsButton.contains(target)) {
        this.showMobileProductsMenu.set(false);
      }
    }

    // Handle search
    if (this.showSearch()) {
      const searchContainer = this.searchContainer()?.nativeElement;
      if (searchContainer && !searchContainer.contains(target)) {
        this.showSearch.set(false);
        this._searchService.toggleSearch(false);
      }
    }
  }

  toggleMegaMenu(event: Event): void {
    event.stopPropagation();

    if (this.showMegaMenu()) {
      this.showMegaMenu.set(false);
    } else {
      // Close all other dropdowns before opening mega menu
      this.closeAllDropdownsExcept('megaMenu');
      this.showMegaMenu.set(true);
    }
  }

  toggleMobileMenu(): void {
    if (!this.isMenuVisible()) {
      // First set isMenuVisible to true to show the container and background
      this.isMenuVisible.set(true);
      this.closeAllDropdownsExcept('none');

      if (isPlatformBrowser(this.platformId)) {
        this.renderer.addClass(this.document.body, 'scroll-lock');
        
        setTimeout(() => {
          this.isMenuAnimating.set(true);
          // Focus the mobile search input
          const mobileSearchInput = this.mobileSearchInput()?.nativeElement;
          if (mobileSearchInput) {
            mobileSearchInput.focus();
          }
        }, 50);
      }
    } else {
      // Trigger the out animation
      this.isMenuAnimating.set(false);

      // After animation completes, hide the menu completely
      setTimeout(() => {
        this.isMenuVisible.set(false);
        if (isPlatformBrowser(this.platformId)) {
          this.renderer.removeClass(this.document.body, 'scroll-lock');
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
        if (this.isMenuVisible()) {
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
      this.showSearch.set(false);
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
      this.showMenu.set(false);
      event.preventDefault();

      // Return focus to the dropdown button
      setTimeout(() => {
        const btn = this.languageDropdownTrigger()?.nativeElement;
        if (btn) {
          btn.focus();
        }
      }, 0);
    }

    // Handle arrow keys for navigation within dropdown
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      
      const items = this.langDropdownItems();
      const currentElement = event.target as HTMLElement;
      const currentIndex = items.findIndex(item => item.nativeElement === currentElement);

      if (event.key === 'ArrowDown' && currentIndex < items.length - 1) {
        items[currentIndex + 1].nativeElement.focus();
      } else if (event.key === 'ArrowUp' && currentIndex > 0) {
        items[currentIndex - 1].nativeElement.focus();
      }
    }
  }

  /**
   * Handle keyboard events for mega menu dropdown
   */
  handleMegaMenuKeydown(event: KeyboardEvent): void {
    // Toggle mega menu on Enter key
    if (event.key === 'Enter') {
      this.showMegaMenu.update(v => !v);
      event.preventDefault();
    }

    // Close mega menu on Escape key
    if (event.key === 'Escape' && this.showMegaMenu()) {
      this.showMegaMenu.set(false);
      event.preventDefault();
    }
  }

  /**
   * Handle keyboard events for mobile products menu
   */
  handleMobileMenuKeydown(event: KeyboardEvent): void {
    // Toggle mobile products menu on Enter key
    if (event.key === 'Enter') {
      this.showMobileProductsMenu.update(v => !v);
      event.preventDefault();
    }

    // Close mobile products menu on Escape key
    if (event.key === 'Escape' && this.showMobileProductsMenu()) {
      this.showMobileProductsMenu.set(false);
      event.preventDefault();
    }
  }

  ngOnDestroy(): void {
    // Restore body scroll when component is destroyed
    if (isPlatformBrowser(this.platformId)) {
      this.renderer.removeClass(this.document.body, 'scroll-lock');
    }
  }
}
