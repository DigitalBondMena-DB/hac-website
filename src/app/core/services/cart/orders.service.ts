import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { IGetCartOrOrder } from '@core/interfaces/cart.interfaces';
import { AuthService } from '../auth/auth.service';
import { API_CONFIG } from '../conf/api.config';
import { ApiService } from '../conf/api.service';
@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private api = inject(ApiService);
  private authService = inject(AuthService);

  /**
   * Check cart status
   */
  checkCart(): Observable<IGetCartOrOrder> {
    const userId = this.authService.getUserId();
    return this.api.get<IGetCartOrOrder>(
      `${API_CONFIG.ORDERS.CHECK_CART}${userId}`
    );
  }

  /**
   * Add item to cart or create new order
   */
  addToCartOrCreateOrder(
    item:
      | FormData
      | {
        product_id: string | number;
        quantity: number;
        choice_id?: string;
      },
    user_id: string
  ): Observable<IGetCartOrOrder> {
    let userId = user_id.toString();

    return this.api.post<IGetCartOrOrder>(
      `${API_CONFIG.ORDERS.ADD_TO_CART_OR_CREATE_ORDER}${userId}`,
      item
    );
  }

  /**
   * Update item quantity in cart
   */
  updateQuantity(item: {
    orderDetailId: string | number;
    quantity: number;
  }): Observable<IGetCartOrOrder> {
    const data = new FormData();
    data.append('quantity', item.quantity.toString());
    return this.api.post<IGetCartOrOrder>(
      `${API_CONFIG.ORDERS.UPDATE_QUANTITY}${item.orderDetailId}`,
      data
    );
  }

  /**
   * Remove item from cart
   */
  removeFromCart(detailId: string | number): Observable<IGetCartOrOrder> {
    return this.api.post<IGetCartOrOrder>(
      `${API_CONFIG.ORDERS.REMOVE_FROM_CART}${detailId}`,
      {}
    );
  }

  getDiscount() {
    return this.api.get<any>(`${API_CONFIG.ORDERS.GET_DISCOUNT}`);
  }

  /**
   * Remove all items from cart
   */
  removeAllFromCart(orderId: string | number): Observable<IGetCartOrOrder> {
    return this.api.post<IGetCartOrOrder>(
      `${API_CONFIG.ORDERS.REMOVE_ALL}${orderId}`,
      {}
    );
  }

  /**
   * Apply promo code
   */

  checkPromoCode(code: string): Observable<any> {
    const userId = this.authService.getUserId();
    const formData = new FormData();
    formData.append('promo_code', code.toString());
    formData.append('user_id', userId.toString());
    return this.api.post<any>(`${API_CONFIG.ORDERS.PROMO_CODE}`, formData);
  }

  /* Checkout  */
  checkout(address_id: string, order_id: string): Observable<any> {
    const formData = new FormData();
    formData.append('address_id', address_id.toString());
    return this.api.post<any>(
      `${API_CONFIG.ORDERS.CHECKOUT}${order_id}`,
      formData
    );
  }

  /**
   * Place order
   */
  placeOrder(order_id: number, paymentId: any): Observable<any> {
    const formData = new FormData();
    formData.append('payment_id', paymentId);
    return this.api.post<any>(
      `${API_CONFIG.ORDERS.PLACE_ORDER}${order_id}`,
      formData
    );
  }

  /* Create Payment Session */
  createPaymentSession(userData: {
    name: string;
    amount: number;
    email: string;
    mobile: string;
    order_id: number;
    payment_id: number;
  }): Observable<any> {
    const formData = new FormData();
    formData.append('name', userData.name);
    formData.append('amount', userData.amount.toString());
    formData.append('email', userData.email);
    formData.append('mobile', userData.mobile);
    formData.append('order_id', userData.order_id.toString());
    formData.append('payment_id', userData.payment_id.toString());
    return this.api.post<any>(
      `${API_CONFIG.PAYMENT.CREATE_PAYMENT_SESSION}`,
      formData
    );
  }

  /* Tamara Webhook */
  tamaraWebhook(data: {
    order_id: string;
    order_id_db: string;
  }): Observable<any> {
    return this.api.post<any>(`${API_CONFIG.PAYMENT.TAMARA_WEBHOOK}`, data);
  }

  /* Test As Guest */
  calculateOrderSummaryAsGuest(orderData: {
    price: number;
    quantity: number;
  }): Observable<any> {
    return this.api.get<any>(
      `calculate-subtotal/${orderData.price}/${orderData.quantity}`
    );
  }

  /**
   * Submit special product order ("Register your order")
   */
  submitSpecialOrder(orderData: {
    name: string;
    city: string;
    phone: string;
    email: string;
    doctor_name: string;
    hospital_name: string;
    doctor_code: string;
    address?: string;
    product_id: number | string;
    quantity: number;
  }): Observable<any> {
    const formData = new FormData();
    formData.append('name', orderData.name);
    formData.append('city', orderData.city);
    formData.append('phone', orderData.phone);
    formData.append('email', orderData.email);
    formData.append('doctor_name', orderData.doctor_name);
    formData.append('hospital_name', orderData.hospital_name);
    formData.append('doctor_code', orderData.doctor_code);
    formData.append('address', orderData.address || orderData.city);
    formData.append('product_id', orderData.product_id.toString());
    formData.append('quantity', orderData.quantity.toString());

    return this.api.post<any>(`${API_CONFIG.ORDERS.SPECIAL_ORDER}`, formData);
  }
}

