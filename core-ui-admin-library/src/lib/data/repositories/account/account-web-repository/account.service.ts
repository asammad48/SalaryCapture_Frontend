import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from "core-ui-admin-library/src/lib/core/domain/models/shared/response.model";
import { LoginRequest } from 'core-ui-admin-library/src/lib/core/domain/requests';
import { Observable } from 'rxjs';
import { Authorize } from 'core-ui-admin-library/src/lib/core/domain/models';
import { AccountApiUrls } from './account-api-urls.enum';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private http: HttpClient) { }

  logIn(logInRequest : LoginRequest) : Observable<ApiResponse<Authorize>>{
    return this.http.post<ApiResponse<Authorize>>(
      `${process.env["NX_BASE_DP_URL"]}${AccountApiUrls.Login}`
      , logInRequest, {
          headers: { 'x-loader-key': 'Account_Login' }
        })
  }
}
