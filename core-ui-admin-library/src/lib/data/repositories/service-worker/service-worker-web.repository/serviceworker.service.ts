import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable } from "rxjs";
import { ApiResponse } from "../../../../core/domain/models/shared/response.model";
import { ServiceWorkerApiUrls } from "./service-workers-api-urls.enum";
import { RegionalWorkerResponse, ServiceWorkersByFilterResponse } from "../../../../core/domain/models/ServiceWorker/service-worker-by-filter-response.model";
import { GetServiceWorkerAgainstSalariesResponse } from "../../../../core/domain/models/ServiceWorker/service-worker-against-salaries-response.model";

interface SalaryCaptureFilterRequest {
  organizationUnitId?: string;
  productionDate?: string;
  serviceProviderId?: string;
}

@Injectable()
export class ServiceWorkerService {

  constructor(private http: HttpClient) {}

  GetServiceWorkersAgainstSalaries(request: SalaryCaptureFilterRequest): Observable<ApiResponse<GetServiceWorkerAgainstSalariesResponse[]>> {
    return this.http.post<ApiResponse<GetServiceWorkerAgainstSalariesResponse[]>>(`${process.env["NX_BASE_DPS_URL"]}/api${ServiceWorkerApiUrls.GetServiceWorkersAgainstSalaries}`, request, {
          headers: { 'x-loader-key': 'SalaryCapture_LineWorkers' }
        })
    .pipe(
      map((response: ApiResponse<GetServiceWorkerAgainstSalariesResponse[]>) => response),
      catchError((err: HttpErrorResponse) => {
        throw err;
      })
    );
  }

  getAreaWorkers(request: SalaryCaptureFilterRequest): Observable<ApiResponse<ServiceWorkersByFilterResponse[]>> {
    return this.http.post<ApiResponse<ServiceWorkersByFilterResponse[]>>(`${process.env["NX_BASE_DPS_URL"]}/api${ServiceWorkerApiUrls.GetServiceWorkersByFilter}`, request)
    .pipe(
      map((response: ApiResponse<ServiceWorkersByFilterResponse[]>) => response),
      catchError((err: HttpErrorResponse) => {
        throw err;
      })
    );
  }

  getRegionalWorkers(request: SalaryCaptureFilterRequest): Observable<ApiResponse<RegionalWorkerResponse[]>> {
    return this.http.post<ApiResponse<RegionalWorkerResponse[]>>(`${process.env["NX_BASE_DPS_URL"]}/api${ServiceWorkerApiUrls.GetRegionalWorkers}`, request)
    .pipe(
      map((response: ApiResponse<RegionalWorkerResponse[]>) => response),
      catchError((err: HttpErrorResponse) => {
        throw err;
      })
    );
  }

}
