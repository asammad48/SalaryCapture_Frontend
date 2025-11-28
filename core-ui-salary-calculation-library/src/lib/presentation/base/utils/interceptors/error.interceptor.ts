import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);
  const translate = inject(TranslateService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = translate.instant('SOMETHING_WENT_WRONG_TRY_AGAIN');
      let developerMessage: string | undefined;

      // Extract backend/developer message if any
      if (error?.error) {
        if (typeof error.error === 'string') {
          developerMessage = error.error;
        } else if (error.error.message) {
          developerMessage = error.error.message;
        } else if (Array.isArray(error.error.errors) && error.error.errors.length > 0) {
          developerMessage = error.error.errors.join(', ');
        }
      }

      // Handle by status code
      switch (error.status) {
        case 401:
          // Unauthorized — redirect to login
          router.navigate(['/accounts/login']);
          break;

        default:
          // All other errors (non-200)
          errorMessage = translate.instant('SOMETHING_WENT_WRONG_TRY_AGAIN');
          break;
      }

      // Log error for debugging
      console.error('HTTP Error Intercepted:', {
        url: req.url,
        status: error.status,
        backendMessage: developerMessage || error.message,
        fullError: error
      });

      // Show message to user (except for 401 redirection)
      if (error.status !== 401) {
        messageService.clear();
        messageService.add({
          severity: 'error',
          summary: translate.instant('ERROR_TITLE'),
          detail: errorMessage,
          life: 4000,
        });
      }

      // Attach message to error
      (error as any).message = errorMessage;

      return throwError(() => error);
    })
  );
};
