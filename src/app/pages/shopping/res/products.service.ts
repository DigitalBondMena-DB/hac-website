import { inject, Injectable } from '@angular/core';
import { Globalsearch } from '@core/interfaces/globalsearch';
import { AuthService } from '@core/services/auth/auth.service';
import { API_CONFIG } from '@core/services/conf/api.config';
import { ApiService } from '@core/services/conf/api.service';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  apiService = inject(ApiService);
  authService = inject(AuthService);

  getAllProducts() {
    const userId = this.authService.getUserId();
    return this.apiService.get(`${API_CONFIG.PRODUCTS.GET_ALL}`, {
      user_id: userId,
    });
  }

  getProductById(slug: string) {
    const userId = this.authService.getUserId();
    const userRole = this.authService.getUserRole();
    return this.apiService.get(`${API_CONFIG.PRODUCTS.GET_WITH_SLUG}/${slug}`, {
      user_role: userRole,
    });
  }

  getProductByCategory(categoryId: string) {
    const userId = this.authService.getUserId();

    return this.apiService.get(
      `${API_CONFIG.PRODUCTS.GET_WITH_CATEGORY}${categoryId}`,
      { user_id: userId }
    );
  }

  getProductBySubcategory(subcategoryId: string) {
    const userId = this.authService.getUserId();

    return this.apiService.get(
      `${API_CONFIG.PRODUCTS.GET_WITH_SUBCATEGORY}${subcategoryId}`,
      { user_id: userId }
    );
  }

  globalSearch(data: Globalsearch) {
    // Create form data object
    const formData = new FormData();

    // Add user ID
    formData.append('user_id', this.authService.getUserId());

    // Send category IDs - use array notation for FormData to match Postman
    // This creates category_ids[] format in the request
    for (const categoryId of data.category_ids) {
      formData.append('category_ids[]', categoryId);
    }

    // Send subcategory IDs - use array notation for FormData
    for (const subcategoryId of data.subcategory_ids) {
      formData.append('subcategory_ids[]', subcategoryId);
    }

    // Add price range
    formData.append('min_price', data.min_price.toString());
    formData.append('max_price', data.max_price.toString());

    // Add stock status
    formData.append('stock_status', data.stock_status || '0');
    console.log(data);
    // Make the API call
    return this.apiService.post(
      `${API_CONFIG.PRODUCTS.GLOBAL_SEARCH}`,
      formData
    );
  }
}
