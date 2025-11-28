import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Area } from "../../../core/domain/models/area.model";
import { ApiResponse } from "../../../core/domain/models/shared/response.model";
import { Role} from "../../../core/domain/models/role.model";
import { User } from "../../../core/domain/models/user.model";
import { Observable } from "rxjs";
import { UsersApiUrls } from "./users-api-urls.enum";
import { AreaRole } from "../../../core/domain/models/areaRole.model";
import { UserFilterRequest } from "../../../core/domain/requests";

@Injectable()
  export class UsersService {
    constructor(private http: HttpClient) { }

    getUsers(request: UserFilterRequest) : Observable<ApiResponse<User[]>>{
        return this.http.post<ApiResponse<User[]>>(`${process.env["NX_BASE_DP_URL"]}${UsersApiUrls.GetUsers}`, request, {
          headers: { 'x-loader-key': 'UserMgt_ViewUsers' }
        });
    }

    disableUser(user: User) : Observable<ApiResponse<string>>{
      return this.http.put<ApiResponse<string>>(`${process.env["NX_BASE_DP_URL"]}${UsersApiUrls.DisableUser}`, user, {
          headers: { 'x-loader-key': 'UserMgt_ViewUsers' }
        })
    }

    enableUser(user: User) : Observable<ApiResponse<string>>{
      return this.http.put<ApiResponse<string>>(`${process.env["NX_BASE_DP_URL"]}${UsersApiUrls.EnableUser}`, user, {
          headers: { 'x-loader-key': 'UserMgt_ViewUsers' }
        })
    }

    updateUser(user: User) : Observable<ApiResponse<string>>{
      return this.http.put<ApiResponse<string>>(`${process.env["NX_BASE_DP_URL"]}${UsersApiUrls.UpdateUser}`, user, {
          headers: { 'x-loader-key': 'UserMgt_AddUsers' }
        })
    }

    getRoles() : Observable<ApiResponse<Role[]>>{
        return this.http.get<ApiResponse<Role[]>>(`${process.env["NX_BASE_DP_URL"]}${UsersApiUrls.GetRoles}`)
    }

    getAreas() : Observable<ApiResponse<Area[]>>{
      return this.http.get<ApiResponse<Area[]>>(`${process.env["NX_BASE_DP_URL"]}${UsersApiUrls.GetAreas}`, {
          headers: { 'x-loader-key': 'UserMgt_AddUsers' }
        })
    }

    getUserAssignedAreasAndSubAreas() : Observable<ApiResponse<Area[]>>{
      return this.http.get<ApiResponse<Area[]>>(`${process.env["NX_BASE_DP_URL"]}${UsersApiUrls.GetUserAssignedAreasAndSubAreas}`, {
          headers: { 'x-loader-key': 'UserMgt_AddUsers' }
        })
    }

    deleteUser(userId: string) : Observable<ApiResponse<string>>{
      return this.http.delete<ApiResponse<string>>(`${process.env["NX_BASE_DP_URL"]}${UsersApiUrls.DeleteUser}/${userId}`, {
          headers: { 'x-loader-key': 'UserMgt_ViewUsers' }
        })
    }

    getAreaRoles() : Observable<ApiResponse<AreaRole[]>>{
      return this.http.get<ApiResponse<AreaRole[]>>(`${process.env["NX_BASE_DP_URL"]}${UsersApiUrls.GetAreaRoles}`, {
          headers: { 'x-loader-key': 'UserMgt_AddUsers' }
        })
    }
  }
