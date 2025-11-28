import { Routes } from '@angular/router';
import { authGuard, salaryModuleAccessGuard } from './base/utils/guards';
import { Title } from '@angular/platform-browser';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';

export const PRESENTATION_ROUTES: Routes = [
  {
    path: 'accounts',
    loadChildren: () =>
      import('./accounts/accounts.routes').then((acc) => acc.ACCOUNTS_ROUTES),
    data: { title: 'Accounts', breadcrumb: 'Accounts' },
    // providers: [importProvidersFrom([NgxsModule.forFeature([AccountsState])])],
  },

  {
    path: '',
    loadComponent: () =>
      import('./layout/layout.component').then((l) => l.LayoutComponent),
    children: [
      {
        path: 'salary-capture',
          canActivate: [salaryModuleAccessGuard], 
        loadChildren: () =>
          import('./salary/salary.routes').then((d) => d.SALARY_ROUTES),
        data: { title: 'Salary Capture', breadcrumb: 'Salary Capture' },
        providers: [
          // importProvidersFrom([NgxsModule.forFeature([SalaryState])]),
        ],
      },

      // Default route redirects to salary-capture
      {
        path: '',
        redirectTo: 'salary-capture',
        pathMatch: 'full'
      },
      {
        path: 'user-management',
        loadChildren: () =>
          import('./user-management/user-management.routes').then(
            (d) => d.USER_MANAGEMENT_ROUTES
          ),
        data: { title: 'User Management', breadcrumb: 'User Management' },
        providers: [
          // importProvidersFrom([NgxsModule.forFeature([UserManagementState])]),
        ],
      },
      {
        path: 'salary-calculations-report',
        canActivate: [salaryModuleAccessGuard], 
        loadChildren: () => import('./salary-calculation-report/salary-calculation-reports.routes').then((d) => d.SALARY_CALCULATION_REPORT),
        data: { title: 'Salary Report', breadcrumb: 'Salary Report' },
        // providers: [ importProvidersFrom([NgxsModule.forFeature([SalaryState])])],
      },
      {
        path: 'daily-jobs',
        loadChildren: () =>
          import('./daily-jobs/daily-jobs.routes').then(
            (d) => d.DAILY_JOBS_ROUTES
          ),
        data: { title: 'Daily Jobs', breadcrumb: 'Daily Jobs' },
        providers: [],
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./settings/settings.routes').then(
            (d) => d.SETTINGS_ROUTES
          ),
        data: { title: 'Settings', breadcrumb: 'Settings' },
        // providers: [
        //   importProvidersFrom([NgxsModule.forFeature([SettingsState])]),
        // ],
      },

      { path: 'page-not-found', component: PageNotFoundComponent, data: { title: '404', breadcrumb: '404' }, },
    ],
    providers: [
      //importProvidersFrom([NgxsModule.forFeature([BaseState])]),
      DialogService,
      ConfirmationService,
      Title,
      MessageService,
    ],
    canActivate: [authGuard],
  },
  // Accounts Routes
  // {
  //   path: 'accounts',
  //   loadChildren: () =>
  //     import('./accounts/accounts.routes').then((acc) => acc.ACCOUNTS_ROUTES),
  //   data: { title: 'Accounts', breadcrumb: 'Accounts' },
  // },


];
