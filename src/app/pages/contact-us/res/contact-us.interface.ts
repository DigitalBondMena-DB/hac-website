import { Feature } from '../../home/res/home.interfaces';

export interface IContactUs {
  id: number;
  en_address: string;
  ar_address: string;
  phone: string;
  email: string;
  facebook: any;
  twitter: string;
  instagram: any;
  linkedin: string;
  active_status: number;
  created_at: any;
  updated_at: string;
}

export interface IFeatures {
  features: Feature;
}

export interface IContactUsForm {
  name: string;
  email: string;
  phone: string;
  message: string;
}
