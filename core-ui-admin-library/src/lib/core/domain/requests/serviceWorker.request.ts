import { OrderingRequest } from "./shared/ordering.request";
import { PaginatorRequest } from "./shared/paginator.request";

export interface ServiceWorkerRequest{
    pagination?: PaginatorRequest,
    ordering?: OrderingRequest,
    roleId ?: [],
    carrierId?: string,
    organizationUnitId ?: string,
    durationId ?: number,
    salaryCodeId ?: string,
    statusId ?: [],
    startDate ?: string,
    endDate ?: string
}
