import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, map } from "rxjs";
import { SalaryLineApiUrls } from "./salary-line-web.repository/salary-line-api-urls.enum";
import { SalaryLineDuration } from "../../../core/domain/models";
import { ApiResponse } from "../../../core/domain/models/shared/response.model";
import { AddEditSalaryLineDto } from "../../../core/domain/requests";
import { CalculateRouteRequest } from "../../../core/domain/models/Salary/salaryline.model";
import { CalculateRouteModel } from "../../../core/domain/models/SalaryLine/calculate-route.model";
import { SalaryCode } from "core-ui-salary-calculation-library/src/lib/core/domain/models/SalaryLine/salary-code.model";
import { VehicleTypeOption } from "core-ui-salary-calculation-library/src/lib/core/domain/models/SalaryLine/vehicle-type.model";
import { SalaryLineActionsRequest } from "core-ui-salary-calculation-library/src/lib/core/domain/models/SalaryLine/SalaryLineRequest.model";
import { AddSalaryLineResponse } from "core-ui-salary-calculation-library/src/lib/core/domain/models/responses/salary-line-add-response";
import { UpdateSalaryLineRequest } from "core-ui-salary-calculation-library/src/lib/core/domain/requests/update-salaryLine.request";
import { UpdateSalaryLineResponse } from "core-ui-salary-calculation-library/src/lib/core/domain/models/responses/update-salary-line-response";
import { SalaryLineActionsResponse } from "core-ui-salary-calculation-library/src/lib/core/domain/models/responses/salary-line-actions-response";

@Injectable({ providedIn: "root" })
export class SalaryLineService {

    constructor(private http: HttpClient) {}

    getDurations(): Observable<SalaryLineDuration[]>{
      return this.http.get(
          `${process.env["NX_BASE_DP_URL"]}${SalaryLineApiUrls.GetDurations}`
        )
        .pipe(
          map((response: any) => {
            return response.data;
          }),
          catchError((err: HttpErrorResponse) => {
            throw err;
          })
        );
    }

    addSalaryLine(request: AddEditSalaryLineDto): Observable<ApiResponse<AddSalaryLineResponse>> {

      return this.http.post<ApiResponse<AddEditSalaryLineDto>>(`${process.env["NX_BASE_DP_URL"]}${SalaryLineApiUrls.AddSalaryLine}`,request, {
          headers: { 'x-loader-key': 'SalaryCapture_AddSalaryLine' }
        })

      .pipe(

        map((response: any) => {
          return response;
        }),

        catchError((err: HttpErrorResponse) => {
          throw err;
        })

      );
    }

    updateSalaryLine(request: AddEditSalaryLineDto): Observable<ApiResponse<UpdateSalaryLineResponse>> {

      return this.http.put<ApiResponse<AddEditSalaryLineDto>>(`${process.env["NX_BASE_DP_URL"]}${SalaryLineApiUrls.UpdateSalaryLine}`,request, {
          headers: { 'x-loader-key': 'SalaryCapture_UpdateSalaryLine' }
        })

      .pipe(

        map((response: any) => {
          return response;
        }),

        catchError((err: HttpErrorResponse) => {
          throw err;
        })

      );

    }

    calculateRoute(request: CalculateRouteRequest): Observable<ApiResponse<CalculateRouteModel>> {
      return this.http.post<ApiResponse<CalculateRouteModel>>(
        `${process.env["NX_BASE_DP_URL"]}${SalaryLineApiUrls.CalculateRoute}`,
        request, {
          headers: { 'x-loader-key': 'SalaryCapture_AddSalaryLine' }
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

    getSalaryCodes(tenantId: string): Observable<ApiResponse<SalaryCode[]>> {

        return this.http.get<ApiResponse<SalaryCode[]>>(`${process.env["NX_BASE_DP_URL"]}${SalaryLineApiUrls.GetSalaryCodes}?tenantId=${tenantId}`)

        .pipe(

          map((response: any) => {
            return response;
          }),

          catchError((err: HttpErrorResponse) => {
          throw err;
          })

        );

      }

    getVehicleTypes(tenantId: string): Observable<ApiResponse<VehicleTypeOption[]>> {

      return this.http.get<ApiResponse<VehicleTypeOption[]>>(`${process.env["NX_BASE_DP_URL"]}${SalaryLineApiUrls.GetVehicleTypes}?tenantId=${tenantId}`)

        .pipe(

        map((response: any) => {
          return response;
        }),

        catchError((err: HttpErrorResponse) => {
          throw err;
        })

      );

    }

   SalaryLineActions(request: SalaryLineActionsRequest): Observable<ApiResponse<SalaryLineActionsResponse>> {
      return this.http.put<ApiResponse<SalaryLineActionsResponse>>(`${process.env["NX_BASE_DP_URL"]}${SalaryLineApiUrls.SalaryLineActions}`,
         request, {
          headers: { 'x-loader-key': 'SalaryCapture_LineWorkers' }
        })
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
