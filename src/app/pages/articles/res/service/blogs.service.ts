import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '@core/services/conf/api.config';
import { ApiService } from '@core/services/conf/api.service';
import { Observable } from 'rxjs';
import { IBlogs } from '../interfaces/blogs';
import { ISingleBlog } from '../interfaces/singleBlog';

@Injectable({
  providedIn: 'root',
})
export class BlogsService {
  apiService = inject(ApiService);

  getAllBlogs(pageUrl?: string): Observable<IBlogs | any> {
    if (pageUrl) {
      // If we have a pageUrl, use it directly
      return this.apiService.get(`${API_CONFIG.BLOG.GET_ALL}${pageUrl}`);
    }
    // Otherwise use the default endpoint
    return this.apiService.get(API_CONFIG.BLOG.GET_ALL);
  }

  getBlogById(slug: string): Observable<ISingleBlog | any> {
    return this.apiService.get(`blogs/${slug}`);
  }
}
