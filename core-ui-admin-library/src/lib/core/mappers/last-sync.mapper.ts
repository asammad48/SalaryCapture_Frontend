import { LastSync } from '../domain/models';
import { ILastSyncDTO } from '../../data/api-clients/admin-api.client';

export function mapLastSyncDto(dto: ILastSyncDTO): LastSync {
  return {
    importType: dto.importType!,
    syncTime: dto.syncTime ? new Date(dto.syncTime) : undefined,
    count: dto.count ?? 0
  };
}