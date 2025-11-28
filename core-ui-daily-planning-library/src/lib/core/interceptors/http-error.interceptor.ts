import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);
  const translateService = inject(TranslateService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = translateService.instant('SOMETHING_WENT_WRONG_TRY_AGAIN');
      let backendMessage: string | undefined;

      if (error?.error) {
        if (typeof error.error === 'string') {
          backendMessage = error.error;
        } else if (error.error.message) {
          backendMessage = error.error.message;
        } else if (Array.isArray(error.error.errors) && error.error.errors.length > 0) {
          backendMessage = error.error.errors.join(', ');
        }
      }

      switch (error.status) {
        case 401:
          router.navigate(['/accounts/login']);
          break;

        default:
          errorMessage = translateService.instant('SOMETHING_WENT_WRONG_TRY_AGAIN');
          break;
      }

      console.error('HTTP Error:', {
        url: req.url,
        status: error.status,
        message: backendMessage || error.message,
        error: error
      });

      if (error.status !== 401) {
        messageService.clear();
        messageService.add({
          severity: 'error',
          summary: translateService.instant('ERROR_TITLE'),
          detail: errorMessage,
          life: 4000,
        });
      }

      (error as any).message = errorMessage;

      return throwError(() => error);
    })
  );
};
