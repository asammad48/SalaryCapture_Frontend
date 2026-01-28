import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { LocalStorageKeys } from '../../data/repositories/access/local-storage-keys';
import { TenantConfigDefaults, TenantConfigKey, TenantConfigKeys, TenantFrontEndConfigs } from '../../core/domain/models/shared/tenant-frontend-configs.model';
type TenantConfigs = Record<string, string>;

@Injectable({ providedIn: 'root' })
export class TenantConfigurationService {

  private _calendarMovementInterval$ = new BehaviorSubject<number>(TenantConfigDefaults.CALENDAR_MOVEMENT_INTERVAL);
  private _salaryLineAccordionPageSize$ = new BehaviorSubject<number>(TenantConfigDefaults.SALARY_LINE_ACCORDION_PAGE_SIZE);
  private _salaryLineGridPageSize$ = new BehaviorSubject<number>(TenantConfigDefaults.SALARY_LINE_GRID_PAGE_SIZE);
  private configMap = {
    [TenantConfigKeys.CALENDAR_MOVEMENT_INTERVAL]: {
      subject: this._calendarMovementInterval$,
      defaultValue: TenantConfigDefaults.CALENDAR_MOVEMENT_INTERVAL
    },
    [TenantConfigKeys.SALARY_LINE_ACCORDION_PAGE_SIZE]: {
      subject: this._salaryLineAccordionPageSize$,
      defaultValue: TenantConfigDefaults.SALARY_LINE_ACCORDION_PAGE_SIZE
    },
    [TenantConfigKeys.SALARY_LINE_GRID_PAGE_SIZE]: {
      subject: this._salaryLineGridPageSize$,
      defaultValue: TenantConfigDefaults.SALARY_LINE_GRID_PAGE_SIZE
    }
  };
  constructor(private localStorage: LocalStorageService) {
    this.loadConfigsFromLocalStorage();
  }

  private loadConfigsFromLocalStorage(): void {

    const configsJson = this.localStorage.get<string>(LocalStorageKeys.TENANT_FRONTEND_CONFIGS);

    if (configsJson) {

      try {
        const configs: TenantFrontEndConfigs = JSON.parse(configsJson);
        this.applyConfigs(configs);

      } catch (error) {
        console.error('Error parsing tenant frontend configs:', error);
      }

    }
  }

  private applyConfigs(configs: TenantFrontEndConfigs): void {

    Object.entries(this.configMap).forEach(([key, config]) => {

      const value = configs[key as TenantConfigKey];

      if (value) {
        config.subject.next(Number(value));
      }

    });

  }

  public saveTenantConfigs(configs: TenantFrontEndConfigs): void {
    const existing = this.getConfigs();
    const merged = { ...existing, ...configs };
    this.localStorage.add(
      LocalStorageKeys.TENANT_FRONTEND_CONFIGS,
      JSON.stringify(merged)
    );
    this.applyConfigs(merged);
  }

  // Timeline Slot Interval

  get calendarMovementInterval$(): Observable<number> {
    return this._calendarMovementInterval$.asObservable();
  }

  get calendarMovementInterval(): number {
    return this._calendarMovementInterval$.value;
  }

  setCalendarMovementInterval(value: number): void {
    this._calendarMovementInterval$.next(value);
    this.updateConfigInStorage(TenantConfigKeys.CALENDAR_MOVEMENT_INTERVAL, value.toString());
  }

  // Salary Line Accordion Page Size

  get salaryLineAccordionPageSize$(): Observable<number> {
    return this._salaryLineAccordionPageSize$.asObservable();
  }

  get salaryLineAccordionPageSize(): number {
    return this._salaryLineAccordionPageSize$.value;
  }

  setSalaryLineAccordionPageSize(value: number): void {
    this._salaryLineAccordionPageSize$.next(value);
    this.updateConfigInStorage(TenantConfigKeys.SALARY_LINE_ACCORDION_PAGE_SIZE, value.toString());
  }

  // Salary Line Grid Page Size

  get salaryLineGridPageSize$(): Observable<number> {
    return this._salaryLineGridPageSize$.asObservable();
  }

  get salaryLineGridPageSize(): number {
    return this._salaryLineGridPageSize$.value;
  }

  setSalaryLineGridPageSize(value: number): void {
    this._salaryLineGridPageSize$.next(value);
    this.updateConfigInStorage(TenantConfigKeys.SALARY_LINE_GRID_PAGE_SIZE, value.toString());
  }

  // Helper and Generic Methods

  private updateConfigInStorage(key: TenantConfigKey, value: string): void {

    const configsJson = this.localStorage.get<string>(LocalStorageKeys.TENANT_FRONTEND_CONFIGS);

    let configs: TenantFrontEndConfigs = {};

    if (configsJson) {

      try {
        configs = JSON.parse(configsJson);

      } catch (error) {
        console.error('Error parsing configs:', error);
      }

    }
    configs[key] = value;
    this.localStorage.add(LocalStorageKeys.TENANT_FRONTEND_CONFIGS, JSON.stringify(configs));
  }

  public getAllConfigs(): TenantFrontEndConfigs | null {

    const configsJson = this.localStorage.get<string>(LocalStorageKeys.TENANT_FRONTEND_CONFIGS);

    if (configsJson) {

      try {
        return JSON.parse(configsJson);

      } catch (error) {
        console.error('Error parsing configs:', error);
        return null;
      }

    }

    return null;
  }

  public clearConfigs(): void {

    this.localStorage.remove(LocalStorageKeys.TENANT_FRONTEND_CONFIGS);

    Object.values(this.configMap).forEach(config => {
      config.subject.next(config.defaultValue);
    });

  }

  public getConfigValue(key: TenantConfigKey): number {
    const config = this.configMap[key];
    return config ? config.subject.value : 0;
  }

  public setConfigValue(key: TenantConfigKey, value: number): void {
    const config = this.configMap[key];
    if (config) {
      config.subject.next(value);
      this.updateConfigInStorage(key, value.toString());
    }
  } private configs: TenantConfigs = {};

  private getConfigs(): TenantConfigs {
    const raw = this.localStorage.get<string>(LocalStorageKeys.TENANT_FRONTEND_CONFIGS);
    this.configs = raw ? JSON.parse(raw) : {};
    return this.configs;
  }

  /**
   * Dual-module mode:
   * Only when BOTH flags exist and are "true":
   *   SalaryCapture: "true"
   *   DailyPlanning: "true"
   */
  private isDualModuleMode(): boolean {
    const cfg = this.getConfigs();
    return cfg['SalaryCapture'] === 'true' && cfg['DailyPlanning'] === 'true';
  }

  /** Is the module access section even configurable per user in the UI? */
  isModuleAccessEditable(): boolean {
    // New requirement: per-user toggling ONLY when both modules are true at tenant level
    return this.isDualModuleMode();
  }

  /** Can we toggle SalaryCapture per user? */
  isSalaryAccessEditable(): boolean {
    return this.isDualModuleMode();
  }

  /** Can we toggle DailyPlanning per user? */
  isDailyPlanningAccessEditable(): boolean {
    return this.isDualModuleMode();
  }

  /** Is SalaryCapture licensed at all for this tenant? */
  isSalaryCaptureEnabled(): boolean {
    // New rule: for all tenants, Salary module exists.
    // "SalaryCapture"/"DailyPlanning" is only about dual-module & per-user toggling.
    return true;
  }

  /** Is DailyPlanning licensed at all for this tenant? */
  isDailyPlanningEnabled(): boolean {
    // Only in dual-module mode do we even offer Daily Planning.
    return this.isDualModuleMode();
  }
}