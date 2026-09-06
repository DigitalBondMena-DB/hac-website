export interface IUserInfo {
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
  addresses: IAddress[];
  confirmed_orders: ConfirmedOrder[];
}

export interface IAddress {
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
}

export interface ConfirmedOrder {
  id: number;
  order_number: string;
  user_id: number;
  user_address_id: number;
  promo_code_id?: number;
  promo_code_value: string;
  subtotal: string;
  tax: string;
  shipping: string;
  total: string;
  payment_method: string;
  order_status: string;
  notes: any;
  active_status: boolean;
  order_date: string;
  order_time: string;
  created_at: string;
  updated_at: string;
}

export interface ILocation {
  id: number;
  en_name: string;
  ar_name: string;
  delivery_amount: string;
  active_status: boolean;
  created_at: string;
  updated_at: string;
}
