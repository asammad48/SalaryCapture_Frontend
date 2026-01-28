import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { AccessService } from '../../data/repositories/access/access.service';
import { Permissions } from '../../core/domain/constants/claims.constants';
import { LocalStorageService } from '../../presentation/services/local-storage.service';
import { LocalStorageKeys } from '../../data/repositories/access/local-storage-keys';
import { TenantConfigurationService } from '../services/tenant-configuration.service';

@Injectable()
export class MenuItemService {
  constructor(
    public accessService: AccessService,
    private localStorageService: LocalStorageService,
    private tenantConfig: TenantConfigurationService
  ) { }

  // tenant-wide license flags
  private get isSalaryLicensed(): boolean {
    return false;
  }

  private get isDailyPlanningLicensed(): boolean {
    return this.tenantConfig.isDailyPlanningEnabled();
  }

  private get isNewMode(): boolean {
    return this.tenantConfig.isModuleAccessEditable();
  }

  // combined user+tenant checks
  private get hasSalaryAccess(): boolean {
    return false;
  }

  private get hasDailyPlanningAccess(): boolean {
    // FALLBACK TENANT: DP never visible
    if (!this.isNewMode) {
      return false;
    }

    const raw = this.localStorageService.get(LocalStorageKeys.HAS_DAILY_PLANNING);
    const flag = raw === true || raw === 'true';
    return flag && this.isDailyPlanningLicensed;
  }

  mainMenuItems: MenuItem[] = [
    {
      id: 'base-plan-menu-item',
      icon: 'event-note',
      label: 'Base Plan',
      routerLink: ['/daily-planning/base-plan'],
      visible: true,
    },
    {
      id: 'daily-plan-menu-item',
      icon: 'today',
      label: 'Daily Plan',
      routerLink: ['/daily-planning/daily-plan'],
      visible: true,
    },
    {
      icon: 'manage-accounts',
      label: 'User Management',
      routerLink: ['/user-management'],
      visible: true,
    },
    {
      id: 'settings-menu-item',
      icon: 'settings',
      label: 'Settings',
      routerLink: ['/settings'],
      visible: true,
    }
  ];

  getMainMenu(): Observable<MenuItem[]> {
    return of(this.mainMenuItems.filter((x: any) => x.visible === true));
  }
}
