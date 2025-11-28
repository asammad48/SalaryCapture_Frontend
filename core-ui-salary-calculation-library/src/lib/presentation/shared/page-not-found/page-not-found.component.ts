import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {JwtHelperService} from "@auth0/angular-jwt";
import { Router } from '@angular/router';
import { Authorize } from 'core-ui-salary-calculation-library/src/lib/core/domain/models';
import { AccessService } from 'core-ui-salary-calculation-library/src/lib/data/repositories/access/access.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { LocalStorageKeys } from 'core-ui-salary-calculation-library/src/lib/data/repositories/access/local-storage-keys';


@Component({
    selector: 'lib-page-not-found',
    imports: [CommonModule],
    templateUrl: './page-not-found.component.html'
})
export class PageNotFoundComponent implements OnInit {

  router: Router;
  accessService: AccessService;
  localStorageService: LocalStorageService;
  constructor(){
    this.router = inject(Router);
    this.accessService = inject(AccessService);
    this.localStorageService = inject(LocalStorageService);
  }

  ngOnInit(): void {
    const accessToken = this.localStorageService.get<string>(LocalStorageKeys.ACCESS_TOKEN);

    const jwtHelper = new JwtHelperService();
    const isAuthenticated = accessToken && !jwtHelper.isTokenExpired(accessToken);

    if(!isAuthenticated){
      this.logout(this.router);
    }
  }

  logout(router: Router, returnUrl?: string) {
    this.accessService.logout();
    router.navigate(["/accounts/login"], {queryParams: {returnUrl: returnUrl}}).then();
  }

}
