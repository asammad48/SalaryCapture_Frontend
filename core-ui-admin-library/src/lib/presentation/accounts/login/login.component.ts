import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressLoadingComponent } from '../../shared/progress-loading/progress-loading.component';
import { AppPortalBase } from '../../base/app-base/app.base';
import { BehaviorSubject, EMPTY, catchError, takeUntil } from 'rxjs';
import { LocalStorageService } from '../../services/local-storage.service';
import { LocalStorageKeys } from 'core-ui-admin-library/src/lib/data/repositories/access/local-storage-keys';
import { TenantConfigurationService } from '../../services/tenant-configuration.service';
import { AuthRepository } from 'core-ui-admin-library/src/lib/data/repositories/auth/auth.repository';
import { LoaderService } from 'core-ui-admin-library/src/lib/data/shared/loader.service';

const defaultLoginDetails = {
  email: 'demoUser',
  password: 'J#8mZ&n*2$L@',
};

@Component({
  selector: 'app-portal-login',
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

  isSubmitted = false;
  isShowPassword = false;
  loginFormGroup!: FormGroup;
  private _timeSlotInterval$ = new BehaviorSubject<number | null>(null);

  constructor(
    inject: Injector,
    private fb: FormBuilder,
    private localStorageService: LocalStorageService,
    private authRepo: AuthRepository,
    private tenantConfig: TenantConfigurationService,
    private loaderService: LoaderService,
  ) {
    super(inject);
  }

  ngOnInit(): void {
    this.initFormGroup();
  }

  initFormGroup() {
    this.loginFormGroup = this.fb.group({
      email: [null, [Validators.required]],
      password: [null, [Validators.required]],
    });

    if (process.env["NODE_ENV"] === "development") {
      this.loginFormGroup.patchValue(defaultLoginDetails);
      this.loginFormGroup.markAsTouched();
    }
  }

  login(): void {

    this.isSubmitted = true;

    if (!this.loginFormGroup.touched || !this.loginFormGroup.valid) {
      return;
    }

    this.loaderService.show('Account_Login');

    try {

      const loginFormRequest = this.loginFormGroup.getRawValue();

      this.authRepo.login(loginFormRequest)
        .pipe(
          takeUntil(this.destroyer$),
          catchError((err) => {
            this.loaderService.hide('Account_Login');

            this.messageService.clear();
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('ERROR'),
              detail: err?.message || this.translate.instant('SOMETHING_WENT_WRONG_TRY_AGAIN'),
            });

            return EMPTY;
          })
        )
        .subscribe((response: any) => {

          this.loaderService.hide('Account_Login');

          if (!response?.success || !response?.data) {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('LOGIN_TITLE'),
              detail: this.translate.instant(response?.message || 'LOGIN_FAILED'),
              life: 3000
            });
            return;
          }

          // ✅ Save token + login data (UNCHANGED)
          this.saveLoginDataToLocalStorage(response.data);

          // ✅ Fetch role claims
          this.authRepo.getRoles()
            .pipe(takeUntil(this.destroyer$))
            .subscribe({
              next: (res: any) => {

                const claims = Array.isArray(res?.data) ? res.data : [];

                // Store role claims
                this.localStorageService.add(
                  LocalStorageKeys.ROLE_CLAIMS,
                  claims
                );

                // Refresh AccessService cache
                this.accessService.refreshClaims();

                // ✅ MISSING STEP (NOW FIXED)
                // Fetch user regions & sub-areas
                this.accessService.fetchAndSaveUserRegions()
                  .pipe(takeUntil(this.destroyer$))
                  .subscribe({
                    next: () => {

                      // Success message (same place as before)
                      this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('LOGIN_TITLE'),
                        detail: this.translate.instant('LOGIN_SUCCESSFULLY'),
                        life: 3000
                      });

                      // Navigate ONLY after claims + regions are ready
                      this.navigateAfterLogin();
                    },
                    error: () => {
                      // Fail-safe: navigate even if regions fail
                      this.navigateAfterLogin();
                    }
                  });
              },
              error: () => {
                // Fail-safe: no claims, still try regions
                this.localStorageService.add(LocalStorageKeys.ROLE_CLAIMS, []);

                this.accessService.fetchAndSaveUserRegions()
                  .pipe(takeUntil(this.destroyer$))
                  .subscribe({
                    next: () => this.navigateAfterLogin(),
                    error: () => this.navigateAfterLogin()
                  });
              }
            });

        });

    } catch (e: any) {

      this.loaderService.hide('Account_Login');

      const message =
        e?.error?.message ||
        e?.error?.errors?.[0] ||
        this.translate.instant('SOMETHING_WENT_WRONG_TRY_AGAIN');

      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('LOGIN_TITLE'),
        detail: this.translate.instant(message),
        life: 3000
      });
    }
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
