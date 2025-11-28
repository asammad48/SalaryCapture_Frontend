import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { AccessService } from "./access.service";
import { AccessRepository } from "core-ui-salary-calculation-library/src/lib/core/repositories/access.repository";
import { CurrentUserAreaRoles } from "core-ui-salary-calculation-library/src/lib/core/domain/models/Access/CurrentUserAreaRoles.model";

@Injectable()
export class AccessWebRepository extends AccessRepository{
    constructor(private accessService: AccessService){
        super();
    }

    checkUserAreaAccess(request: string): Observable<boolean> {
        return this.accessService.getUserAreaAccess(request).pipe(map(
            response => {
                return response
            }
        ))
    }

    getUserAreasRoles(userId: string): Observable<CurrentUserAreaRoles[]> {
        return this.accessService.getUserAreasRoles(userId).pipe(map(
            response => {
                if (response.success) {
                    return response.data
                }
                else
                    throw new Error("An error has occurred")
            }
        ))
    }

    getCurrentUserSelectedRegionAccess(regionId: string): Observable<boolean> {
      return this.accessService.getCurrentUserSelectedRegionAccess(regionId).pipe(map(
          response => {
              if (response.success) {
                  return response.data
              }
              else
                  throw new Error("An error has occurred")
          }
      ))
  }

    getRoleClaims(): Observable<string[]> {
      return this.accessService.getRoleClaims().pipe(map(
          response => {
              if (response.success) {
                  return response.data
              }
              else
                  throw new Error("An error has occurred")
          }
      ))
  }
}
