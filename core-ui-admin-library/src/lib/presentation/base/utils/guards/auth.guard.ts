import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, CanActivateFn } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { LocalStorageService } from '../../../services/local-storage.service';
import { LocalStorageKeys } from 'core-ui-admin-library/src/lib/data/repositories/access/local-storage-keys';

export const authGuard: CanActivateFn = (
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const msalService = inject(MsalService);
  const router = inject(Router);
  const localStorageService = inject(LocalStorageService);

  console.log('AuthGuard checking route:', state.url);

  if (state.url.includes('/accounts/login')) {
    console.log('AuthGuard: Accessing login page, bypassing check');
    return true;
  }

  const accounts = msalService.instance.getAllAccounts();
  const hasToken = localStorageService.get(LocalStorageKeys.ACCESS_TOKEN);

  console.log('MSAL Accounts count:', accounts.length);
  console.log('Access Token present:', !!hasToken);

  if (accounts.length > 0 || hasToken) {
    console.log('AuthGuard: Access granted');
    return true;
  }

  console.log('AuthGuard: Access denied, redirecting to login');
  router.navigate(['/accounts/login']);
  return false;
};
