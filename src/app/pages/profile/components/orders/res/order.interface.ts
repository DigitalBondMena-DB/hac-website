export interface IGetOrders {
  row: Row;
}

export interface Row {
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
  confirmed_orders: ConfirmedOrder[];
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
  details: Detail[];
}
export interface Detail {
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
  product: Product;
}

export interface Product {
  id: number;
  category_id: number;
  subcategory_id: number;
  en_name: string;
  ar_name: string;
  en_slug: string;
  ar_slug: string;
  en_description: string;
  ar_description: string;
  price: string;
  sale_price: any;
  price_after_sale: any;
  stock_status: boolean;
  main_image: string;
  additional_images: any;
  ar_small_descritpion: string;
  en_small_descritpion: string;
  size: string;
  active_status: boolean;
  en_more_information: string;
  ar_more_information: string;
  en_ingredient: string;
  ar_ingredient: string;
  en_how_to_use: string;
  ar_how_to_use: string;
  product_counter: number;
}

export interface ILastOrderResponse {
  row: {
    id: number;
    name: string;
    email: string;
    phone: string;
    email_verified_at: string | null;
    role: string;
    admin_status: number;
    verify_status: number;
    deactive_status: number;
    delete_status: number;
    created_at: string;
    updated_at: string;
  };
  order: {
    id: number;
    order_number: string;
    user_id: number;
    user_address_id: number;
    promo_code_id: number | null;
    promo_code_value: string;
    subtotal: string;
    tax: string;
    shipping: string;
    total: string;
    payment_method: string | null;
    order_status: string;
    notes: string | null;
    active_status: boolean;
    order_date: string;
    order_time: string;
    created_at: string;
    updated_at: string;
    details: Detail[];
    cash_on_shipping: number;
  };
}
