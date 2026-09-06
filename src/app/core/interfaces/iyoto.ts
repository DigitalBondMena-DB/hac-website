export interface IYotoPlaced {
  orderId: string;
  createShipment: string;
  deliveryOptionId: number;
  payment_method: string;
  amount: number;
  amount_due: number;
  currency: string;
  customsValue: string;
  customsCurrency: string;
  packageCount: number;
  packageWeight: number;
  boxWidth: number;
  boxLength: number;
  boxHeight: number;
  orderDate: string;
  deliverySlotDate: string;
  deliverySlotTo: string;
  deliverySlotFrom: string;
  senderName: string;
  customer: Customer;
  items: Item[];
}

export interface Customer {
  name: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  country: string;
  postcode: string;
}

export interface Item {
  productId?: number;
  name: string;
  price: number;
  rowTotal?: number;
  taxAmount?: number;
  quantity: number;
  sku: string;
  image?: string;
}
