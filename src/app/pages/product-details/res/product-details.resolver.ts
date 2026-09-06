// import { inject } from '@angular/core';
// import {
//   ActivatedRouteSnapshot,
//   ResolveFn,
//   RouterStateSnapshot,
// } from '@angular/router';
// import { Observable } from 'rxjs';
// import { ProductsService } from '../../shopping/res/products.service';

// export const productDetailsResolver: ResolveFn<Observable<any>> = (
//   route: ActivatedRouteSnapshot,
//   state: RouterStateSnapshot
// ) => {
//   const productsService = inject(ProductsService);
//   // Extract the id parameter from the route
//   const productId = route.paramMap.get('id');

//   return productsService.getProductById(productId || '');
// };
import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ProductsService } from '../../shopping/res/products.service';
import { IProductDetails } from './productDetails.interface';

export const productDetailsResolver: ResolveFn<IProductDetails | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const productsService = inject(ProductsService);

  const currentLang = route.parent?.paramMap.get('lang'); // 'ar' or 'en'
  const slug = route.paramMap.get('slug');

  console.log('not slug', slug);
  console.log('not currentLang', currentLang);

  if (!slug || !currentLang) {
    // Default to Arabic if no language is provided
    const fallbackLang = currentLang || 'ar';
    router.navigate(['/', fallbackLang, 'shopping']);
    return of(null);
  }

  // Fetch the product by any slug (your service should search by arSlug or enSlug)
  return productsService.getProductById(slug).pipe(
    switchMap((response: unknown) => {
      const productDetails = response as IProductDetails;

      if (!productDetails || !productDetails.product) {
        router.navigate(['/', currentLang, 'shopping']);
        return of(null);
      }

      const product = productDetails.product;

      // Check if the current slug matches the language
      const correctSlug =
        currentLang === 'ar' ? product.ar_slug : product.en_slug;

      console.log(
        `Current slug: ${slug}, Correct slug: ${correctSlug}, Language: ${currentLang}`
      );

      // Only redirect if we have a correct slug and it's different from current
      if (correctSlug && correctSlug.trim() && slug !== correctSlug) {
        console.log(
          `Redirecting to correct slug: /${currentLang}/product-details/${correctSlug}`
        );
        // Redirect to the correct slug
        router.navigate([`/${currentLang}/product-details/${correctSlug}`]);
        return of(null);
      }
      console.log('productDetails', productDetails);
      // Everything is fine - return the product details
      return of(productDetails);
    }),
    catchError((error) => {
      console.error('Error in product details resolver:', error);
      router.navigate(['/', currentLang, 'shopping']);
      return of(null);
    })
  );
};
