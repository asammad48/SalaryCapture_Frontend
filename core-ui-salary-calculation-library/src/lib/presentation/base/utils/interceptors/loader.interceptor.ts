import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoaderService } from 'core-ui-salary-calculation-library/src/lib/data/shared/loader.service';
import { finalize } from 'rxjs';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);

  const loaderKey = req.headers.get('x-loader-key');
  if (loaderKey) {
    loaderService.show(loaderKey);
  }

  return next(req).pipe(
    finalize(() => {
      if (loaderKey) {
        loaderService.hide(loaderKey);
      }
    })
  );
};
