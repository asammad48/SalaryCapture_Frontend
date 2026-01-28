import { User } from '../domain/models/user.model';
import { UserResponseDto } from '../../data/api-clients/admin-api.client';
import { DateTime } from 'luxon';

export class UserMapper {

  static fromDto(dto: UserResponseDto): User {
    return {
      id: dto.id!,
      userId: dto.id!,
      name: dto.name!,
      userName: dto.userName,
      status: dto.status,
      role: dto.role,
      roleId: dto.roleId,
      createdBy: dto.createdBy,

      createdAt: dto.createdAt
        ? DateTime.fromJSDate(dto.createdAt)
        : DateTime.now(),

      areasCount: dto.areasCount ?? 0,

      regionsCount: 0,
      regions: [],

      areas: dto.areas?.map(a => ({
        areaRole: a.areaRole,
        areaName: a.areaName,
        subareaName: a.subareaName,

        subareaId: String(a.subareaId),          // ensure string
        subareaRoleId: String(a.subareaRoleId)  // FIX: convert number → string
      })),

      isActive: dto.isActive ?? false,

      hasSalaryCapture: false,
      hasDailyPlanning: false
    };
  }
}
