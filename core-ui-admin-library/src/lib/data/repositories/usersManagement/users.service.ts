import { Injectable } from "@angular/core";
import { Area } from "../../../core/domain/models/area.model";
import { ApiResponse } from "../../../core/domain/models/shared/response.model";
import { Role} from "../../../core/domain/models/role.model";
import { User } from "../../../core/domain/models/user.model";
import { Observable } from "rxjs";
import { AreaRole } from "../../../core/domain/models/areaRole.model";
import { UserFilterRequest } from "../../../core/domain/requests";
import { Client as AdminApiClient, UsersFilterDTO, UserResponseDto } from "../../api-clients/admin-api.client";

@Injectable()
  export class UsersService {
    constructor(private adminApiClient: AdminApiClient) { }

    getUsers(request: UserFilterRequest) : Observable<ApiResponse<User[]>>{
        return this.adminApiClient.getUsers(UsersFilterDTO.fromJS(request)) as any;
    }

    disableUser(user: User) : Observable<ApiResponse<string>>{
      return this.adminApiClient.disableUser(UserResponseDto.fromJS(user)) as any;
    }

    enableUser(user: User) : Observable<ApiResponse<string>>{
      return this.adminApiClient.enableUser(UserResponseDto.fromJS(user)) as any;
    }

    updateUser(user: User) : Observable<ApiResponse<string>>{
      return this.adminApiClient.updateUser(UserResponseDto.fromJS(user)) as any;
    }

    getRoles() : Observable<ApiResponse<Role[]>>{
        return this.adminApiClient.getRoles() as any;
    }

    getAreas() : Observable<ApiResponse<Area[]>>{
      return this.adminApiClient.getUserAssignedAreasAndSubAreas() as any;
    }

    getUserAssignedAreasAndSubAreas() : Observable<ApiResponse<Area[]>>{
      return this.adminApiClient.getUserAssignedAreasAndSubAreas() as any;
    }

    deleteUser(userId: string) : Observable<ApiResponse<string>>{
      return this.adminApiClient.deleteUser(userId) as any;
    }

    getAreaRoles() : Observable<ApiResponse<AreaRole[]>>{
      return this.adminApiClient.getAreaRoles() as any;
    }
  }
