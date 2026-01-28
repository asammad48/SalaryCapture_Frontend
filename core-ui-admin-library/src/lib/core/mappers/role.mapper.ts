import { Role } from '../domain/models/role.model';

export class RoleMapper {

  static fromDto(dto: any): Role {
    return {
      roleId: dto.id ?? dto.roleId,
      roleName: dto.roleName,
      displayName: dto.displayName
    };
  }
}
