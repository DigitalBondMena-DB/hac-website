import { AsyncPipe, CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { SafeHtmlComponent } from '@core/safe-html/safe-html.component';
import { CommonService } from '@core/services/common/common.service';
import { API_CONFIG } from '@core/services/conf/api.config';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ArticlesCardSharedComponent } from '@shared/components/articles-card-shared/articles-card-shared.component';
import { SectionHeadingComponent } from '@shared/components/section-heading/section-heading.component';
import { ArticlesSkeletonComponent } from '@shared/components/skeleton/articles-skeleton/articles-skeleton.component';
import { TalentImageCardComponent } from '@shared/components/talent-image-card/talent-image-card.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { HomeService } from '../home/res/home.service';
import { ArticlesHeaderComponent } from './components/articles-header/articles-header.component';
import { BlogsService } from './res/service/blogs.service';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [
    ArticlesHeaderComponent,
    ArticlesCardSharedComponent,
    SectionHeadingComponent,
    TalentImageCardComponent,
    TranslateModule,
    NgxPaginationModule,
    CommonModule,
    CustomTranslatePipe,
    AsyncPipe,
    RouterLink,
    SafeHtmlComponent,
    ImageUrlDirective,
    ArticlesSkeletonComponent,
  ],
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.css',
})
export class ArticlesComponent implements OnInit {
  _translate = inject(TranslateService);
  _languageService = inject(LanguageService);
  currentLanguage$ = inject(LanguageService).getLanguage();
  _API_CONFIG = API_CONFIG.BASE_URL_IMAGE;
  _homeService = inject(HomeService);
  _blogsService = inject(BlogsService);
  _commonService = inject(CommonService);

  // Pagination properties
  currentPage = 1;
  totalItems = 0;
  itemsPerPage = 9;
  loading = true;
  error = false;

  // Access the home data signal directly
  private homeDataSignal = this._commonService.homeData;

  // Computed signal for latest products from home data
  latestProducts = computed(() => {
    const homeData = this.homeDataSignal();
    return homeData?.latestProducts || [];
  });

  // Loading signal for latest products
  latestProductsLoading = signal(true);

  titles: string[] = [];
  blogs: any[] = [];

  constructor() {
    this._languageService.getLanguage().subscribe((lang) => {
      this._translate.use(lang).subscribe(() => {
        this._translate
          .get('articles.sidebar.popular-articles')
          .subscribe((titles: string[]) => {
            this.titles = titles;
          });
      });
    });

    // Setup effect to track when home data is loaded
    effect(() => {
      if (this.homeDataSignal()) {
        this.latestProductsLoading.set(false);
      }
    });
  }

  ngOnInit() {
    this.loadBlogs();
    this.loadLatestProducts();
  }

  loadBlogs(pageUrl?: string) {
    this.loading = true;
    this.error = false;

    this._blogsService.getAllBlogs(pageUrl).subscribe({
      next: (response: any) => {
        if (response && response.rows) {
          this.blogs = response.rows.data || [];
          this.currentPage = response.rows.current_page;
          this.totalItems = response.rows.total;
          this.itemsPerPage = response.rows.per_page;
        } else {
          this.blogs = [];
          this.error = true;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching blogs:', err);
        this.blogs = [];
        this.loading = false;
        this.error = true;
      },
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    const pageUrl = `?page=${page}`;
    this.loadBlogs(pageUrl);
  }

  /**
   * Calculate the total number of pages
   * @returns Total number of pages
   */
  totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  /**
   * Generates an array of page numbers for pagination display
   * @returns Array of page numbers to display
   */
  getPageNumbers(): number[] {
    const totalPages = this.totalPages();

    // Show only 4 pages as in the UI design
    const maxVisiblePages = 4;

    // If we have 4 or fewer pages, show all in reverse order
    if (totalPages <= maxVisiblePages) {
      // Create array [totalPages, totalPages-1, ..., 1]
      return Array.from({ length: totalPages }, (_, i) => totalPages - i);
    }

    // If current page is near the end, show last 4 pages
    if (this.currentPage > totalPages - maxVisiblePages + 1) {
      return [totalPages, totalPages - 1, totalPages - 2, totalPages - 3];
    }

    // Otherwise show a window of pages ending with current page
    let start = Math.max(1, this.currentPage - 3);
    let end = Math.min(start + 3, totalPages);

    // Generate pages in reverse order (e.g., [4,3,2,1])
    const pages = [];
    for (let i = end; i >= start; i--) {
      pages.push(i);
    }

    return pages;
  }

  /**
   * Load latest products from cached home data
   */
  loadLatestProducts() {
    // If we already have home data cached, we're done
    if (this.homeDataSignal()) {
      this.latestProductsLoading.set(false);
      return;
    }

    // Otherwise, fetch home data
    this._commonService.getHomeData().subscribe({
      error: (err) => {
        console.error('Error fetching home data:', err);
        this.latestProductsLoading.set(false);
      },
    });
  }
}
