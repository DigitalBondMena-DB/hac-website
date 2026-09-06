import { HttpInterceptorFn } from '@angular/common/http';

export const reCallApiInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
