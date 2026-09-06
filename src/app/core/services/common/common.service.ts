import { inject, Injectable, signal } from '@angular/core';
import { ICategory } from '@core/interfaces/common.model';
import { Observable, of, shareReplay, tap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { API_CONFIG } from '../conf/api.config';
import { ApiService } from '../conf/api.service';

// Type for category response
interface CategoryResponse {
  categories: ICategory[];
}

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  // Cache expiration time in milliseconds (default: 5 minutes)
  private readonly CACHE_EXPIRATION = 5 * 60 * 1000;

  // Cache signals
  private categoriesCache = signal<CategoryResponse | null>(null);
  private homeDataCache = signal<any | null>(null);

  // Cache timestamps to handle invalidation if needed
  private cacheTimestamps = signal<Record<string, number>>({
    categories: 0,
    homeData: 0,
  });

  // Signal getters for components that want to subscribe directly
  get categories() {
    return this.categoriesCache;
  }

  get homeData() {
    return this.homeDataCache;
  }

  getAllCategories(): Observable<CategoryResponse> {
    const userId = this.authService.getUserId();
    // Check if cache is valid
    if (this.isCacheValid('categories') && this.categoriesCache()) {
      return of(this.categoriesCache()!);
    }

    return this.apiService
      .get<CategoryResponse>(API_CONFIG.CATEGORY.GET_ALL, { user_id: userId })
      .pipe(
        tap((data) => {
          this.categoriesCache.set(data);
          this.updateCacheTimestamp('categories');
        }),
        shareReplay(1)
      );
  }

  getLatestProduct(): Observable<any> {
    // No need for separate caching, just use home data
    return this.getHomeData();
  }

  getHomeData(): Observable<any> {
    const userId = this.authService.getUserId();

    // Check if cache is valid
    if (this.isCacheValid('homeData') && this.homeDataCache()) {
      return of(this.homeDataCache()!);
    }

    return this.apiService
      .get<any>(API_CONFIG.HOME.GET, { user_id: userId })
      .pipe(
        tap((data) => {
          this.homeDataCache.set(data);
          this.updateCacheTimestamp('homeData');

          // Extract categories from home data if available and if categories aren't already cached
          // if (data.categories && !this.categoriesCache()) {
          //   const categoryData: CategoryResponse = {
          //     categories: data.categories,
          //   };
          //   this.categoriesCache.set(categoryData);
          //   this.updateCacheTimestamp('categories');
          // }
        }),
        shareReplay(1)
      );
  }

  // Method to invalidate cache manually
  invalidateCache(cacheKey: 'categories' | 'homeData') {
    switch (cacheKey) {
      case 'categories':
        this.categoriesCache.set(null);
        break;
      case 'homeData':
        this.homeDataCache.set(null);
        break;
    }
    this.updateCacheTimestamp(cacheKey);
  }

  // Set custom expiration time for specific cache
  setCacheExpiration(key: 'categories' | 'homeData', expirationMs: number) {
    const now = Date.now();
    const expiration = now + expirationMs;

    this.updateCacheTimestamp(key, expiration);
  }

  // Check if cache is still valid
  private isCacheValid(key: string): boolean {
    const timestamp = this.cacheTimestamps()[key] || 0;
    const now = Date.now();

    // If timestamp is 0, it means cache was never set
    if (timestamp === 0) return false;

    return now - timestamp < this.CACHE_EXPIRATION;
  }

  // Helper to update timestamp
  private updateCacheTimestamp(key: string, time = Date.now()) {
    this.cacheTimestamps.update((timestamps) => ({
      ...timestamps,
      [key]: time,
    }));
  }
}
