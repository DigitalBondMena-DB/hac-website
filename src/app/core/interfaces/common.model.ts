export interface IQuotes {
  id: number;
  en_name: string;
  ar_name: string;
  order_by: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  en_name: string;
  ar_name: string;
  en_slug: string;
  ar_slug: string;
  active_status: number;
  main_image: string;
  order_view: number;
  created_at: string;
  updated_at: string;
}
export interface ICategory extends Category {
  subcategories: ISubcategory[];
  image:string
}

export interface ISubcategory {
  id: number;
  category_id: number;
  en_name: string;
  ar_name: string;
  en_slug: string;
  ar_slug: string;
  active_status: number;
  order_view: number;
  created_at: string;
  updated_at: string;
  image:string
}
