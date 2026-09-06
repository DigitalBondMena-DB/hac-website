import { IBlog } from './blogs';

export interface ISingleBlog {
  blog: IBlog;
  blogs: IRelatedBlogs[];
}

export interface IRelatedBlogs {
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
  en_script_text?: string;
  ar_script_text?: string;
  active_status: number;
  created_at: string;
  updated_at: string;
}
