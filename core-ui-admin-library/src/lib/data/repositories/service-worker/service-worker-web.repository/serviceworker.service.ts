import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiResponse } from "../../../../core/domain/models/shared/response.model";
import { RegionalWorkerResponse, ServiceWorkersByFilterResponse } from "../../../../core/domain/models/ServiceWorker/service-worker-by-filter-response.model";
import { GetServiceWorkerAgainstSalariesResponse } from "../../../../core/domain/models/ServiceWorker/service-worker-against-salaries-response.model";
import { Client as AdminApiClient, SalaryCaptureFilterRequestDTO } from "../../../api-clients/admin-api.client";

interface SalaryCaptureFilterRequest {
  organizationUnitId?: string;
  productionDate?: string;
  serviceProviderId?: string;
}

@Injectable({ providedIn: 'root' })
export class ServiceWorkerService {

  constructor(private adminApiClient: AdminApiClient) {}

  GetServiceWorkersAgainstSalaries(request: SalaryCaptureFilterRequest): Observable<ApiResponse<GetServiceWorkerAgainstSalariesResponse[]>> {
    return this.adminApiClient.getServiceWorkersAgainstSalaries(SalaryCaptureFilterRequestDTO.fromJS(request)) as any;
  }

  getAreaWorkers(request: SalaryCaptureFilterRequest): Observable<ApiResponse<ServiceWorkersByFilterResponse[]>> {
    return this.adminApiClient.getServiceWorkersByFilter(SalaryCaptureFilterRequestDTO.fromJS(request)) as any;
  }

  getRegionalWorkers(request: SalaryCaptureFilterRequest): Observable<ApiResponse<RegionalWorkerResponse[]>> {
    return this.adminApiClient.getRegionalWorkers(SalaryCaptureFilterRequestDTO.fromJS(request)) as any;
  }

}
