import {HttpErrorResponse, HttpInterceptorFn} from "@angular/common/http";
import {inject} from "@angular/core";
import {Router} from "@angular/router";
import {MsalService} from "@azure/msal-angular";
import {catchError, from, switchMap} from "rxjs";
import { LocalStorageService } from "../../../services/local-storage.service";
import { LocalStorageKeys } from "../../../../data/repositories/access/local-storage-keys";

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const localStorage = inject(LocalStorageService);
  const msalService = inject(MsalService);

  const account = msalService.instance.getAllAccounts()[0];
  if (!account) {
    return next(req);
  }

  return from(msalService.acquireTokenSilent({
    scopes: ['User.Read'],
    account: account
  })).pipe(
    switchMap(result => {
      const token = result.accessToken;
      if (token) {
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next(authReq);
      }
      return next(req);
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        logout(localStorage, router);
      }
      throw error;
    })
  );
};

export function logout(localStorage: LocalStorageService, router: Router, returnUrl?: string) {
  localStorage.remove(...Object.values(LocalStorageKeys));
  router.navigate(['/accounts/login'], {
    queryParams: { returnUrl: returnUrl }
  }).then();
}
