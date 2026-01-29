import { Route } from '@angular/router';
import { dailyPlanningModuleAccessGuard, salaryModuleAccessGuard, authGuard } from 'core-ui-admin-library/src/lib/presentation/base/utils/guards';
 
export const appRoutes: Route[] = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./app.component').then((a) => a.AppComponent),
    children: [
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
