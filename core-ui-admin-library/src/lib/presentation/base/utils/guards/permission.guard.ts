import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Permissions, PermissionsType } from 'core-ui-admin-library/src/lib/core/domain/constants/claims.constants';
import { AccessService } from 'core-ui-admin-library/src/lib/data/repositories/access/access.service';
import { LocalStorageService } from '../../../services';
import { LocalStorageKeys } from 'core-ui-admin-library/src/lib/data/repositories/access/local-storage-keys';
import { TenantConfigurationService } from '../../../services/tenant-configuration.service';

export const permissionGuard = (permission: PermissionsType): CanActivateFn => {
  return (route, state): boolean | UrlTree => {
    const accessService = inject(AccessService);
    const router = inject(Router);

    console.log(`PermissionGuard checking for: ${permission} on route: ${state.url}`);
    if (accessService.hasPermission(permission)) {
      console.log(`PermissionGuard: Permission ${permission} granted`);
      return true;
    }

    console.log(`PermissionGuard: Permission ${permission} denied`);
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
export const salaryModuleAccessGuard: CanActivateFn = (route, state) => {
  const localStorageService = inject(LocalStorageService);
  const tenantConfig = inject(TenantConfigurationService);
  const router = inject(Router);

  const isEditable = tenantConfig.isModuleAccessEditable();      // both keys exist?
  const salaryLicensed = tenantConfig.isSalaryCaptureEnabled();  // tenant license

  console.log('SalaryModuleAccessGuard checking route:', state.url);
  console.log('Salary Licensed:', salaryLicensed);
  console.log('Module Access Editable:', isEditable);

  // If salary not licensed at all → hard block
  if (!salaryLicensed) {
    console.log('SalaryModuleAccessGuard: Not licensed');
    return router.parseUrl('/page-not-found');
  }

  // OLD TENANT MODE: no SalaryCapture/DailyPlanning keys
  // -> salary is always allowed if licensed
  if (!isEditable) {
    console.log('SalaryModuleAccessGuard: Old tenant mode, access granted');
    return true;
  }

  // NEW TENANT MODE: use per-user flag + license
  const hasSalaryAccess =
    getBooleanFromStorage(LocalStorageKeys.HAS_SALARY_CAPTURE, localStorageService);

  console.log('Has Salary Access Flag:', hasSalaryAccess);

  if (hasSalaryAccess) {
    console.log('SalaryModuleAccessGuard: Access granted');
    return true;
  }

  console.log('SalaryModuleAccessGuard: Access denied');
  return router.parseUrl('/page-not-found');
};

//   Module-level guard for the entire Daily Planning library
export const dailyPlanningModuleAccessGuard: CanActivateFn = (route, state) => {
  const localStorageService = inject(LocalStorageService);
  const tenantConfig = inject(TenantConfigurationService);
  const router = inject(Router);

  const isEditable = tenantConfig.isModuleAccessEditable();        // both keys exist?
  const dailyLicensed = tenantConfig.isDailyPlanningEnabled();     // tenant license

  console.log('DailyPlanningModuleAccessGuard checking route:', state.url);
  console.log('Daily Planning Licensed:', dailyLicensed);
  console.log('Module Access Editable:', isEditable);

  // If DP not licensed → hard block
  if (!dailyLicensed) {
    console.log('DailyPlanningModuleAccessGuard: Not licensed');
    return router.parseUrl('/page-not-found');
  }

  // OLD TENANT MODE: no module keys
  //  Daily Planning is never available
  if (!isEditable) {
    console.log('DailyPlanningModuleAccessGuard: Old tenant mode, access denied');
    return router.parseUrl('/page-not-found');
  }

  // NEW TENANT MODE: use per-user flag + license
  const hasDailyPlanningAccess =
    getBooleanFromStorage(LocalStorageKeys.HAS_DAILY_PLANNING, localStorageService);

  console.log('Has Daily Planning Access Flag:', hasDailyPlanningAccess);

  if (hasDailyPlanningAccess) {
    console.log('DailyPlanningModuleAccessGuard: Access granted');
    return true;
  }

  console.log('DailyPlanningModuleAccessGuard: Access denied');
  return router.parseUrl('/page-not-found');
};