import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DailyJobsApiUrls } from "./daily-jobs-api-urls.enum";
import { ApiResponse } from "core-ui-salary-calculation-library/src/lib/core/domain/models/shared/response.model";
import { Observable, of } from "rxjs";
import { DailyJobResponse } from "core-ui-salary-calculation-library/src/lib/core/domain/models/DailyJobs/daily-jobs-response";
import { DailyJobsFilterRequest } from "core-ui-salary-calculation-library/src/lib/core/domain/requests/daily-jobs-filter.request";
import { DailyJobsReportDto } from "core-ui-salary-calculation-library/src/lib/core/domain/models/DailyJobs/daily-jobs-grouped-response";
import { PagedRequest } from "core-ui-salary-calculation-library/src/lib/core/domain/models/shared/paged-request.model";
import { PagedData } from "core-ui-salary-calculation-library/src/lib/core/domain/models/shared/paged-response.model";
import { DailyJobsReportFilterRequest } from "core-ui-salary-calculation-library/src/lib/core/domain/requests/daily-jobs-report-filter.request";

@Injectable()
export class DailyJobsService {

    constructor(private http: HttpClient) { }

    getWorkerDailyJobs(request: PagedRequest<DailyJobsFilterRequest>) : Observable<ApiResponse<PagedData<DailyJobResponse>>>{
        return this.http.post<ApiResponse<PagedData<DailyJobResponse>>>(`${process.env["NX_BASE_DP_URL"]}${DailyJobsApiUrls.GetWorkerDailyJobs}`, request, {headers: { 'x-loader-key': 'DailyJobs_GetWorkerDailyJobs' }});
    }

    getWorkerDailyJobsReport(request: PagedRequest<DailyJobsReportFilterRequest>): Observable<ApiResponse<PagedData<DailyJobsReportDto>>> {
        return this.http.post<ApiResponse<PagedData<DailyJobsReportDto>>>(`${process.env["NX_BASE_DP_URL"]}${DailyJobsApiUrls.GetWorkerDailyJobsReport}`, request, {headers: { 'x-loader-key': 'DailyJobs_GetWorkerDailyJobsReport' }});
    }
    
}
