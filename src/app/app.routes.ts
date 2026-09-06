import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { publicGuard } from '@core/guards/public.guard';
import { thankYouGuard } from '@core/guards/thank-you.guard';
import { cartCheckResolver } from '@core/resolvers/cart-check.resolver';
import { MainLayout } from './layouts/main-layout/main-layout';
import { ArticlesComponent } from './pages/articles/articles.component';
import { blogDetailsResolver } from './pages/articles/res/resolver/blog-details.resolver';
import { checkoutAddressResolver } from './pages/checkout/res/resolvers/checkout-address.resolver';
import { checkoutLocationsResolver } from './pages/checkout/res/resolvers/checkout-locations.resolver';
import { HomeComponent } from './pages/home/home.component';
import { productDetailsResolver } from './pages/product-details/res/product-details.resolver';
import { ShoppingComponent } from './pages/shopping/shopping.component';

export const routes: Routes = [
  { path: '', redirectTo: '/ar', pathMatch: 'full' },
  { path: 'thankYou', redirectTo: '/ar/thankYou', pathMatch: 'full' },

  {
    path: ':lang/login',
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout').then((c) => c.AuthLayout),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../app/pages/auth/login/login.component').then(
            (c) => c.LoginComponent
          ),
        data: {
          title: 'pages.auth.login.title',
          description: 'pages.auth.login.description',
        },
      },
    ],
    canActivate: [publicGuard],
  },

  {
    path: ':lang/register',
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout').then((c) => c.AuthLayout),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../app/pages/auth/register/register.component').then(
            (c) => c.RegisterComponent
          ),
        children: [
          { path: '', redirectTo: 'personal', pathMatch: 'full' },
          {
            path: 'personal',
            loadComponent: () =>
              import(
                '../app/pages/auth/register/components/personal/personal.component'
              ).then((c) => c.PersonalComponent),
            data: {
              title: 'pages.auth.register.personal.title',
              description: 'pages.auth.register.personal.description',
            },
          },
          {
            path: 'password',
            loadComponent: () =>
              import(
                '../app/pages/auth/register/components/password/password.component'
              ).then((c) => c.PasswordComponent),
            data: {
              title: 'pages.auth.register.password.title',
              description: 'pages.auth.register.password.description',
            },
          },
          {
            path: 'address',
            loadComponent: () =>
              import(
                '../app/pages/auth/register/components/address/address.component'
              ).then((c) => c.AddressComponent),
            data: {
              title: 'pages.auth.register.address.title',
              description: 'pages.auth.register.address.description',
            },
          },
        ],
        data: {
          title: 'pages.auth.register.title',
          description: 'pages.auth.register.description',
        },
      },
    ],
    canActivate: [publicGuard],
  },

  {
    path: ':lang/register/:role',
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout').then((c) => c.AuthLayout),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../app/pages/auth/register/register.component').then(
            (c) => c.RegisterComponent
          ),
        children: [
          { path: '', redirectTo: 'personal', pathMatch: 'full' },
          {
            path: 'personal',
            loadComponent: () =>
              import(
                '../app/pages/auth/register/components/personal/personal.component'
              ).then((c) => c.PersonalComponent),
            data: {
              title: 'pages.auth.register.personal.title',
              description: 'pages.auth.register.personal.description',
            },
          },
          {
            path: 'password',
            loadComponent: () =>
              import(
                '../app/pages/auth/register/components/password/password.component'
              ).then((c) => c.PasswordComponent),
            data: {
              title: 'pages.auth.register.password.title',
              description: 'pages.auth.register.password.description',
            },
          },
          {
            path: 'address',
            loadComponent: () =>
              import(
                '../app/pages/auth/register/components/address/address.component'
              ).then((c) => c.AddressComponent),
            data: {
              title: 'pages.auth.register.address.title',
              description: 'pages.auth.register.address.description',
            },
          },
        ],
        data: {
          title: 'pages.auth.register.title',
          description: 'pages.auth.register.description',
        },
      },
    ],
    canActivate: [publicGuard],
  },

  /* Main layout */
  {
    path: ':lang',
    component: MainLayout,
    children: [
      /* Home */
      {
        path: '',
        component: HomeComponent,
        data: {
          title: 'pages.home.title',
          description: 'pages.home.description',
        },
      },

      /* Wishlist */
      {
        path: 'wishlist',
        loadComponent: () =>
          import('./pages/wishlist/wishlist.component').then(
            (c) => c.WishlistComponent
          ),
        data: {
          title: 'pages.wishlist.title',
          description: 'pages.wishlist.description',
        },
        canActivate: [authGuard],
      },

      /* Blogs */
      {
        path: 'blogs',
        component: ArticlesComponent,
        data: {
          title: 'pages.blogs.title',
          description: 'pages.blogs.description',
        },
      },

      /* Blog Details */
      {
        path: 'blog/:slug',
        loadComponent: () =>
          import('./pages/blog/blog.component').then((c) => c.BlogComponent),
        resolve: {
          blogData: blogDetailsResolver,
        },
        data: {
          title: 'pages.blog.title',
          description: 'pages.blog.description',
        },
      },

      /* Shopping */
      {
        path: 'shopping',
        component: ShoppingComponent,
        data: {
          title: 'pages.shopping.title',
          description: 'pages.shopping.description',
        },
      },

      /* Product Details */
      {
        path: 'product-details/:slug',
        loadComponent: () =>
          import('./pages/product-details/product-details.component').then(
            (c) => c.ProductDetailsComponent
          ),
        resolve: {
          productDetails: productDetailsResolver,
        },

        data: {
          title: 'pages.product.title',
          description: 'pages.product.description',
        },
      },

      /* About Us  */
      {
        path: 'about-us',
        loadComponent: () =>
          import('./pages/about-us/about-us.component').then(
            (c) => c.AboutUsComponent
          ),
        data: {
          title: 'pages.about.title',
          description: 'pages.about.description',
        },
      },

      /* Contact Us */
      {
        path: 'contact-us',
        loadComponent: () =>
          import('./pages/contact-us/contact-us.component').then(
            (c) => c.ContactUsComponent
          ),
        data: {
          title: 'pages.contact.title',
          description: 'pages.contact.description',
        },
      },

      /* Thank You */
      {
        path: 'thankYou',
        loadComponent: () =>
          import('./pages/thank-you/thank-you.component').then(
            (c) => c.ThankYouComponent
          ),
        canActivate: [thankYouGuard],
        data: {
          title: 'pages.thankyou.title',
          description: 'pages.thankyou.description',
        },
      },

      /* Cart */
      {
        path: 'cart',
        loadComponent: () =>
          import('./pages/cart/cart.component').then((c) => c.CartComponent),
        data: {
          title: 'pages.cart.title',
          description: 'pages.cart.description',
        },
        // canActivate: [authGuard],
      },

      /* Profile */
      {
        path: 'profile',
        loadComponent: () =>
          import('../app/pages/profile/profile.component').then(
            (c) => c.ProfileComponent
          ),
        canActivate: [authGuard],
        children: [
          { path: '', redirectTo: 'personal', pathMatch: 'full' },
          {
            path: 'personal',
            loadComponent: () =>
              import(
                '../app/pages/profile/components/profile-details/profile-details.component'
              ).then((c) => c.ProfileDetailsComponent),
            data: {
              title: 'pages.profile.personal.title',
              description: 'pages.profile.personal.description',
            },
          },
          {
            path: 'orders',
            loadComponent: () =>
              import(
                '../app/pages/profile/components/orders/orders.component'
              ).then((c) => c.OrdersComponent),
            data: {
              title: 'pages.profile.orders.title',
              description: 'pages.profile.orders.description',
            },
          },
          {
            path: 'address',
            loadComponent: () =>
              import(
                '../app/pages/profile/components/address/address.component'
              ).then((c) => c.AddressComponent),
            data: {
              title: 'pages.profile.address.title',
              description: 'pages.profile.address.description',
            },
          },
          {
            path: 'password',
            loadComponent: () =>
              import(
                '../app/pages/profile/components/password/password.component'
              ).then((c) => c.PasswordComponent),
            data: {
              title: 'pages.profile.password.title',
              description: 'pages.profile.password.description',
            },
          },
          {
            path: 'account-management',
            loadComponent: () =>
              import(
                '../app/pages/profile/components/account-management/account-management.component'
              ).then((c) => c.AccountManagementComponent),
            data: {
              title: 'pages.profile.account.title',
              description: 'pages.profile.account.description',
            },
          },
        ],
      },

      /* Privacy */
      {
        path: 'privacy',
        loadComponent: () =>
          import('./pages/privacy/privacy.component').then(
            (c) => c.PrivacyComponent
          ),
        data: {
          title: 'pages.privacy.title',
          description: 'pages.privacy.description',
        },
      },

      /* Checkout */
      {
        path: 'checkout',
        loadComponent: () =>
          import('./pages/checkout/checkout.component').then(
            (c) => c.CheckoutComponent
          ),
        children: [
          { path: '', redirectTo: 'checkout-address', pathMatch: 'full' },
          {
            path: 'checkout-address',
            loadComponent: () =>
              import(
                './pages/checkout/components/checkout-address/checkout-address.component'
              ).then((c) => c.CheckoutAddressComponent),
            resolve: {
              addressData: checkoutAddressResolver,
              locationsData: checkoutLocationsResolver,
              cartCheck: cartCheckResolver,
            },
            data: {
              title: 'pages.checkout.address.title',
              description: 'pages.checkout.address.description',
            },
          },
          {
            path: 'payment',
            loadComponent: () =>
              import(
                './pages/checkout/components/payment/payment.component'
              ).then((c) => c.PaymentComponent),
            resolve: {
              cartCheck: cartCheckResolver,
            },
            data: {
              title: 'pages.checkout.payment.title',
              description: 'pages.checkout.payment.description',
            },
          },

          {
            path: 'track-order',
            loadComponent: () =>
              import(
                './pages/checkout/components/track-orders/track-orders.component'
              ).then((c) => c.TrackOrdersComponent),
            data: {
              title: 'pages.checkout.track.title',
              description: 'pages.checkout.track.description',
            },
          },

          {
            path: 'track-order/:order-id',
            loadComponent: () =>
              import(
                './pages/checkout/components/track-orders/track-orders.component'
              ).then((c) => c.TrackOrdersComponent),
            data: {
              title: 'pages.checkout.track.title',
              description: 'pages.checkout.track.description',
            },
          },
        ],
        canActivate: [authGuard],
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
