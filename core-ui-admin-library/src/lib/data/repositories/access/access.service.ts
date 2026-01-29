import { Injectable, Inject, Optional } from "@angular/core";
import { Client as AdminApiClient, API_BASE_URL } from "../../api-clients/admin-api.client";
import { CurrentUserAreaRoles } from "core-ui-admin-library/src/lib/core/domain/models/Access/CurrentUserAreaRoles.model";
import { ApiResponse } from "core-ui-admin-library/src/lib/core/domain/models/shared/response.model";
import { BehaviorSubject, Observable, of } from "rxjs";
import { map, tap } from "rxjs/operators";
import { LocalStorageService } from "core-ui-admin-library/src/lib/presentation/services/local-storage.service";
import { PermissionsType } from "core-ui-admin-library/src/lib/core/domain/constants/claims.constants";
import { LocalStorageKeys } from "./local-storage-keys";
import { TenantConfigurationService } from "core-ui-admin-library/src/lib/presentation/services/tenant-configuration.service";
import { Area } from "core-ui-admin-library/src/lib/core/domain/models/area.model";

@Injectable({
  providedIn: 'root'
})
export class AccessService {
  private claims: string[] = [];

  constructor(
    private adminApiClient: AdminApiClient,
    private localStorage: LocalStorageService,
    private tenantConfig: TenantConfigurationService
  ) {
    this.loadClaims();
  }

  private loadClaims(): void {
    const storedClaims = this.localStorage.get<string[]>(LocalStorageKeys.ROLE_CLAIMS);
    this.claims = storedClaims || [];
  }

  public refreshClaims(): void {
    this.loadClaims();
  }

  getUserAreaAccess(request: string): Observable<boolean> {
    const roles = ["Admin", "Approval", "SuperAdmin"];
    return new BehaviorSubject<boolean>(roles.includes(request));
  }

  getUserAreasRoles(userId: string): Observable<ApiResponse<CurrentUserAreaRoles[]>> {
    return this.adminApiClient.getCurrentUserAreasRoles(userId) as any;
  }

  getCurrentUserSelectedRegionAccess(regionId: string): Observable<ApiResponse<boolean>> {
    return this.adminApiClient.getCurrentUserSelectedRegionAccess(regionId) as any;
  }

  getRoleClaims(): Observable<ApiResponse<string[]>> {
    return this.adminApiClient.getRoleClaims() as any;
  }

  hasPermission(userClaim: PermissionsType): boolean {
    const roleClaims = this.localStorage.get<PermissionsType[]>(LocalStorageKeys.ROLE_CLAIMS) || [];
    return roleClaims.includes(userClaim);
  }

  getToken(): string | null {
    return this.localStorage.get<string>(LocalStorageKeys.ACCESS_TOKEN) || null;
  }

  getRole(): string | null {
    return this.localStorage.get<string>(LocalStorageKeys.ROLE);
  }

  GetTenantId(): string {
    return this.localStorage.get<string>(LocalStorageKeys.TENANT_ID) ?? '';
  }

  GetServiceProviderId(): string {
    return this.localStorage.get<string>(LocalStorageKeys.SERVICE_PROVIDER_ID) ?? '';
  }

  logout(): void {
    this.localStorage.remove(...Object.values(LocalStorageKeys));
    this.tenantConfig.clearConfigs();
  }

  getUserRegionsFromLocalStorage(): Area[] {
    return this.localStorage.get<Area[]>(LocalStorageKeys.USER_REGIONS) || [];
  }

  fetchAndSaveUserRegions(): Observable<Area[]> {
    return (this.adminApiClient.getUserAssignedAreasAndSubAreas() as any).pipe(
      map((response: any) => response?.data || []),
      tap((regions: any) => {
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
