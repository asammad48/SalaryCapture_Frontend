import { OrderingRequest } from "./shared/ordering.request";
import { PaginatorRequest } from "./shared/paginator.request";

export interface SalaryLineRequest {
    paginator: PaginatorRequest,
    ordering: OrderingRequest,
    salaryId: string,
    organizationUnitId ?: string,
    durationId ?: number,
    linetypeId ?: string,
    statusId ?: [],
    startDate ?: string,
    endDate ?: string
}
