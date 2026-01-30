import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { OrganizationUnitsDeadLineRepository } from "../../../../core/repositories";
import { Observable, catchError, map } from "rxjs";
import { OrganizationUnitDeadlinesUrls } from "./organization-unit-deadlines-urls.enum";
import { DeadlineRequest, RemainingTime } from "../../../../core/domain/models";

@Injectable()
export class OrganizationUnitDeadlinesWebRepository extends OrganizationUnitsDeadLineRepository{
    constructor(private http: HttpClient){
        super();
    }

    getOrganizationUnitsDeadlines(request: DeadlineRequest): Observable<RemainingTime>{
        return this.http.post(
            `${process.env["NX_BASE_DPS_URL"]}/api${OrganizationUnitDeadlinesUrls.GetOrganizationUnitDeadlines}`, request, {
          headers: { 'x-loader-key': 'SalaryCapture_LineWorkers' }
        }
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

}
