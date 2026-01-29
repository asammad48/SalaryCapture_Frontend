import { Route } from '@angular/router';
import { MsalRedirectComponent } from '@azure/msal-angular';
import { dailyPlanningModuleAccessGuard, salaryModuleAccessGuard, authGuard } from 'core-ui-admin-library/src/lib/presentation/base/utils/guards';
 
export const appRoutes: Route[] = [
  {
    path: 'auth-callback',
    component: MsalRedirectComponent,
  },
  {
    path: 'accounts',
    loadChildren: () =>
      import('@embrace-it/admin-library').then((m) => m.ACCOUNTS_ROUTES),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./app.component').then((a) => a.AppComponent),
    children: [
      {
        path: 'admin',
        loadChildren: () =>
          import('@embrace-it/admin-library').then(
            (m) => m.PRESENTATION_ROUTES
          ),
      },
      {
        path: '',
        canActivate: [salaryModuleAccessGuard],
        loadChildren: () =>
          import('@embrace-it/admin-library').then(
            (m) => m.coreUiSalaryCalculationLibraryRoutes
          ),
      },
      {
        path: 'daily-planning',
        canActivate: [dailyPlanningModuleAccessGuard],
        loadChildren: () =>
          import('@embrace-it/core-ui-daily-planning-library').then(
            (m) => m.coreUiDailyPlanningLibraryRoutes
          ),
      },
      {
        path: '',
        redirectTo: 'salary-capture',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: '/page-not-found',
      },
    ],
  },
];
