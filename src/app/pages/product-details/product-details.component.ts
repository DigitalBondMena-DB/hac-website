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
import {
  DOCUMENT,
  isPlatformBrowser,
  isPlatformServer,
  NgClass,
} from '@angular/common';
import {
  AfterViewInit,
  Component,
  effect,
  HostBinding,
  inject,
  Injector,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  Renderer2,
  runInInjectionContext,
  signal,
  ViewChild,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { AuthService } from '@core/services/auth/auth.service';
import { CartStateService } from '@core/services/cart/cart-state.service';
import { LanguageService } from '@core/services/lang/language.service';
import { WishlistService } from '@core/services/wishlist/wishlist.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AlertService } from '@shared/alert/alert.service';
import { ProductDetailsSkeletonComponent } from '@shared/components/skeleton/product-details-skeleton/product-details-skeleton.component';
import { TamaraWidgetComponent } from '@shared/components/tamara-widget/tamara-widget.component';
import { IUnauthUser } from '@shared/ts/unauthUser';
import {
  CarouselComponent,
  CarouselModule,
  OwlOptions,
} from 'ngx-owl-carousel-o';
import { debounceTime, Subscription, take } from 'rxjs';
import { OrdersService } from '@core/services/cart/orders.service';
import { ThankYouStateService } from '@core/services/thank-you/thank-you-state.service';
import {
  ISpecialOrderFormData,
  SpecialOrderModalComponent,
} from '@shared/components/special-order-modal/special-order-modal.component';
import { ArticlesHeaderComponent } from '../articles/components/articles-header/articles-header.component';
import { SharedBestSellerComponent } from '../home/components/best-seller/components/shared-best-seller/shared-best-seller.component';
import { IAllProduct } from '../shopping/res/products.interface';
import { ProductsService } from '../shopping/res/products.service';
import { IProduct } from './res/productDetails.interface';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    ArticlesHeaderComponent,
    TranslateModule,
    CarouselModule,
    ImageUrlDirective,
    CustomTranslatePipe,
    SharedBestSellerComponent,
    NgClass,
    CustomTranslatePipe,
    ProductDetailsSkeletonComponent,
    TamaraWidgetComponent,
    SpecialOrderModalComponent,
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
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
    trigger('fadeSlideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '400ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ opacity: 0, transform: 'translateY(20px)' })
        ),
      ]),
    ]),
  ],
  host: { ngSkipHydration: 'true' },
})
export class ProductDetailsComponent
  implements AfterViewInit, OnInit, OnDestroy
{
  @HostBinding('class.rtl') get isRtl() {
    return this.isRtlMode();
  }

  @ViewChild('mainCarousel') mainCarousel!: CarouselComponent;
  @ViewChild('thumbnailCarousel') thumbnailCarousel!: CarouselComponent;

  private userId: number | null = null;

  private _languageService = inject(LanguageService);

  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private renderer = inject(Renderer2)

  private isBrowser = isPlatformBrowser(this.platformId);

  private _authService = inject(AuthService);

  private _router = inject(Router);

  _route = inject(ActivatedRoute);

  _productsService = inject(ProductsService);

  _cartStateService = inject(CartStateService);

  _translateService = inject(TranslateService);

  private injector = inject(Injector);

  productDetails!: IProduct;

  relatedProducts: IAllProduct[] = [];

  currentPageUrl = '';
  currentLanguagePageUrl = '';

  isLoading = signal(false);

  // Direction for layout (RTL or LTR)
  isRtlMode = signal(false);

  // Selected size (string instead of number)
  selectedSize = signal<string>('');

  // Track the selected choice
  private selectedChoice = signal<any>(null);

  quantity = signal(1);

  activeIndex = signal(0);

  userRoleAccess: boolean = false;

  // Process product images
  processedImages = signal<Array<{ id: number; url: string; alt: string }>>([]);

  // Main carousel options
  mainCarouselOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    items: 1,
    autoplay: false,
    nav: true,
    rtl: false,
  };

  // Thumbnail gallery options
  thumbnailOptions: OwlOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    items: 4,
    autoplay: false,
    nav: false,
    rtl: false,
    margin: 10,
    responsive: {
      0: {
        items: 3,
      },
      768: {
        items: 4,
      },
    },
  };

  // Product tabs configuration
  productTabs = [
    { id: 'description', title: 'product_details.tabs.description' },
    { id: 'how_to_use', title: 'product_details.tabs.how_to_use' },
    { id: 'ingredient', title: 'product_details.tabs.ingredient' },
    { id: 'more_information', title: 'product_details.tabs.more_information' },
  ];

  // Active tab index
  activeTab = signal(0);

  /* Cart */
  isAddingToCart = signal(false);

  private _titleService = inject(Title);
  private _metaService = inject(Meta);

  // Add subscription array to track and clean up subscriptions
  private subscriptions: Subscription[] = [];

  // Add isRTL signal
  isRTL = signal(false);

  /* Cart loading state */
  private cartLoading = signal(false);

  private _ordersService = inject(OrdersService);
  private _thankYouState = inject(ThankYouStateService);

  /* Special Order Modal */
  isSpecialOrderModalOpen = signal(false);
  isSubmittingSpecialOrder = signal(false);

  ngOnInit(): void {
    if (this.isBrowser) {
      this.currentPageUrl = window.location.href;
      this.currentLanguagePageUrl = window.location.href;
      console.log(this.currentLanguagePageUrl, 'currentLanguagePageUrl');
      console.log(this.currentPageUrl, 'currentPageUrl');
    }

    // Check language direction
    const langSub = this._languageService.getLanguage().subscribe((lang) => {
      this.isRtlMode.set(lang === 'ar');
      this.isRTL.set(lang === 'ar');
      // Update carousel RTL setting based on language
      this.updateCarouselRtlSetting();
    });
    this.subscriptions.push(langSub);

    // Subscribe to language changes
    const translateSub = this._translateService.onLangChange
      .pipe(debounceTime(100)) // Prevent rapid successive calls
      .subscribe((params) => {
        const newLang = params.lang;

        if (newLang === 'ar' || this._translateService.currentLang === 'ar') {
          this.isRTL.set(true);
        } else {
          this.isRTL.set(false);
        }

        if (this.productDetails) {
          // Navigate to correct localized URL first
          this.navigateToLocalizedUrl(newLang);
          // Meta tags will be updated after navigation in the resolver subscription
        }
      });
    this.subscriptions.push(translateSub);

    this.subscriptResolverToProductDetails();

    if (this._authService.isAuthenticated()) {
      const userData = this._authService.getUserData();
      if (userData && userData.id) {
        this.userId = userData.id;
        if (this.productDetails && this.productDetails) {
          this.handleMeta(this.productDetails);
          this.checkIfProductInWishlist();
          this.checkIfProductInCart();
        }
      }
    }

    // Create an effect that watches cart changes
    this.setupCartWatcher();
  }

  /**
   * Set up a watcher for cart changes
   */
  private setupCartWatcher(): void {
    // Use runInInjectionContext with the component's injector
    runInInjectionContext(this.injector, () => {
      effect(() => {
        // This will re-run whenever auth state or cart state changes
        if (this._authService.isAuthenticated() && this.productDetails?.id) {
          this.checkIfProductInCart();
        }
      });
    });
  }

  // Update carousel options when RTL mode changes
  private updateCarouselRtlSetting(): void {
    const isRtl = this.isRtlMode();

    const navTextForRtl = [
      '<i class="fa-solid fa-arrow-right"></i>',
      '<i class="fa-solid fa-arrow-left"></i>',
    ];

    const navTextForLtr = [
      '<i class="fa-solid fa-arrow-left"></i>',
      '<i class="fa-solid fa-arrow-right"></i>',
    ];

    this.mainCarouselOptions = {
      ...this.mainCarouselOptions,
      rtl: isRtl,
      navText: isRtl ? navTextForRtl : navTextForLtr,
    };

    this.thumbnailOptions = {
      ...this.thumbnailOptions,
      rtl: isRtl,
    };

    // Force update on carousel after setting RTL - only in browser
    if (this.isBrowser) {
      setTimeout(() => {
        if (this.mainCarousel) {
          try {
            // Trick to force carousel update - destroy and initialize again
            const mainElement = document.querySelector(
              '.carousel-wrapper .owl-carousel'
            );
            if (mainElement) {
              mainElement.classList.add('owl-refresh');
              setTimeout(() => {
                mainElement.classList.remove('owl-refresh');
              }, 10);
            }
          } catch (e) {
            console.error('Error refreshing main carousel', e);
          }
        }

        if (this.thumbnailCarousel) {
          try {
            // Trick to force carousel update - destroy and initialize again
            const thumbElement = document.querySelector(
              '.thumbnail-gallery .owl-carousel'
            );
            if (thumbElement) {
              thumbElement.classList.add('owl-refresh');
              setTimeout(() => {
                thumbElement.classList.remove('owl-refresh');
              }, 10);
            }
          } catch (e) {
            console.error('Error refreshing thumbnail carousel', e);
          }
        }
      }, 100);
    }
  }

  /**
   * Subscribe to product details from resolver and update meta tags
   */
  subscriptResolverToProductDetails(): void {
    const routeSub = this._route.data.subscribe((next) => {
      if (!next['productDetails'].product.commercial_status) {
        this.userRoleAccess = true;

        this.productDetails = next['productDetails'].product;
        this.relatedProducts = next['productDetails'].relatedProducts;
        if (
          next['productDetails'].product &&
          next['productDetails'].relatedProducts
        ) {
          this.userRoleAccess = true;

          // Update current page URL after route data changes
          if (this.isBrowser) {
            this.currentPageUrl = window.location.href;
            this.currentLanguagePageUrl = window.location.href;
          }

          this.removeMetaTags();
          this.handleMeta(this.productDetails);

          // Initialize the selected size from the first choice if available
          if (
            this.productDetails?.choices &&
            this.productDetails.choices.length > 0
          ) {
            const firstChoice = this.productDetails.choices[0];
            this.setSelectedSizeFromChoice(firstChoice);
          }

          // Add test images if none exist (for testing purposes)
          if (
            !this.productDetails.additional_images ||
            (Array.isArray(this.productDetails.additional_images) &&
              this.productDetails.additional_images.length === 0)
          ) {
            // Adding test images with the same format as the main image
            this.productDetails.additional_images = [
              { img: this.productDetails.main_image } as any,
              { img: this.productDetails.main_image } as any,
            ];
          }

          // Process product images after updating product details
          this.processProductImages();

          // Reset other signals when navigating to a new product
          this.quantity.set(1);
          this.activeIndex.set(0);
          this.selectedSize.set('');
          this.selectedChoice.set(null);

          // Check wishlist and cart status for the new product
          if (this._authService.isAuthenticated() && this.userId) {
            this.checkIfProductInWishlist();
            this.checkIfProductInCart();
          }
        } else {
          this.userRoleAccess = false;
        }
      } else {
        this.userRoleAccess = false;
      }
    });
    this.subscriptions.push(routeSub);
  }

  incrementQuantity(): void {
    this.quantity.update((qty) => qty + 1);
  }

  decrementQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update((qty) => qty - 1);
    }
  }

  /**
   * Get the translated name of a choice
   */
  getChoiceName(choice: any): string {
    // First try to get from customTranslate
    if (choice) {
      let currentLang = 'ar'; // Default to Arabic
      // Get current language
      this._languageService
        .getLanguage()
        .pipe(take(1))
        .subscribe((lang) => {
          currentLang = lang;
        });

      if (currentLang === 'ar' && choice.ar_name) {
        return choice.ar_name;
      } else if (currentLang === 'en' && choice.en_name) {
        return choice.en_name;
      } else if (choice?.cuurent_value) {
        return choice?.cuurent_value;
      }
    }
    return '';
  }

  /**
   * Return the price of the currently selected choice
   */
  activeChoicePrice(): string {
    // If no choice is selected or choices don't exist, return 0
    if (
      !this.productDetails?.choices ||
      this.productDetails.choices.length === 0
    ) {
      return '0';
    }

    // Find the selected choice based on current selectedSize
    const currentSize = this.selectedSize();
    const choice = this.productDetails.choices.find(
      (c: any) =>
        c.cuurent_value === currentSize || this.getChoiceName(c) === currentSize
    );

    // Return the price of the selected choice or the first choice as default
    if (choice && (choice as any).price) {
      return (choice as any).price;
    } else if (
      this.productDetails.choices[0] &&
      (this.productDetails.choices[0] as any).price
    ) {
      return (this.productDetails.choices[0] as any).price;
    }

    return '0';
  }

  /**
   * Get the current product price as a number for Tamara widget
   */
  getCurrentProductPriceForTamara(): number {
    if (!this.productDetails) return 0;

    // If product has choices, use choice price
    if (this.productDetails.choices && this.productDetails.choices.length > 0) {
      const priceStr = this.activeChoicePrice();
      return parseFloat(priceStr) || 0;
    }

    // If product has sale price, use sale price
    if (
      this.productDetails.sale_price &&
      this.productDetails.price_after_sale
    ) {
      return parseFloat(this.productDetails.price_after_sale) || 0;
    }

    // Otherwise use regular price
    if (this.productDetails.price) {
      return parseFloat(this.productDetails.price) || 0;
    }

    return 0;
  }

  /**
   * Set selected size from a choice object
   */
  setSelectedSizeFromChoice(choice: any): void {
    this.selectedChoice.set(choice);
    const sizeName = this.getChoiceName(choice);
    if (sizeName) {
      this.selectedSize.set(sizeName);
    } else if (choice?.cuurent_value) {
      this.selectedSize.set(choice?.cuurent_value);
    }
  }

  setSelectedSize(size: string): void {
    this.selectedSize.set(size);
  }

  setActiveIndex(index: number): void {
    this.activeIndex.set(index);
    if (this.mainCarousel && this.processedImages().length > index) {
      const imageId = this.processedImages()[index].id;
      this.mainCarousel.to(`slide_${imageId}`);
    }
  }

  ngAfterViewInit(): void {
    // Add event listener to sync main carousel with thumbnails
    if (this.mainCarousel) {
      this.mainCarousel.translated.subscribe((event: any) => {
        // Check if event and event.id exist before trying to split
        if (event && event.id && typeof event.id === 'string') {
          const parts = event.id.split('_');
          if (parts.length > 1) {
            const slideIndex = parseInt(parts[1], 10);
            if (!isNaN(slideIndex) && slideIndex !== this.activeIndex()) {
              this.activeIndex.set(slideIndex);
            }
          }
        }
      });
    }

    // Apply RTL settings again after view initialization to ensure they're applied
    setTimeout(() => {
      this.updateCarouselRtlSetting();
    }, 0);
  }

  // Process product images from backend response
  processProductImages(): void {
    const images: Array<{ id: number; url: string; alt: string }> = [];

    console.log(
      'this.productDetails.additional_images.length',
      this.productDetails.additional_images
    );

    // Try to process actual additional images if they exist
    if (
      this.productDetails &&
      this.productDetails.additional_images &&
      Array.isArray(this.productDetails.additional_images) &&
      this.productDetails.additional_images.length > 0
    ) {
      try {
        this.productDetails.additional_images.forEach(
          (imgData: any, index: number) => {
            if (imgData && typeof imgData === 'object' && imgData.image) {
              images.push({
                id: index + 1,
                url: imgData.image,
                alt: `Additional image ${index + 1}`,
              });
            }
          }
        );
      } catch (error) {
        console.error('Error processing additional images:', error);
      }
    }

    console.log('Final processed images:', images);
    this.processedImages.set(images);
  }

  // Social media sharing methods
  shareOnFacebook(): void {
    if (!this.isBrowser) return;

    const productTitle = this.getProductTitle();
    const url = encodeURIComponent(this.currentPageUrl);
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodeURIComponent(
      productTitle
    )}`;

    this.openShareWindow(shareUrl);
  }

  shareOnTwitter(): void {
    if (!this.isBrowser) return;

    const productTitle = this.getProductTitle();
    const url = encodeURIComponent(this.currentPageUrl);
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      productTitle
    )}&url=${url}`;

    this.openShareWindow(shareUrl);
  }

  shareOnWhatsApp(): void {
    if (!this.isBrowser) return;

    const productTitle = this.getProductTitle();
    const url = encodeURIComponent(this.currentPageUrl);
    const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      productTitle + ' ' + this.currentPageUrl
    )}`;

    this.openShareWindow(shareUrl);
  }

  private getProductTitle(): string {
    // Get product title based on available data
    if (this.productDetails) {
      // Get localized property based on product details
      if (this.productDetails.ar_name) {
        return this.productDetails.ar_name;
      } else if (this.productDetails.en_name) {
        return this.productDetails.en_name;
      } else {
        return 'Product';
      }
    }
    return 'Product';
  }

  private openShareWindow(url: string): void {
    window.open(
      url,
      'share-popup',
      'height=500,width=600,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no,status=yes'
    );
  }

  /* Wishlist */
  _wishlistService = inject(WishlistService);
  _alertService = inject(AlertService);

  isAddingToWishlist = signal(false);
  isInWishlist = signal(false);

  addToWishlist(): void {
    if (this.isInWishlist() || this.isAddingToWishlist()) return;
    if (!this.productDetails.id || !this.userId) {
      if (!this.userId) {
        this._languageService
          .getLanguage()
          .pipe(take(1))
          .subscribe((lang) => {
            this._router.navigate(['/', lang, 'login']);
          });
      }
      return;
    }
    this.isAddingToWishlist.set(true);

    this._wishlistService.addToWishlist(this.productDetails.id).subscribe({
      next: () => {
        this.isInWishlist.set(true);
        this.isAddingToWishlist.set(false);
        this._wishlistService.loadWishlistCount();

        // Show success notification alert (no buttons)
        this._alertService.showNotification({
          imagePath: '/images/common/wishlist.webp',
          translationKeys: {
            title: 'alerts.wishlist.add_success.title',
          },
        });
      },
      error: (err) => {
        this.isAddingToWishlist.set(false);
        if (err.status === 401) {
          this._languageService
            .getLanguage()
            .pipe(take(1))
            .subscribe((lang) => {
              this._router.navigate(['/', lang, 'login']);
            });
        }

        // Show error notification
        this._alertService.showNotification({
          imagePath: '/images/common/error.webp',
          translationKeys: {
            title: 'alerts.wishlist.add_error.title',
            message: 'alerts.wishlist.add_error.message',
          },
        });
        console.error('Error adding to wishlist:', err);
      },
    });
  }

  removeFromWishlist(): void {
    if (!this.isInWishlist() || !this.productDetails?.id) return;
    const wishId = this._wishlistService.getWishIdForProduct(
      this.productDetails.id
    );
    if (!wishId) return;

    // Show confirmation alert before removing
    this._alertService.showConfirmation({
      imagePath: '/images/common/before-remove.webp',
      translationKeys: {
        title: 'alerts.wishlist.remove_confirm.title',
        message: 'alerts.wishlist.remove_confirm.message',
        confirmText: 'alerts.wishlist.remove_confirm.yes',
        cancelText: 'alerts.wishlist.remove_confirm.cancel',
      },
      onConfirm: () => {
        // Proceed with removal
        this.executeRemoveFromWishlist(wishId);
      },
    });
  }

  // Actual removal from wishlist after confirmation
  private executeRemoveFromWishlist(wishId: number): void {
    this.isAddingToWishlist.set(true);

    this._wishlistService.removeFromWishlist(wishId).subscribe({
      next: () => {
        this.isInWishlist.set(false);
        this.isAddingToWishlist.set(false);
        this._wishlistService.loadWishlistCount();

        // Show success notification (without buttons)
        this._alertService.showNotification({
          imagePath: '/images/common/after-remove.webp',
          translationKeys: {
            title: 'alerts.wishlist.remove_success.title',
          },
        });
      },
      error: (err) => {
        this.isAddingToWishlist.set(false);
        if (err.status === 401) {
          this._languageService
            .getLanguage()
            .pipe(take(1))
            .subscribe((lang) => {
              this._router.navigate(['/', lang, 'login']);
            });
        }

        // Show error notification
        this._alertService.showNotification({
          imagePath: '/images/common/before-remove.webp',
          translationKeys: {
            title: 'alerts.wishlist.remove_error.title',
            message: 'alerts.wishlist.remove_error.message',
          },
        });
        console.error('Error removing from wishlist:', err);
      },
    });
  }

  private checkIfProductInWishlist(): void {
    if (!this.productDetails || !this.productDetails.id) return;

    // Check if product is in wishlist using service method
    const isInWishlist = this._wishlistService.isProductInWishlist(
      this.productDetails.id
    );

    // Get current wishlist items to ensure we're up to date
    this._wishlistService.loadWishlistCount();

    this.isInWishlist.set(isInWishlist);
    console.log(
      'Product in wishlist:',
      isInWishlist,
      'Product ID:',
      this.productDetails.id
    );
  }

  /* Cart */
  /**
   * Toggle cart: add or update product in cart based on current state
   * This function updates quantity rather than removing the item when it's already in cart
   */
  toggleCart(): void {
    if (this.isInCart()) {
      this.updateCartQuantity();
    } else {
      this.addToCart();
    }
  }

  /**
   * Check if product is in cart
   */
  isInCart(): boolean {
    if (!this.productDetails?.id) return false;

    // For authenticated users, check the cart service
    if (this._authService.isAuthenticated()) {
      return this._cartStateService.isProductInCart(this.productDetails.id);
    }
    // For unauthenticated users, check localStorage
    else {
      return this.isProductInLocalCart();
    }
  }

  /**
   * Check if product is in local storage cart
   */
  private isProductInLocalCart(): boolean {
    if (!this.isBrowser || !this.productDetails?.id) return false;

    const cartKey = 'orderDetails';
    const cart: IUnauthUser[] = JSON.parse(
      localStorage.getItem(cartKey) || '[]'
    );
    return cart.some((item) => item.id === this.productDetails.id);
  }

  /**
   * Set cart loading state
   */
  private setCartLoading(state: boolean): void {
    this.cartLoading.set(state);
    this.isAddingToCart.set(state);
  }

  /**
   * Show success alert
   */
  private showSuccessAlert(imagePath: string, titleKey: string): void {
    this._alertService.showNotification({
      imagePath: imagePath,
      translationKeys: {
        title: titleKey,
      },
    });
  }

  /**
   * Add the current product to cart
   */
  addToCart(): void {
    if (this.isAddingToCart()) {
      return;
    }

    // Get product ID
    if (!this.productDetails || !this.productDetails.id) {
      return;
    }

    // For unauthenticated users, store in localStorage
    if (!this._authService.isAuthenticated()) {
      this.setCartLoading(true);
      const unAuthData: IUnauthUser = {
        id: this.productDetails.id,
        ar_slug: this.productDetails.ar_slug,
        en_slug: this.productDetails.en_slug,
        first_choice: this.selectedChoice()?.id?.toString() || null,
        quantity: this.quantity(),
        price: this.getCurrentProductPriceForTamara().toString(),
        product_name: this.productDetails.ar_name || '',
        product_image: this.productDetails.main_image || '',
        en_name: this.productDetails.en_name || '',
        ar_name: this.productDetails.ar_name || '',
      };
      this.storeCartItemLocally(unAuthData);
      return;
    }

    this.isAddingToCart.set(true);

    // Use the prepareCartPayload helper to prepare the payload
    const payload = this.prepareCartPayload();

    // Call cart service to add item
    this._cartStateService.addToCart(payload).subscribe({
      next: (response: any) => {
        let lang = '';
        this._languageService.getLanguage().subscribe((next) => {
          lang = next;
        });
        if (response.ar_message) {
          if (lang === 'ar') {
            this._alertService.showNotification({
              imagePath: '',
              translationKeys: {
                title: 'لقد تخطيت الحد الأقصى لقطع المنتج',
              },
            });
          } else {
            this._alertService.showNotification({
              imagePath: '',
              translationKeys: {
                title: 'You have exceeded the limit',
              },
            });
          }

          this.isAddingToCart.set(false);
          return;
        }
        this.isAddingToCart.set(false);
        // Show success notification
        this._alertService.showNotification({
          imagePath: '/images/common/addtocart.webp',
          translationKeys: {
            title: 'alerts.cart.add_success.title',
          },
        });
      },

      error: (err) => {
        this.isAddingToCart.set(false);
        this.handleCartError(err);
      },
    });
  }

  /**
   * Update cart item quantity
   */
  updateCartQuantity(): void {
    if (this._authService.isAuthenticated()) {
      if (!this.isInCart() || !this.productDetails?.id) return;
      if (this.isAddingToCart()) return;

      this.isAddingToCart.set(true);

      // Get the currently selected choice
      const choice = this.selectedChoice();

      // If a choice is selected and it's different from what's in the cart,
      // remove the old item and add a new one with the correct choice
      const cartItem = this._cartStateService.getCartItemForProduct(
        this.productDetails.id
      );
      if (cartItem && choice && choice.id) {
        const cartChoiceId = cartItem.product_choice_id;

        // If choice is different, remove the item and add a new one
        if (cartChoiceId !== choice.id) {
          this.executeRemoveFromCart(cartItem.id);
          // Add new item with correct choice after a short delay
          setTimeout(() => {
            this.addToCart();
          }, 300);
          return;
        }
      }

      // Otherwise just update the quantity
      this._cartStateService
        .updateQuantity(this.productDetails.id, this.quantity())
        .subscribe({
          next: (response: any) => {
            this.isAddingToCart.set(false);
            if (response.ar_message) {
              this.handleCartError(response);
              return;
            }
            // Refresh the cart state to ensure UI is updated correctly
            this._cartStateService.fetchCart();

            // Show success notification
            this._alertService.showNotification({
              imagePath: '/images/common/addtocart.webp',
              translationKeys: {
                title: 'alerts.cart.update_success.title',
              },
            });
          },
          error: (err) => {
            this.isAddingToCart.set(false);
            this.handleCartError(err);
          },
        });
    } else {
      // Handle unauthenticated user cart update
      if (!this.productDetails?.id) return;

      this.setCartLoading(true);
      const cartKey = 'orderDetails';
      const cart: IUnauthUser[] = JSON.parse(
        localStorage.getItem(cartKey) || '[]'
      );

      const existingItemIndex = cart.findIndex(
        (item) => item.id === this.productDetails.id
      );

      if (existingItemIndex >= 0) {
        // Update the quantity and choice if needed
        cart[existingItemIndex] = {
          ...cart[existingItemIndex],
          quantity: this.quantity(),
          first_choice:
            this.selectedChoice()?.id?.toString() ||
            cart[existingItemIndex].first_choice,
          price: this.getCurrentProductPriceForTamara().toString(),
        };

        localStorage.setItem(cartKey, JSON.stringify(cart));
        this.setCartLoading(false);

        // Show success notification
        this._alertService.showNotification({
          imagePath: '/images/common/addtocart.webp',
          translationKeys: {
            title: 'alerts.cart.update_success.title',
          },
        });
      } else {
        // If item not found in cart, add it
        this.addToCart();
      }
    }
  }

  /**
   * Execute cart item removal after confirmation
   */
  private executeRemoveFromCart(detailId: number): void {
    this._cartStateService.removeItem(detailId).subscribe({
      next: () => {
        this.isAddingToCart.set(false);

        // Refresh the cart state
        this._cartStateService.fetchCart();

        // Show success notification
        this._alertService.showNotification({
          imagePath: '/images/common/after-remove.webp',
          translationKeys: {
            title: 'alerts.cart.remove_success.title',
          },
        });
      },
      error: (err) => {
        this.isAddingToCart.set(false);
        this.handleCartError(err);
      },
    });
  }

  /**
   * Common error handler for cart operations
   */
  private handleCartError(error: any): void {
    if (error.status === 401) {
      this._languageService
        .getLanguage()
        .pipe(take(1))
        .subscribe((lang: string) => {
          this._router.navigate(['/', lang, 'login']);
        });
    }

    // Show error notification
    this._alertService.showNotification({
      imagePath: '/images/common/before-remove.webp',
      translationKeys: {
        title: 'alerts.cart.error.title',
        message: 'alerts.cart.error.message',
      },
    });
  }

  /**
   * Check if the current product is already in user's cart
   */
  private checkIfProductInCart(): void {
    if (!this.productDetails || !this.productDetails.id) return;

    // For authenticated users
    if (this._authService.isAuthenticated()) {
      // If product is in cart, set the quantity to match what's in the cart
      if (this.isInCart()) {
        const cartItem = this._cartStateService.getCartItemForProduct(
          this.productDetails.id
        );
        if (cartItem && cartItem.quantity) {
          this.quantity.set(cartItem.quantity);
        }
      }
    }
    // For unauthenticated users
    else if (this.isBrowser) {
      const cartKey = 'orderDetails';
      const cart: IUnauthUser[] = JSON.parse(
        localStorage.getItem(cartKey) || '[]'
      );
      const cartItem = cart.find((item) => item.id === this.productDetails.id);

      if (cartItem) {
        // Set quantity from local cart
        this.quantity.set(cartItem.quantity || 1);

        // If there's a choice stored, try to select it
        if (cartItem.first_choice && this.productDetails.choices) {
          const choice = this.productDetails.choices.find(
            (c) => c.id?.toString() === cartItem.first_choice
          );
          if (choice) {
            this.setSelectedSizeFromChoice(choice);
          }
        }
      }
    }
  }

  // Set active tab
  setActiveTab(index: number): void {
    this.activeTab.set(index);
  }

  /**
   * Check if a choice is currently active/selected
   */
  isChoiceActive(choice: any): boolean {
    if (!choice) return false;

    // Check if this is the currently selected choice by comparing with the stored selectedChoice
    const currentChoice = this.selectedChoice();
    if (currentChoice && currentChoice.id && choice.id) {
      return currentChoice.id === choice.id;
    }

    // Fallback to comparing by name if IDs don't match
    const choiceName = this.getChoiceName(choice);
    return this.selectedSize() === choiceName;
  }

  /**
   * Remove product from cart with confirmation
   */
  removeFromCart(): void {
    if (!this.isInCart() || !this.productDetails?.id) return;
    if (this.isAddingToCart()) return;

    // For unauthenticated users, remove from localStorage
    if (!this._authService.isAuthenticated()) {
      this.removeFromCartLocally();
      return;
    }

    // Get the cart item detail for this product
    const cartItem = this._cartStateService.getCartItemForProduct(
      this.productDetails.id
    );
    if (!cartItem) return;

    this.isAddingToCart.set(true);

    // Show confirmation alert before removing
    this._alertService.showConfirmation({
      imagePath: '/images/common/before-remove.webp',
      translationKeys: {
        title: 'alerts.cart.remove_confirm.title',
        message: 'alerts.cart.remove_confirm.message',
        confirmText: 'alerts.cart.remove_confirm.yes',
        cancelText: 'alerts.cart.remove_confirm.cancel',
      },
      onConfirm: () => {
        // Proceed with removal
        this.executeRemoveFromCart(cartItem.id);
      },
      onCancel: () => {
        this.isAddingToCart.set(false);
      },
    });
  }

  /**
   * Adds the product to cart and navigates to the cart page
   */
  buyNow(): void {
    // If product is already in cart, just navigate to cart
    if (this.isInCart()) {
      this._languageService
        .getLanguage()
        .pipe(take(1))
        .subscribe((lang: string) => {
          this._router.navigate(['/', lang, 'cart']);
        });
      return;
    }

    // For unauthenticated users, add to localStorage then navigate
    if (!this._authService.isAuthenticated()) {
      this.setCartLoading(true);
      const unAuthData: IUnauthUser = {
        id: this.productDetails.id,
        ar_slug: this.productDetails.ar_slug,
        en_slug: this.productDetails.en_slug,
        first_choice: this.selectedChoice()?.id?.toString() || null,
        quantity: this.quantity(),
        price: this.getCurrentProductPriceForTamara().toString(),
        product_name: this.productDetails.ar_name || '',
        product_image: this.productDetails.main_image || '',
        en_name: this.productDetails.en_name || '',
        ar_name: this.productDetails.ar_name || '',
      };

      this.storeCartItemLocally(unAuthData);

      this._languageService
        .getLanguage()
        .pipe(take(1))
        .subscribe((lang: string) => {
          this._router.navigate(['/', lang, 'cart']);
        });
      return;
    }

    // Otherwise, add to cart then navigate
    this.isAddingToCart.set(true);

    const payload = this.prepareCartPayload();

    this._cartStateService.addToCart(payload).subscribe({
      next: (response: any) => {
        // if (response.ar_message) {
        //   this.handleCartError(response);
        //   this.isAddingToCart.set(false);
        //   return;
        // }
        this.isAddingToCart.set(false);
        this._languageService
          .getLanguage()
          .pipe(take(1))
          .subscribe((lang: string) => {
            this._router.navigate(['/', lang, 'cart']);
          });
      },
      error: (error) => {
        this.handleCartError(error);
        this.isAddingToCart.set(false);
      },
    });
  }

  /**
   * Prepares the cart payload based on product selection
   * @returns The cart payload
   */
  private prepareCartPayload(): any {
    const productId = this.productDetails.id;
    const qty = this.quantity();

    // If there's a selected choice, include it in the payload
    if (this.selectedChoice()) {
      return {
        product_id: productId,
        quantity: qty,
        choice_id: this.selectedChoice().id,
      };
    }

    // Otherwise, just send product_id and quantity
    return {
      product_id: productId,
      quantity: qty,
    };
  }

  ngOnDestroy(): void {
    // Clean up all subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  // Navigation method for product not found scenario
  goToShop(): void {
    this._languageService
      .getLanguage()
      .pipe(take(1))
      .subscribe((lang: string) => {
        this._router.navigate(['/', lang, 'shopping']);
      });
  }

  /**
   * Update meta tags for SEO and social sharing
   */
  appendDynamicScript(code: string | null) {
    if(code) {
      const script = this.renderer.createElement('script');
      script.type = 'text/javascript';
      script.text = code;
      this.renderer.appendChild(this.document.body, script);
    }
  }
  private handleMeta(product: IProduct): void {
    if (!product) return;
    const currentLang = this._translateService.currentLang || 'ar';
    const scriptTag = currentLang === 'ar' ? product.ar_script : product.en_script;
    this.appendDynamicScript(scriptTag);
    const title =
      currentLang === 'ar' ? product.ar_meta_Title : product.en_meta_Title;
    const description =
      currentLang === 'ar' ? product.ar_meta_text : product.en_meta_text;
    const imageUrl = `https://digitalbondmena.com/mesoshop/${
      product.main_image || ''
    }`;

    // Get canonical URL using our helper method
    const url = this.buildProductUrl(product, currentLang);

    // Update current page URL for sharing
    if (this.isBrowser || isPlatformServer(this.platformId)) {
      try {
        this.currentPageUrl = this.document.location?.href || url;
        this.currentLanguagePageUrl = this.currentPageUrl;
      } catch (e) {
        this.currentPageUrl = url;
        this.currentLanguagePageUrl = url;
      }
    } else {
      this.currentPageUrl = url;
      this.currentLanguagePageUrl = url;
    }

    // Add preload hint for the main image
    if ((this.isBrowser || isPlatformServer(this.platformId)) && imageUrl) {
      try {
        const preloadLink = this.document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = 'image';
        preloadLink.href = imageUrl;
        preloadLink.setAttribute('fetchpriority', 'high');
        this.document.head.appendChild(preloadLink);
      } catch (e) {
        console.warn('Failed to add preload link:', e);
      }
    }

    // Remove existing meta tags before updating
    this.removeMetaTags();

    // Update Page Title & Meta Description
    if (title) {
      this._titleService.setTitle(title);
      this._metaService.updateTag({
        name: 'description',
        content: description || '',
      });
    }

    // Open Graph Meta Tags
    if (title) {
      this._metaService.updateTag({ property: 'og:title', content: title });
    }

    if (description) {
      this._metaService.updateTag({
        property: 'og:description',
        content: description,
      });
    }
    if (imageUrl) {
      this._metaService.updateTag({ property: 'og:image', content: imageUrl });
    }
    this._metaService.updateTag({ property: 'og:url', content: url });
    this._metaService.updateTag({ property: 'og:type', content: 'product' });

    // Twitter Meta Tags
    if (title) {
      this._metaService.updateTag({ name: 'twitter:title', content: title });
    }
    if (description) {
      this._metaService.updateTag({
        name: 'twitter:description',
        content: description,
      });
    }
    if (imageUrl) {
      this._metaService.updateTag({ name: 'twitter:image', content: imageUrl });
    }
    this._metaService.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this._metaService.updateTag({ name: 'twitter:url', content: url });

    // Update alternate links and canonical
    this.updateAlternateLinks(product);
    this.updateCanonicalUrl(url);
  }

  private updateAlternateLinks(product: IProduct): void {
    if (!product) return;

    try {
      // Remove all existing alternate links first
      const existingAlts = this.document.querySelectorAll(
        'link[rel="alternate"]'
      );
      existingAlts.forEach((link: Element) => link.remove());

      // Get current language
      const currentLang = this._translateService.currentLang || 'ar';
      const alternateLang = currentLang === 'ar' ? 'en' : 'ar';

      // Define hreflang links with current language prioritized
      const hreflangLinks = [
        {
          hreflang: 'x-default',
          href: this.buildProductUrl(product, 'ar'),
          slug: product.ar_slug,
        },
        {
          hreflang: currentLang,
          href: this.buildProductUrl(product, currentLang),
          slug: currentLang === 'ar' ? product.ar_slug : product.en_slug,
        },
        {
          hreflang: alternateLang,
          href: this.buildProductUrl(product, alternateLang),
          slug: alternateLang === 'ar' ? product.ar_slug : product.en_slug,
        },
      ];

      // Add hreflang links in order, only if the slug exists
      hreflangLinks.forEach(({ hreflang, href, slug }) => {
        // For x-default, always add if Arabic slug exists
        // For language-specific links, check if the respective slug exists
        const shouldAdd =
          hreflang === 'x-default'
            ? !!(product.ar_slug && product.ar_slug.trim())
            : !!(slug && slug.trim());

        if (shouldAdd) {
          const altLink = this.document.createElement('link');
          altLink.setAttribute('rel', 'alternate');
          altLink.setAttribute('hreflang', hreflang);
          altLink.setAttribute('href', href);
          this.document.head.appendChild(altLink);
        }
      });
    } catch (e) {
      console.warn('Failed to update alternate links:', e);
    }
  }

  /**
   * Helper method to build a product URL with the correct domain and path
   */
  private buildProductUrl(product: IProduct, lang: string): string {
    if (!product) return '';

    const slug = lang === 'ar' ? product.ar_slug : product.en_slug;
    if (!slug) return '';

    return `https://haccosmetics.com/${lang}/product-details/${slug}`;
  }

  private updateCanonicalUrl(url: string): void {
    if (!this.productDetails) return;

    const currentLang = this._translateService.currentLang || 'ar';
    const canonicalUrl = this.buildProductUrl(this.productDetails, currentLang);

    try {
      // Remove existing canonical links
      const existing = this.document.querySelectorAll('link[rel="canonical"]');
      existing.forEach((el: Element) => el.remove());

      // Add new canonical link with correct URL
      const link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', canonicalUrl);
      this.document.head.appendChild(link);
    } catch (e) {
      console.warn('Failed to set canonical URL:', e);
    }
  }

  private removeMetaTags(): void {
    // Define all meta tags to remove
    const metaTagsToRemove = [
      'description',
      'og:title',
      'og:description',
      'og:image',
      'og:url',
      'og:type',
      'twitter:title',
      'twitter:description',
      'twitter:image',
      'twitter:card',
      'twitter:url',
    ];

    // Remove meta tags using Angular Meta service
    metaTagsToRemove.forEach((tag) => {
      try {
        this._metaService.removeTag(`name="${tag}"`);
        this._metaService.removeTag(`property="${tag}"`);
      } catch (e) {
        // Ignore errors if tag doesn't exist
      }
    });

    // Also remove any canonical or alternate links previously injected
    try {
      const existingLinks = this.document.querySelectorAll(
        'link[rel="canonical"], link[rel="alternate"]'
      );
      existingLinks.forEach((link: Element) => link.remove());
    } catch (e) {
      // Ignore errors
    }
  }

  /**
   * Navigate to correct localized URL with appropriate slug
   */
  private navigateToLocalizedUrl(lang: string): void {
    if (!this.productDetails) return;

    // Get the current route slug to compare
    const currentSlug = this._route.snapshot.paramMap.get('slug');

    // Select the appropriate slug based on the language
    const targetSlug =
      lang === 'ar' ? this.productDetails.ar_slug : this.productDetails.en_slug;

    // Only navigate if we have a valid slug and it's different from current
    if (targetSlug && targetSlug.trim() && targetSlug !== currentSlug) {
      this._router
        .navigate(['/', lang, 'product-details', targetSlug])
        .then((success) => {
          if (success) {
            // Update current page URL after successful navigation
            if (this.isBrowser || isPlatformServer(this.platformId)) {
              // Use setTimeout to ensure URL is fully updated
              setTimeout(() => {
                try {
                  this.currentPageUrl =
                    this.document.location?.href ||
                    this.buildProductUrl(this.productDetails, lang);
                  this.currentLanguagePageUrl = this.currentPageUrl;
                } catch (e) {
                  this.currentPageUrl = this.buildProductUrl(
                    this.productDetails,
                    lang
                  );
                  this.currentLanguagePageUrl = this.currentPageUrl;
                }

                // Update meta tags with new URL
                this.removeMetaTags();
                this.handleMeta(this.productDetails);
              }, 100);
            } else {
              // For non-browser environments
              this.currentPageUrl = this.buildProductUrl(
                this.productDetails,
                lang
              );
              this.currentLanguagePageUrl = this.currentPageUrl;
              this.removeMetaTags();
              this.handleMeta(this.productDetails);
            }
          }
        })
        .catch((error) => {
          console.error('Error navigating to localized URL:', error);
        });
    } else {
      // If no navigation needed, still update meta tags for current URL
      if (this.isBrowser || isPlatformServer(this.platformId)) {
        try {
          this.currentPageUrl =
            this.document.location?.href ||
            this.buildProductUrl(this.productDetails, lang);
          this.currentLanguagePageUrl = this.currentPageUrl;
        } catch (e) {
          this.currentPageUrl = this.buildProductUrl(this.productDetails, lang);
          this.currentLanguagePageUrl = this.currentPageUrl;
        }
      } else {
        this.currentPageUrl = this.buildProductUrl(this.productDetails, lang);
        this.currentLanguagePageUrl = this.currentPageUrl;
      }

      this.removeMetaTags();
      this.handleMeta(this.productDetails);
    }
  }

  /**
   * Store product in local storage cart
   */
  private storeCartItemLocally(product: IUnauthUser): void {
    const cartKey = 'orderDetails';
    const cart: IUnauthUser[] = JSON.parse(
      localStorage.getItem(cartKey) || '[]'
    );

    // Check if product is already in cart
    const existingItemIndex = cart.findIndex((item) => item.id === product.id);

    if (existingItemIndex >= 0) {
      // Update existing item
      cart[existingItemIndex] = {
        ...cart[existingItemIndex],
        quantity: product.quantity,
        first_choice: product.first_choice,
        price: product.price,
      };
    } else {
      // Add new item
      cart.push(product);
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    this.setCartLoading(false);

    this.showSuccessAlert(
      '/images/common/addtocart.webp',
      'alerts.cart.add_success.title'
    );

    this._authService.cartCountSignal.set(cart.length);
    console.log('cartCountSignal', this._authService.cartCountSignal());
  }

  private removeFromCartLocally(): void {
    if (!this.productDetails?.id) return;

    this.setCartLoading(true);

    // Show confirmation alert before removing
    this._alertService.showConfirmation({
      imagePath: '/images/common/before-remove.webp',
      translationKeys: {
        title: 'alerts.cart.remove_confirm.title',
        message: 'alerts.cart.remove_confirm.message',
        confirmText: 'alerts.cart.remove_confirm.yes',
        cancelText: 'alerts.cart.remove_confirm.cancel',
      },
      onConfirm: () => {
        // Proceed with removal after confirmation
        const cartKey = 'orderDetails';
        const cart: IUnauthUser[] = JSON.parse(
          localStorage.getItem(cartKey) || '[]'
        );
        const updatedCart = cart.filter(
          (item) => item.id !== this.productDetails?.id
        );
        localStorage.setItem(cartKey, JSON.stringify(updatedCart));
        this.setCartLoading(false);

        this.showSuccessAlert(
          '/images/common/after-remove.webp',
          'alerts.cart.remove_success.title'
        );
        this._authService.cartCountSignal.set(updatedCart.length);
        console.log('cartCountSignal', this._authService.cartCountSignal());
      },
      onCancel: () => {
        this.setCartLoading(false);
      },
    });
  }

  /**
   * Check if product is in cart or currently being updated
   * This helps prevent UI flicker during cart operations
   */
  isInCartOrUpdating(): boolean {
    // If we're in the process of adding to cart, and it was previously in cart,
    // we should still show it as in cart
    if (this.isAddingToCart()) {
      return true;
    }
    return this.isInCart();
  }

  /**
   * Check if current product is a special product
   */
  isSpecialProduct(): boolean {
    const flag = this.productDetails?.is_special;
    return flag === true || flag === 1 || flag === '1' || flag === 'true';
  }

  /**
   * Open the special order modal popup
   */
  openSpecialOrderModal(): void {
    this.isSpecialOrderModalOpen.set(true);
  }

  /**
   * Close the special order modal popup
   */
  closeSpecialOrderModal(): void {
    if (this.isSubmittingSpecialOrder()) return;
    this.isSpecialOrderModalOpen.set(false);
  }

  /**
   * Handle special order form submission
   */
  handleSpecialOrderSubmit(orderData: ISpecialOrderFormData): void {
    if (this.isSubmittingSpecialOrder()) return;

    this.isSubmittingSpecialOrder.set(true);

    this._ordersService.submitSpecialOrder(orderData).subscribe({
      next: () => {
        this.isSubmittingSpecialOrder.set(false);
        this.isSpecialOrderModalOpen.set(false);

        // Store order details in thank you state service
        const productName =
          (this.isRTL()
            ? this.productDetails?.ar_name
            : this.productDetails?.en_name) ||
          this.productDetails?.ar_name ||
          this.productDetails?.en_name ||
          '';

        this._thankYouState.setSubmittedOrder({
          ...orderData,
          product_name: productName,
          submitted_at: new Date().toISOString(),
        });

        // Navigate to /thankYou page
        this._languageService
          .getLanguage()
          .pipe(take(1))
          .subscribe((lang) => {
            this._router.navigate(['/', lang || 'ar', 'thankYou']);
          });
      },
      error: (err) => {
        this.isSubmittingSpecialOrder.set(false);
        console.error('Error submitting special order:', err);

        // Show error notification alert
        this._alertService.showNotification({
          imagePath: '/images/common/error.webp',
          translationKeys: {
            title: 'special_order.error.title',
            message: 'special_order.error.message',
          },
        });
      },
    });
  }
}
