import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiResponse, DeadlineUploadResponseDto } from "core-ui-admin-library/src/lib/core/domain/models/shared/response.model";
import { LastSync } from "core-ui-admin-library/src/lib/core/domain/models";
import { UploadDeadlineRequest } from "core-ui-admin-library/src/lib/core/domain/requests/upload-deadlineCSV.request";
import { DeadlinesData, UploadedDeadlineResponseDto } from "core-ui-admin-library/src/lib/core/domain/models/Deadlines/deadlines.model";
import { Client as AdminApiClient } from "../../../api-clients/admin-api.client";

@Injectable({ providedIn: 'root' })
export class ImportService {

  constructor(private adminApiClient: AdminApiClient) {
  }

  SyncUsers(): Observable<ApiResponse<boolean>> {
    return this.adminApiClient.syncUsers() as any;
  }

  SyncServiceWorkers(): Observable<ApiResponse<boolean>> {
    return this.adminApiClient.syncServiceWorkers() as any;
  }

  SyncVehicles(): Observable<ApiResponse<boolean>> {
    return this.adminApiClient.syncVehicles() as any;
  }

  getLastSyncTime(): Observable<ApiResponse<LastSync[]>> {
    return this.adminApiClient.getLastSyncTime() as any;
  }

  getDeadlines(): Observable<ApiResponse<UploadedDeadlineResponseDto[]>> {
    return new Observable();
  }

  getDeadlinesAgainstId(request: string): Observable<ApiResponse<DeadlinesData[]>> {
    return new Observable();
  }

  deleteDeadlinesAgainstId(request: string): Observable<ApiResponse<boolean>> {
    return new Observable();
  }

  UploadDeadlineCsv(request: UploadDeadlineRequest): Observable<ApiResponse<DeadlineUploadResponseDto>> {
    return new Observable();
  }

}
