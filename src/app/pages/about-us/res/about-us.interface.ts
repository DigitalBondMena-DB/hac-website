import { IQuotes } from '@core/interfaces/common.model';
import { Counter, Feature, Offer } from '../../home/res/home.interfaces';

export interface IAboutUsOne {
  counters: Counter[];
  breaks: IQuotes[];
  offers: Offer[];
  aboutUs: {
    main_image: string;
    en_main_title: string;
    ar_main_title: string;
    en_main_text: string;
    ar_main_text: string;
  };
}

export interface IAboutUsTwo {
  faqs: IFaq[];
  aboutdata: IAboutData;
  features: Feature[];
}

export interface IFaq {
  id: number;
  en_title: string;
  ar_title: string;
  en_text: string;
  ar_text: string;
  active_status: number;
  created_at: string;
  updated_at: string;
}

export interface IAboutData {
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
