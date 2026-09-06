import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { IBlog } from '../interfaces/blogs';
import { ISingleBlog } from '../interfaces/singleBlog';
import { BlogsService } from '../service/blogs.service';

export const blogDetailsResolver: ResolveFn<Observable<ISingleBlog | null>> = (
  route
) => {
  const blogsService = inject(BlogsService);
  const router = inject(Router);

  const rawSlug = route.paramMap.get('slug');
  const currentLang =
    route.paramMap.get('lang') || route.parent?.paramMap.get('lang') || 'ar';
  if (!rawSlug) {
    return of(null);
  }

  let slug: string;
  try {
    slug = decodeURIComponent(rawSlug);
  } catch (error) {
    console.warn('Failed to decode slug, using original:', rawSlug, error);
    slug = rawSlug;
  }

  return blogsService.getBlogById(slug).pipe(
    switchMap((response: any) => {
      const isArabicSlug = /[\u0600-\u06FF]/.test(slug);
      const isEnglishSlug = /^[A-Za-z0-9\-]+$/.test(slug);

      const isLangAndSlugMismatch =
        (currentLang === 'ar' && isEnglishSlug) ||
        (currentLang === 'en' && isArabicSlug);

      if (isLangAndSlugMismatch) {
        const redirectPath = `/${currentLang}/blogs`;
        router.navigate([redirectPath], { replaceUrl: true });
        return of(null);
      }

      if (response && response.blog) {
        return of(response as ISingleBlog);
      }

      if (response && !Array.isArray(response)) {
        return blogsService.getAllBlogs().pipe(
          map((allBlogsResponse: any) => {
            let allBlogs: IBlog[] = [];

            if (
              allBlogsResponse?.rows?.data &&
              Array.isArray(allBlogsResponse.rows.data)
            ) {
              allBlogs = allBlogsResponse.rows.data;
            } else if (Array.isArray(allBlogsResponse)) {
              allBlogs = allBlogsResponse;
            }

            const relatedBlogs = allBlogs.filter(
              (blog: IBlog) =>
                blog.id !== response.id &&
                blog.en_slug !== slug &&
                blog.ar_slug !== slug &&
                blog.en_slug !== rawSlug &&
                blog.ar_slug !== rawSlug
            );

            return {
              blog: response,
              blogs: relatedBlogs,
            } as ISingleBlog;
          })
        );
      }

      return of(null);
    }),
    catchError((error) => {
      console.error('Error in blog details resolver:', error);
      return of(null);
    })
  );
};
