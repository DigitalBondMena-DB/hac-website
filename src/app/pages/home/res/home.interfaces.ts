import { ICategory } from '@core/interfaces/common.model';

export interface IHome {
  latestProducts: LatestProduct[];
  sliders: Slider[];
  aboutUs: AboutUs;
  features: Feature[];
  offers: Offer[];
  randomProducts: RandomProduct[];
  categories: ICategory[];
  latestBlogs: LatestBlog[];
  counters: Counter[];
  breaks: Break[];
}

export interface LatestProduct {
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
  price_after_sale?: string;
  stock_status: boolean;
  main_image: string;
  additional_images?: any[][];
  en_specifications: any;
  ar_specifications: any;
  featured: number;
  active_status: boolean;
  en_more_information?: string;
  ar_more_information?: string;
  en_ingredient?: string;
  ar_ingredient?: string;
  en_how_to_use?: string;
  ar_how_to_use?: string;
  product_counter: number;
  created_at: string;
  updated_at: string;
  first_choice: string;
  blog_date: string;
}

export interface Slider {
  en_main_image: string;
  ar_main_image: string;
  en_title: string;
  ar_title: string;
  en_text: string;
  ar_slider_link: string;
  en_slider_link: string;
  ar_text: string;
  ar_small_title: string;
  en_small_title: string;
  id: number;
}

export interface AboutUs {
  id: number;
  en_meta_title: string;
  ar_meta_title: string;
  en_meta_text: string;
  ar_meta_text: string;
  main_image: string;
  active_status: number;
  en_footer_for_text: string;
  ar_footer_for_text: string;
  en_mission_text: string;
  ar_mission_text: string;
  en_vision_text: string;
  ar_vision_text: string;
  en_main_title: string;
  ar_main_title: string;
  en_main_text: string;
  ar_main_text: string;
  created_at: string;
  updated_at: string;
}

export interface Feature {
  id: number;
  icon_image: string;
  en_title: string;
  ar_title: string;
  en_text: string;
  ar_text: string;
  created_at: string;
  updated_at: string;
}

export interface Offer {
  id: number;
  main_image: string;
  ar_small_title: string;
  en_small_title: string;
  en_title: string;
  ar_title: string;
  en_text: string;
  ar_text: string;
  active_status: number;
  created_at: string;
  updated_at: string;
}

export interface RandomProduct {
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
  price_after_sale?: string;
  stock_status: boolean;
  main_image: string;
  additional_images?: any[][];
  en_specifications: any;
  ar_specifications: any;
  featured: number;
  active_status: boolean;
  en_more_information?: string;
  ar_more_information?: string;
  en_ingredient?: string;
  ar_ingredient?: string;
  en_how_to_use?: string;
  ar_how_to_use?: string;
  product_counter: number;
  created_at: string;
  updated_at: string;
}

export interface LatestBlog {
  id: number;
  en_blog_title: string;
  ar_blog_title: string;
  en_blog_text: string;
  ar_blog_text: string;
  main_image: string;
  en_slug: string;
  ar_slug: string;
  blog_date: string;
  en_meta_title: string;
  ar_meta_title: string;
  en_meta_text: string;
  ar_meta_text: string;
  en_script_text: any;
  ar_script_text: any;
  active_status: number;
  created_at: string;
  updated_at: string;
}

export interface Counter {
  id: number;
  en_name: string;
  ar_name: string;
  counter_value: string;
  created_at: string;
  updated_at: string;
}

export interface Break {
  id: number;
  en_name: string;
  ar_name: string;
  order_by: string;
  created_at: string;
  updated_at: string;
}
export interface BestProduct {
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
  sale_price?: string;
  price_after_sale?: string;
  stock_status: boolean;
  main_image: string;
  additional_images?: any[][];
  en_specifications: any;
  ar_specifications: any;
  featured: number;
  active_status: boolean;
  en_more_information?: string;
  ar_more_information?: string;
  en_ingredient?: string;
  ar_ingredient?: string;
  en_how_to_use?: string;
  ar_how_to_use?: string;
  product_counter: number;
  created_at: string;
  updated_at: string;
  first_choice: any;
}
