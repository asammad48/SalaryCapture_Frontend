import { Injectable } from "@angular/core";
import { catchError, map, Observable } from "rxjs";
import { ImportApiUrls } from "./imports-api-urls.enum";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { ApiResponse, DeadlineUploadResponseDto } from "core-ui-salary-calculation-library/src/lib/core/domain/models/shared/response.model";
import { LastSync } from "core-ui-salary-calculation-library/src/lib/core/domain/models";
import { OrganizationUnitDeadlinesUrls } from "../../organization-units-deadlines/organization-units-deadlines-web-repository/organization-unit-deadlines-urls.enum";
import { UploadDeadlineRequest } from "core-ui-salary-calculation-library/src/lib/core/domain/requests/upload-deadlineCSV.request";
import { DeadlinesData, UploadedDeadlineResponseDto } from "core-ui-salary-calculation-library/src/lib/core/domain/models/Deadlines/deadlines.model";

@Injectable()
export class ImportService {

  constructor(private http: HttpClient) {
  }

  SyncUsers(): Observable<string> {
    return this.http
      .get(
        `${process.env["NX_BASE_DP_URL"]}${ImportApiUrls.SyncUsers}`, {
          headers: { 'x-loader-key': 'Settings_SyncingTab' }
        }
      )
      .pipe(
        map((data: any) => {
          return data;
        }),
        catchError((err: HttpErrorResponse) => {
          throw err;
        })
      );
  }

  SyncServiceWorkers(): Observable<boolean> {
    return this.http
      .get(
        `${process.env["NX_BASE_DP_URL"]}${ImportApiUrls.SyncServiceWorkers}`, {
          headers: { 'x-loader-key': 'Settings_SyncingTab' }
        }
      )
      .pipe(
        map((data: any) => {
          return data;
        }),
        catchError((err: HttpErrorResponse) => {
          throw err;
        })
      );
  }

  SyncVehicles(): Observable<boolean> {
    return this.http
      .get(
        `${process.env["NX_BASE_DP_URL"]}${ImportApiUrls.SyncVehicles}`, {
          headers: { 'x-loader-key': 'Settings_SyncingTab' }
        }
      )
      .pipe(
        map((data: any) => {
          return data;
        }),
        catchError((err: HttpErrorResponse) => {
          throw err;
        })
      );
  }

  getLastSyncTime(): Observable<ApiResponse<LastSync[]>> {
    return this.http
      .get(
        `${process.env["NX_BASE_DP_URL"]}${ImportApiUrls.GetLastSyncTime}`, {
          headers: { 'x-loader-key': 'Settings_SyncingTab' }
        }
      )
      .pipe(
        map((data: any) => {
          return data;
        }),
        catchError((err: HttpErrorResponse) => {
          throw err;
        })
      );
  }

  getDeadlines(): Observable<ApiResponse<UploadedDeadlineResponseDto[]>> {
    return this.http
      .get(
        `${process.env["NX_BASE_DP_URL"]}${OrganizationUnitDeadlinesUrls.GetDeadlines}`, {
          headers: { 'x-loader-key': 'Settings_DeadlineTab' }
        }
      )
      .pipe(
        map((data: any) => {
          return data;
        }),
        catchError((err: HttpErrorResponse) => {
          throw err;
        })
      );
  }

    getDeadlinesAgainstId(request: string): Observable<ApiResponse<DeadlinesData[]>>{
      return this.http.post(
          `${process.env["NX_BASE_DP_URL"]}${OrganizationUnitDeadlinesUrls.GetDeadlinesAgainstId}`, `"${request}"`, {
          headers: { 'x-loader-key': 'Settings_DeadlineTab' }
        }
        )
        .pipe(
          map((response: any) => {

            return response;
          }),
          catchError((err: HttpErrorResponse) => {
            throw err;
          })
        );
      }

      deleteDeadlinesAgainstId(request: string): Observable<ApiResponse<boolean>>{
        return this.http.post(
            `${process.env["NX_BASE_DP_URL"]}${OrganizationUnitDeadlinesUrls.DeleteDeadlinesAgainstId}`, `"${request}"`, {
          headers: { 'x-loader-key': 'Settings_DeadlineTab' }
        }
          )
          .pipe(
            map((response: any) => {

              return response;
            }),
            catchError((err: HttpErrorResponse) => {
              throw err;
            })
          );
        }


UploadDeadlineCsv(request: UploadDeadlineRequest): Observable<ApiResponse<DeadlineUploadResponseDto>> {

  const formData: FormData = new FormData();
  formData.append('file', request.file);
  formData.append('fileName', request.fileName);

  return this.http.post<ApiResponse<DeadlineUploadResponseDto>>(
      `${process.env["NX_BASE_DP_URL"]}${OrganizationUnitDeadlinesUrls.UploadDeadlineCsv}`,
      formData, {
          headers: { 'x-loader-key': 'Settings_DeadlineTab' }
        }
    )
    .pipe(
      map((response: any) => {
        return response;
      }),
      catchError((err: HttpErrorResponse) => {
        throw err;
      })
    );
}

}
