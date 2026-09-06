export interface IUnauthUser {
  id: number;
  ar_slug: string;
  en_slug: string;
  first_choice: string | null;
  quantity?: number;
  price: string | number;
  lineTotal?: number; // For discount calculations in unauthenticated cart
  // Additional fields to match OrderDetail structure for cart display
  product_name: string;
  en_name: string;
  ar_name: string;
  product_image: string;
}
