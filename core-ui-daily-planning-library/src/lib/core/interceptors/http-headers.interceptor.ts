import { HttpInterceptorFn } from '@angular/common/http';

export const httpHeadersInterceptor: HttpInterceptorFn = (req, next) => {

  if (req.body instanceof FormData) {
    const headers = req.headers.delete('Content-Type');
    const clonedRequest = req.clone({ headers });
    return next(clonedRequest);
  }

  if (!req.headers.has('skip')) {
    const request = req.clone({
      setHeaders: {
        'content-type': 'application/json',
        accept: 'application/json',
      },
    });
    return next(request);
  }

  return next(req);
};
