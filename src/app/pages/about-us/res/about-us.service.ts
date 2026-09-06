import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '@core/services/conf/api.config';
import { ApiService } from '@core/services/conf/api.service';
import { Observable } from 'rxjs';
import { IAboutUsTwo } from './about-us.interface';

@Injectable({
  providedIn: 'root',
})
export class AboutUsService {
  apiService = inject(ApiService);
  constructor() { }
  getAboutData(): Observable<IAboutUsTwo> {
    return this.apiService.get<IAboutUsTwo>(API_CONFIG.STATIC_PAGES.ABOUT_US);
  }
}
