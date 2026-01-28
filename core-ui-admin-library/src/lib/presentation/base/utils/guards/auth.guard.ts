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

  const accounts = msalService.instance.getAllAccounts();
  const hasToken = localStorageService.get(LocalStorageKeys.ACCESS_TOKEN);

  if (accounts.length > 0 || hasToken) {
    return true;
  }

  router.navigate(['/accounts/login']);
  return false;
};
