import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";
import { MsalService } from "@azure/msal-angular";
import { map, take } from "rxjs";

export const authGuard = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const msalService = inject(MsalService);
  const router = inject(Router);

  return msalService.instance.getAllAccounts().length > 0 || msalService.handleRedirectObservable().pipe(
    map(() => {
      if (msalService.instance.getAllAccounts().length > 0) {
        return true;
      }
      router.navigate(['/accounts/login']);
      return false;
    }),
    take(1)
  );
};
