import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiResponse } from "../../../../core/domain/models/shared/response.model";
import { RegionalWorkerResponse, ServiceWorkersByFilterResponse } from "../../../../core/domain/models/ServiceWorker/service-worker-by-filter-response.model";
import { GetServiceWorkerAgainstSalariesResponse } from "../../../../core/domain/models/ServiceWorker/service-worker-against-salaries-response.model";
import { Client as AdminApiClient } from "../../../api-clients/admin-api.client";

@Injectable({ providedIn: 'root' })
export class ServiceWorkerService {

  constructor(private adminApiClient: AdminApiClient) {}

  GetServiceWorkersAgainstSalaries(request: any): Observable<ApiResponse<GetServiceWorkerAgainstSalariesResponse[]>> {
    return this.adminApiClient.getServiceWorkers(request) as any;
  }

  getAreaWorkers(request: any): Observable<ApiResponse<ServiceWorkersByFilterResponse[]>> {
    return this.adminApiClient.getServiceWorkers(request) as any;
  }

  getRegionalWorkers(request: any): Observable<ApiResponse<RegionalWorkerResponse[]>> {
    return this.adminApiClient.getServiceWorkers(request) as any;
  }

}
