import { HttpInterceptorFn } from '@angular/common/http';

export const defaultInterceptor: HttpInterceptorFn = (req, next) => {

  if(req.body instanceof FormData){

    // const request = req.clone({
    //   setHeaders: {
    //     'content-type': 'multipart/form-data',
    //     accept: 'multipart/form-data',
    //   },
    // });
    // return next(request);

    const headers = req.headers.delete('Content-Type');
      const clonedReq = req.clone({ headers });
      return next(clonedReq);

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
