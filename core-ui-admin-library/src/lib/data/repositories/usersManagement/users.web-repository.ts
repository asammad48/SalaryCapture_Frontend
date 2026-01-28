import { Injectable } from "@angular/core";
import { User } from "core-ui-admin-library/src/lib/core/domain/models/user.model";
import { UsersRepository } from "core-ui-admin-library/src/lib/core/repositories/users.repository";
import { Observable, map } from "rxjs";
import { UsersService } from "./users.service";
import { Role } from "core-ui-admin-library/src/lib/core/domain/models/role.model";
import { Area } from "core-ui-admin-library/src/lib/core/domain/models/area.model";
import { AreaRole } from "core-ui-admin-library/src/lib/core/domain/models/areaRole.model";
import { UserFilterRequest } from "core-ui-admin-library/src/lib/core/domain/requests";

@Injectable()
export class UsersWebRepository extends UsersRepository{

    constructor(private userService: UsersService){
        super()
    }

    getUsers(filters: UserFilterRequest): Observable<User[]> {
        return this.userService.getUsers(filters).pipe(map(
            response => {
                if (response.success) {
                    return response.data
                }
                else
                    throw new Error("An error has occurred")
            }
        ))
    }

    disableUser(user: User): Observable<string> {
        return this.userService.disableUser(user).pipe(map(
            response => {
                if (response.success) {
                    return response.data
                }
                else
                    throw new Error("An error has occurred")
            }
        ))
    }

    enableUser(user: User): Observable<string> {
        return this.userService.enableUser(user).pipe(map(
            response => {
                if (response.success) {
                    return response.data
                }
                else
                    throw new Error("An error has occurred")
            }
        ))
    }

    getRoles(): Observable<Role[]> {
        return this.userService.getRoles().pipe(map(
            response => {
                if (response.success) {
                    return response.data
                }
                else
                    throw new Error("An error has occurred")
            }
        ))
    }

    getAreas(): Observable<Area[]>{
        return this.userService.getAreas().pipe(map(
            response => {
                if (response.success) {
                    return response.data
                }
                else
                    throw new Error("An error has occurred")
            }
        ))
    }

    getUserAssignedAreasAndSubAreas(): Observable<Area[]>{
      return this.userService.getUserAssignedAreasAndSubAreas().pipe(map(
          response => {
              if (response.success) {
                  return response.data
              }
              else
                  throw new Error("An error has occurred")
          }
      ))
  }

    updateUser(user: User): Observable<string> {
        return this.userService.updateUser(user).pipe(map(
            response => {
                if (response.success) {
                    return response.data
                }
                else
                    throw new Error("An error has occurred")
            }
        ))
    }

    deleteUser(userId: string): Observable<string> {
        return this.userService.deleteUser(userId).pipe(map(
            response => {
                if (response.success) {
                    return response.data
                }
                else
                    throw new Error("An error has occurred")
            }
        ))
    }

    getAreaRole(): Observable<AreaRole[]> {
        return this.userService.getAreaRoles().pipe(map(
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
