import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressLoadingComponent } from '../../shared/progress-loading/progress-loading.component';
import { AppPortalBase } from '../../base/app-base/app.base';
import { takeUntil } from 'rxjs';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult } from '@azure/msal-browser';
import { LocalStorageKeys } from 'core-ui-admin-library/src/lib/data/repositories/access/local-storage-keys';
import { MessageService } from 'primeng/api';
import { LocalStorageService } from '../../services/local-storage.service';

@Component({
  selector: 'app-portal-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
    private msalService: MsalService,
    private storageService: LocalStorageService,
    private msgService: MessageService
  ) {
    super(inject);
  }

  ngOnInit(): void {}

  loginWithEntra(): void {
    this.msalService.loginPopup()
      .subscribe({
        next: (result: AuthenticationResult) => {
          this.handleAuthResponse(result);
        },
        error: (error) => {
          this.msgService.add({
            severity: 'error',
            summary: 'Login Failed',
            detail: 'Authentication failed. Please try again.'
          });
        }
      });
  }

  private handleAuthResponse(result: AuthenticationResult) {
    // Save token and navigate
    this.storageService.add(LocalStorageKeys.ACCESS_TOKEN, result.accessToken);
    
    // Fetch claims and navigate (as requested, keeping existing logic but triggered by MSAL)
    this.accessService.fetchAndSaveUserRegions()
      .pipe(takeUntil(this.destroyer$))
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/daily-planning/base-plan');
        },
        error: () => {
          this.router.navigateByUrl('/daily-planning/base-plan');
        }
      });
  }

  ngOnDestroy(): void {
    this.destroyer$.next(true);
  }
}
