import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Permissions, PermissionsType } from 'core-ui-salary-calculation-library/src/lib/core/domain/constants/claims.constants';
import { AccessService } from 'core-ui-salary-calculation-library/src/lib/data/repositories/access/access.service';
import { LocalStorageService } from '../../../services';
import { LocalStorageKeys } from 'core-ui-salary-calculation-library/src/lib/data/repositories/access/local-storage-keys';
import { TenantConfigurationService } from '../../../services/tenant-configuration.service';

export const permissionGuard = (permission: PermissionsType): CanActivateFn => {
  return (): boolean | UrlTree => {
    const accessService = inject(AccessService);
    const router = inject(Router);

    if (accessService.hasPermission(permission)) {
      return true;
    }

    return router.parseUrl('/page-not-found');
  };
};

export const salaryReportAccessGuard: CanActivateFn = permissionGuard(Permissions.SALARY_CAPTURE_EXPORT_BUTTON);
export const salaryReportHistoryAccessGuard: CanActivateFn = permissionGuard(Permissions.SALARY_CAPTURE_EXPORT_BUTTON);
export const dailyJobsAccessGuard: CanActivateFn = permissionGuard(Permissions.DAILY_JOBS_PAGE_ACCESS);

const getBooleanFromStorage = (key: string, localStorageService: LocalStorageService): boolean => {
  const raw = localStorageService.get(key);
  return raw === true || raw === 'true';
};

//   Module-level guard for the whole Salary library (NO AccessService here)
export const salaryModuleAccessGuard: CanActivateFn = () => {
  const localStorageService = inject(LocalStorageService);
  const tenantConfig = inject(TenantConfigurationService);
  const router = inject(Router);

  const isEditable = tenantConfig.isModuleAccessEditable();      // both keys exist?
  const salaryLicensed = tenantConfig.isSalaryCaptureEnabled();  // tenant license

  // If salary not licensed at all → hard block
  if (!salaryLicensed) {
    return router.parseUrl('/page-not-found');
  }

  // OLD TENANT MODE: no SalaryCapture/DailyPlanning keys
  // -> salary is always allowed if licensed
  if (!isEditable) {
    return true;
  }

  // NEW TENANT MODE: use per-user flag + license
  const hasSalaryAccess =
    getBooleanFromStorage(LocalStorageKeys.HAS_SALARY_CAPTURE, localStorageService);

  if (hasSalaryAccess) {
    return true;
  }

  return router.parseUrl('/page-not-found');
};

//   Module-level guard for the entire Daily Planning library
export const dailyPlanningModuleAccessGuard: CanActivateFn = () => {
  const localStorageService = inject(LocalStorageService);
  const tenantConfig = inject(TenantConfigurationService);
  const router = inject(Router);

  const isEditable = tenantConfig.isModuleAccessEditable();        // both keys exist?
  const dailyLicensed = tenantConfig.isDailyPlanningEnabled();     // tenant license

  // If DP not licensed → hard block
  if (!dailyLicensed) {
    return router.parseUrl('/page-not-found');
  }

  // OLD TENANT MODE: no module keys
  //  Daily Planning is never available
  if (!isEditable) {
    return router.parseUrl('/page-not-found');
  }

  // NEW TENANT MODE: use per-user flag + license
  const hasDailyPlanningAccess =
    getBooleanFromStorage(LocalStorageKeys.HAS_DAILY_PLANNING, localStorageService);

  if (hasDailyPlanningAccess) {
    return true;
  }

  return router.parseUrl('/page-not-found');
};