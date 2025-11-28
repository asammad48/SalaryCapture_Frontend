import { Observable } from "rxjs";
import { CurrentUserAreaRoles } from "../domain/models/Access/CurrentUserAreaRoles.model";

export abstract class AccessRepository{
    abstract checkUserAreaAccess(request: string) : Observable<boolean>
    abstract getUserAreasRoles(userId: string) : Observable<CurrentUserAreaRoles[]>
    abstract getCurrentUserSelectedRegionAccess(regionId: string) : Observable<boolean>
    abstract getRoleClaims() : Observable<string[]>
}
