import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap } from 'rxjs';
import { AuthService } from './auth.service';

const apiScopes: Map<string, string> = new Map<string, string>([
  [
    'https://localhost:7052',
    'api://cubivue-api-to-api-test-001/.default',
  ],
  [
    'https://app-cubivuesaasmicroservicesareamanagement-test-001.azurewebsites.net',
    'api://cubivue-api-to-api-test-001/.default',
  ],
  [
    'https://app-cubivuesaasmicroservicesareamanagement-qa-001.azurewebsites.net',
    'api://cubivue-api-to-api-test-001/.default',
  ]
]);

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const apiScope = [...apiScopes.entries()].find(
    ([url]: [string, string]) => req.url.startsWith(url)
  )?.[1];

  if (!apiScope) {
    return next(req); // No matching scope, proceed without token
  }

  return from(authService.getAccessToken(apiScope)).pipe(
    switchMap((token) => {
      const clonedReq = token
        ? req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`,
            },
          })
        : req;
      return next(clonedReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            console.log('Token expired');
            authService.logout();
          }
          throw error;
        })
      );
    })
  );
};
