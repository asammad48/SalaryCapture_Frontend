import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressLoadingComponent } from '../../shared/progress-loading/progress-loading.component';
import { AppPortalBase } from '../../base/app-base/app.base';
import { takeUntil, filter } from 'rxjs';
import { LocalStorageService } from '../../services/local-storage.service';
import { LocalStorageKeys } from 'core-ui-admin-library/src/lib/data/repositories/access/local-storage-keys';
import { TenantConfigurationService } from '../../services/tenant-configuration.service';
import { AuthRepository } from 'core-ui-admin-library/src/lib/data/repositories/auth/auth.repository';
import { LoaderService } from 'core-ui-admin-library/src/lib/data/shared/loader.service';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { InteractionStatus, EventType, AuthenticationResult } from '@azure/msal-browser';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-portal-login',
  imports: [
    CommonModule,
    TranslateModule,
    ToastModule,
    ProgressLoadingComponent,
    ButtonModule,
  ],
  templateUrl: './login.component.html'
})
export class LoginComponent
  extends AppPortalBase
  implements OnInit, OnDestroy {

  isLoading = false;

  constructor(
    inject: Injector,
    private localStorageService: LocalStorageService,
    private authRepo: AuthRepository,
    private tenantConfig: TenantConfigurationService,
    private loaderService: LoaderService,
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
  ) {
    super(inject);
  }

  ngOnInit(): void {
    this.checkAuthentication();
    this.setupMsalEventHandlers();
  }

  private checkAuthentication(): void {
    const accounts = this.msalService.instance.getAllAccounts();
    if (accounts.length > 0) {
      this.navigateAfterLogin();
    }
  }

  private setupMsalEventHandlers(): void {
    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this.destroyer$)
      )
      .subscribe(() => {
        this.isLoading = false;
        this.checkAndSetActiveAccount();
      });

    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg) => msg.eventType === EventType.LOGIN_SUCCESS),
        takeUntil(this.destroyer$)
      )
      .subscribe((result) => {
        const payload = result.payload as AuthenticationResult;
        this.msalService.instance.setActiveAccount(payload.account);
        this.handleLoginSuccess(payload);
      });
  }

  private checkAndSetActiveAccount(): void {
    const activeAccount = this.msalService.instance.getActiveAccount();
    
    if (!activeAccount && this.msalService.instance.getAllAccounts().length > 0) {
      const accounts = this.msalService.instance.getAllAccounts();
      this.msalService.instance.setActiveAccount(accounts[0]);
      this.navigateAfterLogin();
    }
  }

  private handleLoginSuccess(authResult: AuthenticationResult): void {
    if (authResult.accessToken) {
      this.localStorageService.add(LocalStorageKeys.ACCESS_TOKEN, authResult.accessToken);
    }
    
    if (authResult.account) {
      this.localStorageService.add(LocalStorageKeys.FIRST_NAME, authResult.account.name || '');
      this.localStorageService.add(LocalStorageKeys.EMAIL, authResult.account.username || '');
    }

    this.authRepo.getRoles()
      .pipe(takeUntil(this.destroyer$))
      .subscribe({
        next: (res: any) => {
          const claims = Array.isArray(res?.data) ? res.data : [];
          this.localStorageService.add(LocalStorageKeys.ROLE_CLAIMS, claims);
          this.accessService.refreshClaims();

          this.accessService.fetchAndSaveUserRegions()
            .pipe(takeUntil(this.destroyer$))
            .subscribe({
              next: () => {
                this.messageService.add({
                  severity: 'success',
                  summary: this.translate.instant('LOGIN_TITLE'),
                  detail: this.translate.instant('LOGIN_SUCCESSFULLY'),
                  life: 3000
                });
                this.navigateAfterLogin();
              },
              error: () => this.navigateAfterLogin()
            });
        },
        error: () => {
          this.localStorageService.add(LocalStorageKeys.ROLE_CLAIMS, []);
          this.navigateAfterLogin();
        }
      });
  }

  loginWithMicrosoft(): void {
    this.isLoading = true;
    this.loaderService.show('Account_Login');
    
    this.msalService.loginRedirect({
      scopes: ['user.read', 'openid', 'profile', 'email']
    });
  }

  private navigateAfterLogin(): void {
    this.loaderService.hide('Account_Login');
    this.router.navigateByUrl('/daily-planning/base-plan');
  }

  ngOnDestroy(): void {
    this.destroyer$.next(true);
  }
}
