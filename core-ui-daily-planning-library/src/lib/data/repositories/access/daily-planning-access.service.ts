import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Area } from '../../../core/domain/models/area.model';
import { LocalStorageService } from '../../../presentation/services/local-storage.service';
import { Client as AdminApiClient } from '../../api-clients';
import { LocalStorageKeys } from './local-storage-keys';

@Injectable({
  providedIn: 'root'
})
export class DailyPlanningAccessService {
  private claims: string[] = [];

  constructor(
    private adminApiClient: AdminApiClient,
    private localStorage: LocalStorageService
  ) {
    this.loadClaims();
  }

  private loadClaims(): void {
    const storedClaims = this.localStorage.get<string[]>(LocalStorageKeys.ROLE_CLAIMS);
    this.claims = storedClaims || [];
  }

  refreshClaims(): void {
    this.loadClaims();
  }

  getRoleClaims(): Observable<any> {
    return this.adminApiClient.getRoleClaims();
  }

  hasPermission(userClaim: string): boolean {
    const roleClaims = this.localStorage.get<string[]>(LocalStorageKeys.ROLE_CLAIMS) || [];
    return roleClaims.includes(userClaim);
  }

  getToken(): string | null {
    return this.localStorage.get<string>(LocalStorageKeys.ACCESS_TOKEN) || null;
  }

  getRole(): string | null {
    return this.localStorage.get<string>(LocalStorageKeys.ROLE);
  }

  getTenantId(): string {
    return this.localStorage.get<string>(LocalStorageKeys.TENANT_ID) ?? '';
  }

  getServiceProviderId(): string {
    return this.localStorage.get<string>(LocalStorageKeys.SERVICE_PROVIDER_ID) ?? '';
  }

  getUserRegionsFromLocalStorage(): Area[] {
    return this.localStorage.get<Area[]>(LocalStorageKeys.USER_REGIONS) || [];
  }

  fetchAndSaveUserRegions(): Observable<Area[]> {
    return this.adminApiClient.getUserAssignedAreasAndSubAreas().pipe(
      map((response: any) => response?.data || []),
      tap((regions) => {
        this.localStorage.add(LocalStorageKeys.USER_REGIONS, regions);
      })
    );
  }

  getUserRegions(): Observable<Area[]> {
    const cachedRegions = this.getUserRegionsFromLocalStorage();
    return of(cachedRegions.length > 0 ? cachedRegions : []);
  }

  clearUserRegions(): void {
    this.localStorage.remove(LocalStorageKeys.USER_REGIONS);
  }
}
