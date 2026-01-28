import { Injectable } from '@angular/core';
import { ApiResponse } from "core-ui-admin-library/src/lib/core/domain/models/shared/response.model";
import { LoginRequest } from 'core-ui-admin-library/src/lib/core/domain/requests';
import { Observable } from 'rxjs';
import { Authorize } from 'core-ui-admin-library/src/lib/core/domain/models';
import { Client as AdminApiClient, LoginRequestDto } from '../../../api-clients/admin-api.client';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private adminApiClient: AdminApiClient) { }

  logIn(logInRequest: LoginRequest): Observable<ApiResponse<Authorize>> {
    return this.adminApiClient.login(LoginRequestDto.fromJS(logInRequest)) as any;
  }
}
