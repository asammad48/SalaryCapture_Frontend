import { Observable } from "rxjs";
import { User } from "../domain/models/user.model";
import { Role } from "../domain/models/role.model";
import { Area } from "../domain/models/area.model";
import { AreaRole } from "../domain/models/areaRole.model";
import { UserFilterRequest } from "../domain/requests";

export abstract class UsersRepository {
    abstract getUsers(filters: UserFilterRequest): Observable<User[]>

    abstract disableUser(user: User): Observable<string>

    abstract enableUser(user: User): Observable<string>

    abstract getRoles(): Observable<Role[]>

    abstract getAreas(): Observable<Area[]>

    abstract getUserAssignedAreasAndSubAreas(): Observable<Area[]>

    abstract updateUser(user: User): Observable<string>

    abstract deleteUser(userId: string): Observable<string>

    abstract getAreaRole(): Observable<AreaRole[]>
}
