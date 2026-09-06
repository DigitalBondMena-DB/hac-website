import { IAllProduct } from 'src/app/pages/shopping/res/products.interface';

export interface IAddToCartOrOrder {
  product_id: number;
  quantity: number;
  choice_id?: string;
}

export interface IGetCartOrOrder {
  user: User;
  order: Order;
  orderDetails: OrderDetail[];
  promocode: any;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: any;
  email_verified_at: string;
  role: string;
  admin_status: number;
  verify_status: number;
  deactive_status: number;
  delete_status: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  user_address_id: any;
  promo_code_id: any;
  promo_code_value: number;
  subtotal: string;
  tax: any;
  shipping: any;
  total: any;
  payment_method: any;
  order_status: string;
  notes: any;
  active_status: boolean;
  order_date: string;
  order_time: string;
  created_at: string;
  updated_at: string;
  address: Address;
  details: OrderDetail[];
}

export interface OrderDetail {
  id: number;
  order_id: number;
  product_id: number;
  product_choice_id: any;
  quantity: number;
  unit_price: string;
  subtotal: string;
  active_status: boolean;
  created_at: string;
  updated_at: string;
  product: IAllProduct;
  animationState?: 'visible' | 'fadeOut';
}

export interface IUpdateQuantity {
  quantity: number;
}

export interface ICheckPromoCode {
  promo_code: string;
  user_id: number;
}

export interface IPlaceOrder {
  address_id: number;
  payment_method: number;
}

export interface Address {
  id: number;
  user_id: number;
  location_id: number;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  notes: any;
  active_status: boolean;
  created_at: string;
  updated_at: string;
  location: Location;
}

export interface Location {
  id: number;
  en_name: string;
  ar_name: string;
  delivery_amount: string;
  active_status: boolean;
  created_at: string;
  updated_at: string;
}
