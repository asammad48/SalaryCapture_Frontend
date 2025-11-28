import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiResponse } from "../../../../core/domain/models/shared/response.model";
import { SalaryApiUrls } from "./salary-apy-urls.enum";
import { SalaryRequest } from "../../../../core/domain/requests/salary.request";
import { GetAllSalariesResponse, GetSalaryLineDto, SalaryResponseDto } from "../../../../core/domain/models/Salary/salary.model";


@Injectable()
export class SalaryService {

    constructor(private http: HttpClient) {}

    getSalariesV1(salaryRequest: SalaryRequest) : Observable<ApiResponse<SalaryResponseDto[]>>{
        return this.http.post<ApiResponse<SalaryResponseDto[]>>(
            `${process.env["NX_BASE_DP_URL"]}${SalaryApiUrls.GetSalaries}`
            , salaryRequest
        )
    }

    getAllSalaries(salaryRequest: SalaryRequest) : Observable<ApiResponse<GetAllSalariesResponse[]>>{
        return this.http.post<ApiResponse<GetAllSalariesResponse[]>>(
            `${process.env["NX_BASE_DP_URL"]}${SalaryApiUrls.GetAllSalaries}`
            , salaryRequest
            , { headers: { 'x-loader-key': 'SalaryCapture_GetAllSalaries' } }
        )
    }
    
}
