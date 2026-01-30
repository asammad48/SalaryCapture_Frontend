import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppPortalBase } from '../../base/app-base/app.base';
import { LocalStorageService } from '../../services/local-storage.service';
import { Authorize } from 'core-ui-admin-library/src/lib/core/domain/models';
import { AccessService } from 'core-ui-admin-library/src/lib/data/repositories/access/access.service';
import { Popover } from 'primeng/popover';
import { LocalStorageKeys } from 'core-ui-admin-library/src/lib/data/repositories/access/local-storage-keys';
@Component({
  selector: 'app-header',
  imports: [CommonModule, Popover],
  templateUrl: './header.component.html',
  styleUrls: [],
})
export class HeaderComponent
  extends AppPortalBase
  implements OnInit, OnDestroy
{
  fullName?: string;
  role?: string;

  constructor(
    inject: Injector,
    private localStorageService: LocalStorageService
  ) {
    super(inject);
    const firstName = this.localStorageService.get<string>(LocalStorageKeys.FIRST_NAME);
    const lastName = this.localStorageService.get<string>(LocalStorageKeys.LAST_NAME);
    const role = this.localStorageService.get<string>(LocalStorageKeys.ROLE);
    this.fullName =  firstName || '';
    this.role = role || '';
  }
  ngOnInit() {
    this.addLoaderClass();
  }

  logout() {
    this.accessService.logout();
    this.router.navigate(['/accounts/login']);
    this.removeLoaderClass();
  }

  addLoaderClass() {
    const isLoggedIn = localStorage.getItem('ls_isLoggedIn');
    if (isLoggedIn) {
      document.querySelector('.menus-sidebar')?.classList.add('exclude-loader');
    }
  }

  removeLoaderClass() {
    document
      .querySelector('.menus-sidebar')
      ?.classList.remove('exclude-loader');
  }

  ngOnDestroy() {
    this.destroyer$.next(true);
    this.destroyer$.unsubscribe();
  }
}
