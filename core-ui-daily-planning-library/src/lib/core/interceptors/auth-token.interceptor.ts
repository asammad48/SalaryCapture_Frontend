import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { catchError } from 'rxjs/operators';
import { LocalStorageService } from '../../presentation/services/local-storage.service';
import { LocalStorageKeys } from '../../data/shared/local-storage-keys';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const activatedRoute = inject(ActivatedRoute);
  const localStorageService = inject(LocalStorageService);
  const jwtHelper = new JwtHelperService();

  const token = localStorageService.get<string>(LocalStorageKeys.ACCESS_TOKEN);
  const isAuthenticated = token && !jwtHelper.isTokenExpired(token);

  if (isAuthenticated) {
    const authRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          handleLogout(localStorageService, router, router.routerState.snapshot.url);
        }
        throw error;
      })
    );
  } else {
    const returnUrl = activatedRoute.snapshot.queryParams['returnUrl'];
    handleLogout(localStorageService, router, returnUrl);
  }

  return next(req);
};

function handleLogout(
  localStorageService: LocalStorageService,
  router: Router,
  returnUrl?: string
): void {
  localStorageService.remove(...Object.values(LocalStorageKeys));
  router.navigate(['/accounts/login'], {
    queryParams: { returnUrl: returnUrl }
  });
}
