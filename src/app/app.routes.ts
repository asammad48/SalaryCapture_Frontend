import { Route } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';

export const appRoutes: Route[] = [
  {
    path: '',
    canActivate: [MsalGuard],
    loadComponent: () =>
      import('./app.component').then((a) => a.AppComponent),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('@embrace-it/admin-library').then(
            (m) => m.coreUiSalaryCalculationLibraryRoutes
          ),
      },
      {
        path: 'daily-planning',
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
