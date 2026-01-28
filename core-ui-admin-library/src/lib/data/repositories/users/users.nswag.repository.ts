import { Injectable } from '@angular/core';
import { Client, UserResponseDto, UsersFilterDTO } from '../../api-clients/admin-api.client';
import { UserFilterRequest } from '../../../core/domain/requests';
import { map } from 'rxjs';
import { UserMapper, RoleMapper } from 'core-ui-admin-library/src/lib/core/mappers';


@Injectable({ providedIn: 'root' })
export class UsersNswagRepository {

  constructor(private client: Client) {}

  getUsers(filters: UserFilterRequest) {

    const dto = new UsersFilterDTO();
    dto.init({
      name: filters.name,
      userName: filters.userName,
      status: filters.status,
      roles: filters.roles,
      area: filters.area,
      subArea: filters.subArea,
      createdBy: filters.createdBy,
      createdAt: filters.createdAt
    });

    return this.client.getUsers(dto).pipe(
      map(res => {

        if (!res.success || !res.data) {
          throw new Error(res.message);
        }

        // DTO → Domain mapping
        return res.data.map(dto => UserMapper.fromDto(dto));
      })
    );
  }

  updateUser(user: any) {

    const dto = new UserResponseDto();
    dto.init(user);

    return this.client.updateUser(dto).pipe(
      map(res => {
        if(res.success) return res.data;
        throw new Error(res.message);
      })
    );
  }

  deleteUser(userId: string) {

    return this.client.deleteUser(userId).pipe(
      map(res => {
        if(res.success) return res.data;
        throw new Error(res.message);
      })
    );
  }

  disableUser(user: any) {

    const dto = new UserResponseDto();
    dto.init(user);

    return this.client.disableUser(dto).pipe(
      map(res => {
        if(res.success) return res.data;
        throw new Error(res.message);
      })
    );
  }

  enableUser(user: any) {

    const dto = new UserResponseDto();
    dto.init(user);

    return this.client.enableUser(dto).pipe(
      map(res => {
        if(res.success) return res.data;
        throw new Error(res.message);
      })
    );
  }

  getRoles() {
    return this.client.getRoles().pipe(
      map(res => {
        if (!res.success || !res.data) {
          throw new Error(res.message);
        }

        // MAP DTO → DOMAIN
        return res.data.map(dto => RoleMapper.fromDto(dto));
      })
    );
  }

}
