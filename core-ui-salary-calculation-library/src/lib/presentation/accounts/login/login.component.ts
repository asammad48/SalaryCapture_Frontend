import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressLoadingComponent } from '../../shared/progress-loading/progress-loading.component';
import { ActivatedRoute } from '@angular/router';
import { LoaderHandler } from '../../../core/domain/models';
import { SalaryCalculationPortalBase } from '../../base/salary-calculation-base/salary-calculation.base';
import { BehaviorSubject, EMPTY, catchError, takeUntil } from 'rxjs';
import { LocalStorageService } from '../../services/local-storage.service';
import { AccountService } from 'core-ui-salary-calculation-library/src/lib/data/repositories/account/account-web-repository/account.service';
import { AccessService } from 'core-ui-salary-calculation-library/src/lib/data/repositories/access/access.service';
import { LocalStorageKeys } from 'core-ui-salary-calculation-library/src/lib/data/repositories/access/local-storage-keys';
import { TenantConfigurationService } from '../../services/tenant-configuration.service';

const defaultLoginDetails = {
  email: 'demoUser',
  password: 'J#8mZ&n*2$L@',
};

@Component({
  selector: 'core-ui-product-portal-login',
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
  extends SalaryCalculationPortalBase
  implements OnInit, OnDestroy {
  isSubmitted = false;
  isShowPassword = false;
  loginFormGroup!: FormGroup;
  private _timeSlotInterval$ = new BehaviorSubject<number | null>(null);
  hasSalary = true;
  hasPlanning = true;
  constructor(
    inject: Injector,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private localStorageService: LocalStorageService,
    private accountService: AccountService,
    private tenantConfig: TenantConfigurationService
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

  login() {

    this.isSubmitted = true;

    if (this.loginFormGroup.touched && this.loginFormGroup.valid) {
      const loaderHandler: LoaderHandler = {
        componentName: LoginComponent.name,
        endPointName: ''
      };

      // this.enableLoading(loaderHandler);

      try {
        const loginFormRequest = this.loginFormGroup.getRawValue();

        this.accountService.logIn(loginFormRequest)
          .pipe(
            takeUntil(this.destroyer$),
            catchError((err) => {
              this.messageService.clear();
              this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('ERROR'),
                detail: err.message,
              });
              return EMPTY;
            })
          )
          .subscribe((response: any) => {
            if (response?.success && response?.data) {

              this.saveLoginDataToLocalStorage(response.data);

              this.messageService.add({
                severity: "success",
                summary: this.translate.instant("LOGIN_TITLE"),
                detail: this.translate.instant("LOGIN_SUCCESSFULLY"),
                life: 3000
              });

              this.accessService.getRoleClaims()
                .pipe(takeUntil(this.destroyer$))
                .subscribe((x: any) => {
                  const roles = x?.data;
                  this.localStorageService.add(LocalStorageKeys.ROLE_CLAIMS, roles);

                  this.accessService.refreshClaims();

                  this.fetchAndSaveUserRegionsOnLogin(roles);
                });

            } else {

              this.messageService.add({
                severity: "error",
                summary: this.translate.instant("LOGIN_TITLE"),
                detail: this.translate.instant(`${response?.message}`),
                life: 3000
              });
            }
          });

      } catch (e: any) {
        let message = "SOMETHING_WENT_WRONG_TRY_AGAIN";

        if (e?.error) {
          message = e.error.message ? e.error.message : e.error.errors[0];
        }

        this.messageService.add({
          severity: "error",
          summary: this.translate.instant("LOGIN_TITLE"),
          detail: this.translate.instant(message),
          life: 3000
        });

      } finally {
        // this.disableLoading(loaderHandler);
      }
    }
  }

  private saveLoginDataToLocalStorage(data: any): void {

    // Clear existing storage
    this.localStorageService.remove(...Object.values(LocalStorageKeys));

    // Save all standard login data
    Object.entries(LocalStorageKeys)
      .filter(([_, value]) => value !== LocalStorageKeys.TENANT_FRONTEND_CONFIGS && value !== LocalStorageKeys.USER_REGIONS)
      .forEach(([_, value]) => {
        this.localStorageService.add(value, data[value] ?? null);
      });

    // Save tenant frontend configs using ConfigurationService
    if (data?.tenantFrontEndConfigs) {
      this.tenantConfig.saveTenantConfigs(data.tenantFrontEndConfigs);
    }

  }

  private fetchAndSaveUserRegionsOnLogin(roles: string): void {
    this.accessService.fetchAndSaveUserRegions()
      .pipe(takeUntil(this.destroyer$))
      .subscribe({
        next: () => {
          this.navigateToReturnUrl(roles);
        },
        error: (err: any) => {
          console.error('Failed to fetch user regions:', err);
          this.navigateToReturnUrl(roles);
        }
      });
  }

  private navigateToReturnUrl(roles: string): void {
    let returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'];
    if (this.tenantConfig.isModuleAccessEditable()) {

      const hasSalaryRaw = this.localStorageService.get(LocalStorageKeys.HAS_SALARY_CAPTURE);
      const hasPlanningRaw = this.localStorageService.get(LocalStorageKeys.HAS_DAILY_PLANNING);

      this.hasSalary = hasSalaryRaw === true || hasSalaryRaw === 'true';
      this.hasPlanning = hasPlanningRaw === true || hasPlanningRaw === 'true';
    }

    if (!returnUrl || returnUrl === '/') {
      returnUrl = '/daily-planning/base-plan';
    }

    this.router.navigateByUrl(returnUrl);
  }

  ngOnDestroy(): void {
    this.destroyer$.next(true);
  }

}
