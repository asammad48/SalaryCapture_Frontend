import { HttpClient, HttpResponse } from "@angular/common/http";
import { SalaryReportSummary } from "core-ui-salary-calculation-library/src/lib/core/domain/models/responses/salary-report-summary";
import { ApiResponse } from "core-ui-salary-calculation-library/src/lib/core/domain/models/shared/response.model";
import { SalaryReportRequest } from "core-ui-salary-calculation-library/src/lib/core/domain/requests/salary-report.request";
import { SalaryReportFilterRequest } from "core-ui-salary-calculation-library/src/lib/core/domain/requests/salary-report-filter.request";
import { Observable } from "rxjs";
import { SalaryReportApiUrls } from "./salary-report-api-urls";
import { Injectable } from "@angular/core";
import { ExportedSalaryReportResponse } from "core-ui-salary-calculation-library/src/lib/core/domain/models/responses/exported-salary-report-response";

@Injectable({
  providedIn: 'root'
})
export class SalaryReportsService {

  constructor(private http: HttpClient) { }

  exportSalaryReport(request: SalaryReportRequest): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${process.env['NX_BASE_DP_URL']}${SalaryReportApiUrls.ExportSalaryTransactionsReport}`, request, {
      headers: { 'x-loader-key': 'SalaryReport_CalculateReport' }
    });
  }

  reExportSalaryTransactionsReport(id: string): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${process.env['NX_BASE_DP_URL']}${SalaryReportApiUrls.ReExportSalaryTransactionsReport}`, { id }, {
      headers: { 'x-loader-key': 'SalaryReport_ReportHistory' }
    });
  }

  getFilteredSalaryReport(request: SalaryReportRequest): Observable<ApiResponse<SalaryReportSummary>> {
    return this.http.post<ApiResponse<SalaryReportSummary>>(`${process.env['NX_BASE_DP_URL']}${SalaryReportApiUrls.GenerateReport}`, request, {
      headers: { 'x-loader-key': 'SalaryReport_CalculateReport' }
    });
  }

  getExportedSalaryReports(filter: SalaryReportFilterRequest): Observable<ApiResponse<ExportedSalaryReportResponse[]>> {
    return this.http.post<ApiResponse<ExportedSalaryReportResponse[]>>(`${process.env['NX_BASE_DP_URL']}${SalaryReportApiUrls.GetExportedSalaryReports}`, filter,
      { headers: { 'x-loader-key': 'SalaryReport_ReportHistory' } }
    );
  }

  downloadReport(reportId: string): Observable<HttpResponse<Blob>> {

    return this.http.get(`${process.env['NX_BASE_DP_URL']}${SalaryReportApiUrls.DownloadReport}`, {
      params: { reportId },
      responseType: 'blob',
      observe: 'response',
      headers: { 'x-loader-key': 'SalaryReport_ReportHistory' }
    });
  }

}
