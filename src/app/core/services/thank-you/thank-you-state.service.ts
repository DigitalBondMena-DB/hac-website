import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export interface IThankYouOrderData {
  name: string;
  email: string;
  phone: string;
  address: string;
  product_id: number | string;
  quantity: number;
  product_name?: string;
  submitted_at?: string;
}

const STORAGE_KEY = 'hac_last_special_order';

@Injectable({
  providedIn: 'root',
})
export class ThankYouStateService {
  private _platformId = inject(PLATFORM_ID);
  private _isBrowser = isPlatformBrowser(this._platformId);

  private _orderData = signal<IThankYouOrderData | null>(null);
  orderData = this._orderData.asReadonly();

  constructor() {
    this.restoreFromSession();
  }

  /**
   * Restore previous submitted order state from sessionStorage in browser
   */
  private restoreFromSession(): void {
    if (this._isBrowser) {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as IThankYouOrderData;
          this._orderData.set(parsed);
        }
      } catch (e) {
        console.error('Error reading thank you order state from sessionStorage:', e);
      }
    }
  }

  /**
   * Set newly submitted order data
   */
  setSubmittedOrder(data: IThankYouOrderData): void {
    this._orderData.set(data);
    if (this._isBrowser) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error('Error saving thank you order state to sessionStorage:', e);
      }
    }
  }

  /**
   * Check whether an order has been submitted and thank you page can be accessed
   */
  hasSubmittedOrder(): boolean {
    if (this._orderData()) {
      return true;
    }
    if (this._isBrowser) {
      try {
        return !!sessionStorage.getItem(STORAGE_KEY);
      } catch {
        return false;
      }
    }
    return false;
  }

  /**
   * Clear submitted order state
   */
  clearSubmittedOrder(): void {
    this._orderData.set(null);
    if (this._isBrowser) {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.error('Error removing thank you order state from sessionStorage:', e);
      }
    }
  }
}
