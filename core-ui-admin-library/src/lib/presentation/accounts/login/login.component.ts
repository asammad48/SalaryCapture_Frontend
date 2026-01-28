import { Component, Inject, Injector, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressLoadingComponent } from '../../shared/progress-loading/progress-loading.component';
import { AppPortalBase } from '../../base/app-base/app.base';
import { takeUntil } from 'rxjs';
import { LocalStorageService } from '../../services/local-storage.service';
import { LocalStorageKeys } from 'core-ui-admin-library/src/lib/data/repositories/access/local-storage-keys';
import { TenantConfigurationService } from '../../services/tenant-configuration.service';
import { AuthRepository } from 'core-ui-admin-library/src/lib/data/repositories/auth/auth.repository';
import { LoaderService } from 'core-ui-admin-library/src/lib/data/shared/loader.service';
import { MsalService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { AuthenticationResult } from '@azure/msal-browser';

@Component({
  selector: 'app-portal-login',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ToastModule,
    ProgressLoadingComponent,
  ],
  templateUrl: './login.component.html'
})
export class LoginComponent
  extends AppPortalBase
  implements OnInit, OnDestroy {

  constructor(
    inject: Injector,
    private localStorageService: LocalStorageService,
    private authRepo: AuthRepository,
    private tenantConfig: TenantConfigurationService,
    private loaderService: LoaderService,
    private msalService: MsalService,
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration
  ) {
    super(inject);
  }

  ngOnInit(): void {
  }

  loginWithMicrosoft(): void {
    this.loaderService.show('MS_Login');
    this.msalService.loginPopup({
      scopes: this.msalGuardConfig.authRequest?.scopes || ['user.read'],
      ...this.msalGuardConfig.authRequest
    })
    .pipe(takeUntil(this.destroyer$))
    .subscribe({
      next: (result: AuthenticationResult) => {
        this.loaderService.hide('MS_Login');
        console.log('MSAL Login Success:', result);
        // Here you would typically send the MSAL token to your backend
        // For now, we will handle it as a successful login if a token is present
        if (result.accessToken) {
          // This is a placeholder for actual backend verification
          // response.data should be constructed from result if backend supports it
          // For now, just logging success
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('LOGIN_TITLE'),
            detail: 'Microsoft Login Successful',
            life: 3000
          });
          this.navigateAfterLogin();
        }
      },
      error: (error) => {
        this.loaderService.hide('MS_Login');
        console.error('MSAL Login Error:', error);
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('LOGIN_TITLE'),
          detail: 'Microsoft Login Failed',
          life: 3000
        });
      }
    });
  }

  private saveLoginDataToLocalStorage(data: any): void {

    this.localStorageService.remove(...Object.values(LocalStorageKeys));

    this.localStorageService.add(
      LocalStorageKeys.ACCESS_TOKEN,
      data.accessToken
    );

    Object.entries(LocalStorageKeys)
      .filter(([_, value]) =>
        value !== LocalStorageKeys.TENANT_FRONTEND_CONFIGS &&
        value !== LocalStorageKeys.USER_REGIONS
      )
      .forEach(([_, value]) => {
        this.localStorageService.add(value, data[value] ?? null);
      });

    if (data?.tenantFrontEndConfigs) {
      this.tenantConfig.saveTenantConfigs(data.tenantFrontEndConfigs);
    }
  }

  // NEW SIMPLE NAVIGATION
  private navigateAfterLogin() {
    this.router.navigateByUrl('/daily-planning/base-plan');
  }

  ngOnDestroy(): void {
    this.destroyer$.next(true);
  }
}
