import {HttpErrorResponse, HttpInterceptorFn} from "@angular/common/http";
import {inject} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {JwtHelperService} from "@auth0/angular-jwt";
import {catchError} from "rxjs";
import { LocalStorageService } from "../../../services/local-storage.service";
import { LocalStorageKeys } from "core-ui-salary-calculation-library/src/lib/data/repositories/access/local-storage-keys";

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const activatedRoute = inject(ActivatedRoute);
  const localStorage = inject(LocalStorageService);
  const jwtHelper = new JwtHelperService();

  const token = localStorage.get<string>(LocalStorageKeys.ACCESS_TOKEN);
  const isAuthenticated = token && !jwtHelper.isTokenExpired(token);

  if (isAuthenticated) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          logout(localStorage, router, router.routerState.snapshot.url);
        }
        throw error;
      })
    );
  } else {
    const returnUrl = activatedRoute.snapshot.queryParams["returnUrl"];
    logout(localStorage, router, returnUrl);
  }

  return next(req);
};


export function logout(localStorage: LocalStorageService, router: Router, returnUrl?: string) {
  localStorage.remove(...Object.values(LocalStorageKeys));
  router.navigate(['/accounts/login'], {
    queryParams: { returnUrl: returnUrl }
  }).then();
}
