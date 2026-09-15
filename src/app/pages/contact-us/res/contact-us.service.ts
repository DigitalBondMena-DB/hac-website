import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '@core/services/conf/api.config';
import { ApiService } from '@core/services/conf/api.service';
import { IContactUsForm } from './contact-us.interface';

@Injectable({
  providedIn: 'root',
})
export class ContactUsService {
  apiService = inject(ApiService);
  private http = inject(HttpClient);

  getContactUs() {
    return this.apiService.get(API_CONFIG.STATIC_PAGES.CONTACT_US);
  }

  getFeatures() {
    return this.apiService.get(API_CONFIG.HOME.GET);
  }

  getContactUsForm(data: IContactUsForm) {
    // Create FormData object
    const formData = new FormData();

    // Append form fields to FormData
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('message', data.message);

    // Send as FormData instead of JSON body
    return this.http.post(API_CONFIG.BASE_URL + 'submitform', formData);
  }
}
