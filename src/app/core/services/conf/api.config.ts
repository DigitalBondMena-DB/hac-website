export const API_CONFIG = {
  BASE_URL: 'https://dev.mesoshop.digitalbondmena.com/api/',

  BASE_URL_IMAGE: 'https://mesoshop.digitalbondmena.com/',

  HOME: {
    GET: 'home',
  },

  PRODUCTS: {
    GET_ALL: 'menu/products',
    GET_WITH_CATEGORY: 'menu/category/',
    GET_WITH_SUBCATEGORY: 'menu/subcategory/',
    GET_WITH_SLUG: 'menu/products',
    GLOBAL_SEARCH: 'search',
  },

  CATEGORY: {
    GET_ALL: 'menu/category',
  },

  BLOG: {
    GET_ALL: 'blogs',
    GET_SINGLE: 'blogs/ar-blog-title',
  },

  STATIC_PAGES: {
    ABOUT_US: 'home/about-us',
    CONTACT_US: 'home/contact-us',
  },

  AUTH: {
    REGISTER: 'signup',
    LOGIN: 'signin',
  },

  ORDERS: {
    GET_DISCOUNT: 'getdiscount',
    /* ADD TO CART OR CREATE ORDER */
    ADD_TO_CART_OR_CREATE_ORDER: 'orders/addToCart/',
    /* UPDATE QUANTITY */
    UPDATE_QUANTITY: 'orders/updateQuantity/',
    /* REMOVE FROM CART */
    REMOVE_FROM_CART: 'orders/removeFromCart/',
    REMOVE_ALL: 'orders/removeAllCart/',
    PROMO_CODE: 'checkPromoCode',

    /* CHECKOUT */
    CHECKOUT: 'orders/checkout/',

    /* CHECK CART */
    CHECK_CART: 'orders/cartcheck/',

    /* PLACE ORDER */
    PLACE_ORDER: 'orders/placeOrder/',

    /* SPECIAL ORDER */
    SPECIAL_ORDER: 'submitSpicalForm',
  },

  USER_MANAGEMENT: {
    GET_USER_INFO: 'users',
    GET_USER_ORDERS: 'users/showOrders',
    /* Pending */
    GET_USER_LAST_ORDER: 'users/userneworders',
    GET_USER_ORDER: 'users/order',
    ADD_NEW_ADDRESS: 'users/addNewAddress',
    DEACTIVATE_USER: 'users/deactiveuser/',
    DELETE_USER: 'users/deleteuser/',
    LOCATION: 'menu/locations',
    UPDATE_USER_INFO: 'updateprofile',
    SHOW_ORDERS: 'users/showOrders',
  },

  WISHLIST: {
    STORE_WISH: 'wish',
    GET_USER_WISH: 'wish',
    REMOVE_WISH: 'wish/delete/',
  },

  PAYMENT: {
    CREATE_PAYMENT_SESSION: 'create-payment',
    TAMARA_WEBHOOK: 'create-payment-new',
  },

  BUSINESS: {
    GET_BUSINESS_INFO: 'newsignup',
  },
};
export const isRamadanMonth = false;
