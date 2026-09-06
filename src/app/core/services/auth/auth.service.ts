import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStorageService } from '@core/services/auth/auth-storage.service';
import { API_CONFIG } from '@core/services/conf/api.config';
import { ApiService } from '@core/services/conf/api.service';
import { LanguageService } from '@core/services/lang/language.service';
import { Observable, of, tap } from 'rxjs';
import { ILogin, IRegister } from '../../interfaces/auth.interfaces';

interface AuthResponse {
  access_token: string;
  expires_in?: number;
  token_type?: string;
  user?: any;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  _apiService = inject(ApiService);
  private _http = inject(HttpClient);
  private baseUrl = API_CONFIG.BASE_URL;
  private authStorage = inject(AuthStorageService);
  private _router = inject(Router);
  private _languageService = inject(LanguageService);

  cartCountSignal = signal<number>(0);

  // Authentication state using signal
  isAuthenticatedValue = signal<boolean>(this.checkAuthStatus());

  login(data: ILogin): Observable<AuthResponse> {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);

    return this._http
      .post<AuthResponse>(`${this.baseUrl}${API_CONFIG.AUTH.LOGIN}`, formData)
      .pipe(
        tap((response) => {
          if (response.access_token) {
            // Default expiration to 24 hours if not provided by backend
            const expiresIn = response.expires_in || 24 * 60 * 60;
            this.authStorage.saveToken(response.access_token, expiresIn);

            // Save user data to local storage
            if (response.user) {
              this.authStorage.saveUserData(response.user);
            }

            this.isAuthenticatedValue.set(true);
          }
        })
      );
  }

  register(data: IRegister): Observable<any> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('password', data.password);

    // Add role if provided
    if (data.role !== undefined) {
      formData.append('role', data.role);
    }

    return this._http
      .post<AuthResponse>(
        `${this.baseUrl}${API_CONFIG.AUTH.REGISTER}`,
        formData
      )
      .pipe(
        tap((response: AuthResponse) => {
          if (response && response.access_token) {
            this.authStorage.saveToken(
              response.access_token,
              response.expires_in || 24 * 60 * 60
            );

            // Save user data to local storage
            if (response.user) {
              this.authStorage.saveUserData(response.user);
            }

            this.isAuthenticatedValue.set(true);
          }
        })
      );
  }

  /**
   * Register with files - used for business registration with document uploads
   * @param formData FormData containing all registration fields and files
   * @returns Observable of the registration response
   */

  /* Business */
  registerAsBusiness(formData: FormData): Observable<any> {
    return this._http
      .post<AuthResponse>(
        `${this.baseUrl}${API_CONFIG.BUSINESS.GET_BUSINESS_INFO}`,
        formData
      )
      .pipe(
        tap((response: AuthResponse) => {
          if (response && response.access_token) {
            this.authStorage.saveToken(
              response.access_token,
              response.expires_in || 24 * 60 * 60
            );

            // Save user data to local storage
            if (response.user) {
              this.authStorage.saveUserData(response.user);
            }

            this.isAuthenticatedValue.set(true);
          }
        })
      );
  }

  logout(): Observable<any> {
    this.authStorage.logout();
    this.isAuthenticatedValue.set(false);

    let lang = '';
    this._languageService.getLanguage().subscribe((next) => (lang = next));
    this._router.navigate(['/', lang]);

    return of({ success: true });
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedValue();
  }

  getToken(): string | null {
    return this.authStorage.getToken();
  }

  authenticationState() {
    return this.isAuthenticatedValue.asReadonly();
  }

  private checkAuthStatus(): boolean {
    return !!this.authStorage.getToken();
  }

  // Add a method to get the user data
  getUserData(): any {
    return this.authStorage.getUserData();
  }

  // Add a method to get the user data
  getUserRole(): any {
    return this.authStorage.getUserData()?.role.toLowerCase();
  }

  getUserId(): string {
    return this.authStorage.getUserData()?.id.toString() || '';
  }
}
