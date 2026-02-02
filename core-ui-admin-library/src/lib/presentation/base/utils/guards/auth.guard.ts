import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";
import { MsalService } from "@azure/msal-angular";
import { map, take } from "rxjs";

export const authGuard = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const msalService = inject(MsalService);
  const router = inject(Router);

  const accounts = msalService.instance.getAllAccounts();
  const activeAccount = msalService.instance.getActiveAccount();
  
  console.log('AuthGuard: Checking access for route:', state.url);
  console.log('AuthGuard: All accounts count:', accounts.length);
  console.log('AuthGuard: Active account:', activeAccount?.username || 'none');

  if (accounts.length > 0) {
    if (!activeAccount && accounts.length > 0) {
      msalService.instance.setActiveAccount(accounts[0]);
      console.log('AuthGuard: Set active account to:', accounts[0].username);
    }
    return true;
  }

  return msalService.handleRedirectObservable().pipe(
    map((result) => {
      const accountsAfterRedirect = msalService.instance.getAllAccounts();
      console.log('AuthGuard: After redirect, accounts count:', accountsAfterRedirect.length);
      
      if (accountsAfterRedirect.length > 0) {
        if (!msalService.instance.getActiveAccount()) {
          msalService.instance.setActiveAccount(accountsAfterRedirect[0]);
        }
        return true;
      }
      console.log('AuthGuard: No accounts found, redirecting to login');
      router.navigate(['/accounts/login']);
      return false;
    }),
    take(1)
  );
};
