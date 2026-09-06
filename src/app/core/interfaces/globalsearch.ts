export interface Globalsearch {
  user_id: string;
  category_ids: string[];
  subcategory_ids: string[];
  min_price: number;
  max_price: number;
  stock_status?: '0' | '1';
}
