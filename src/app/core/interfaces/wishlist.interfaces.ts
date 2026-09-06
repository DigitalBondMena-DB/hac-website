export interface IPostWish {
  wish: Wish;
  product: Product;
  user: User;
}

export interface Wish {
  user_id: string;
  product_id: string;
  updated_at: string;
  created_at: string;
  id: number;
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
  sale_price: string;
  price_after_sale: string;
  stock_status: boolean;
  main_image: string;
  additional_images: any;
  en_specifications: any;
  ar_specifications: any;
  featured: number;
  active_status: boolean;
  en_more_information: string;
  ar_more_information: string;
  en_ingredient: string;
  ar_ingredient: string;
  en_how_to_use: string;
  ar_how_to_use: string;
  product_counter: number;
  created_at: string;
  updated_at: string;
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

export interface IGetWishlist {
  id: number;
  product_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  product: Product;
}
