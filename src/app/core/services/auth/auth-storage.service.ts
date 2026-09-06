import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';

interface TokenData {
  token: string;
  expiresAt: number;
}

export interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  admin_status: number;
  verify_status: number;
  deactive_status: number;
  delete_status: number;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthStorageService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_DATA_KEY = 'user_data';
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  saveToken(token: string, expiresIn: number): void {
    if (!this.isBrowser) return;

    const expiresAt = new Date().getTime() + expiresIn * 1000;
    const tokenData: TokenData = { token, expiresAt };
    localStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokenData));
  }

  saveUserData(userData: UserData): void {
    if (!this.isBrowser) return;

    localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
  }

  getUserData(): UserData | null {
    if (!this.isBrowser) return null;

    const userDataStr = localStorage.getItem(this.USER_DATA_KEY);
    if (!userDataStr) return null;

    try {
      return JSON.parse(userDataStr);
    } catch (error) {
      this.removeUserData();
      return null;
    }
  }

  removeUserData(): void {
    if (!this.isBrowser) return;

    localStorage.removeItem(this.USER_DATA_KEY);
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;

    const tokenDataStr = localStorage.getItem(this.TOKEN_KEY);
    if (!tokenDataStr) return null;

    try {
      const tokenData: TokenData = JSON.parse(tokenDataStr);

      // Check if token is expired
      if (new Date().getTime() > tokenData.expiresAt) {
        this.removeToken();
        return null;
      }

      return tokenData.token;
    } catch (error) {
      this.removeToken();
      return null;
    }
  }

  removeToken(): void {
    if (!this.isBrowser) return;

    localStorage.removeItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    if (!this.isBrowser) return false;

    const token = this.getToken();
    return token !== null;
  }

  getUserId(): string {
    const userData = this.getUserData();
    return userData?.id.toString() || '';
  }

  logout(): void {
    this.removeToken();
    this.removeUserData();
    if (this.isBrowser) {
      this.router.navigate(['/']);
    }
  }
}
