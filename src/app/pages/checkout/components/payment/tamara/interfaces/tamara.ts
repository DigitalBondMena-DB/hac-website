export interface TamaraPaymentRequest {
  total_amount: TotalAmount;
  shipping_amount: ShippingAmount;
  tax_amount: TaxAmount;
  order_reference_id: string;
  order_number: string;
  discount: Discount;
  items: Item[];
  consumer: Consumer;
  country_code: string;
  description: string;
  merchant_url: MerchantUrl;
  payment_type: string;
  billing_address: BillingAddress;
  shipping_address: ShippingAddress;
  platform: string;
  is_mobile: boolean;
  locale: string;
  risk_assessment: RiskAssessment;
  additional_data: AdditionalData;
}

export interface TotalAmount {
  amount: number;
  currency: string;
}

export interface ShippingAmount {
  amount: number;
  currency: string;
}

export interface TaxAmount {
  amount: number;
  currency: string;
}

export interface Discount {
  amount: Amount;
  name: string;
}

export interface Amount {
  amount: number;
  currency: string;
}

export interface Item {
  name: string;
  type: string;
  reference_id: string;
  sku: string;
  quantity: number;
  discount_amount: DiscountAmount;
  tax_amount: TaxAmount2;
  unit_price: UnitPrice;
  total_amount: TotalAmount2;
}

export interface DiscountAmount {
  amount: number;
  currency: string;
}

export interface TaxAmount2 {
  amount: number;
  currency: string;
}

export interface UnitPrice {
  amount: number;
  currency: string;
}

export interface TotalAmount2 {
  amount: number;
  currency: string;
}

export interface Consumer {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}

export interface MerchantUrl {
  cancel: string;
  failure: string;
  success: string;
  notification: string;
}

export interface BillingAddress {
  city: string;
  country_code: string;
  first_name: string;
  last_name: string;
  line1: string;
  line2: string;
  phone_number: string;
  region: string;
}

export interface ShippingAddress {
  city: string;
  country_code: string;
  first_name: string;
  last_name: string;
  line1: string;
  line2: string;
  phone_number: string;
  region: string;
}

export interface RiskAssessment {
  total_ltv: number;
  total_order_count: number;
  order_amount_last3months: number;
  order_count_last3months: number;
  last_order_date: string;
  last_order_amount: number;
  reward_program_enrolled: boolean;
  reward_program_points: number;
  phone_verified: boolean;
}

export interface AdditionalData {
  delivery_method: string;
  pickup_store: string;
  store_code: string;
  vendor_amount: number;
  merchant_settlement_amount: number;
  vendor_reference_code: string;
}
