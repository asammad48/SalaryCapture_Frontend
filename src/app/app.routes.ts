import { Route } from '@angular/router';
import { dailyPlanningModuleAccessGuard, salaryModuleAccessGuard } from 'core-ui-salary-calculation-library/src/lib/presentation/base/utils/guards';
 
export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./app.component').then((a) => a.AppComponent),
    children: [
      {
        path: '',
      //  canActivate: [salaryModuleAccessGuard],   //  THIS HAS ISSUE AS WE ALWAYS GO TO SALARY INITIALLY AND WE CANT GUARD THIS.  protect salary library
        loadChildren: () =>
          import('@embrace-it/salary-calculation-library').then(
            (m) => m.coreUiSalaryCalculationLibraryRoutes
          ),
      },
      {
        path: 'daily-planning',
       canActivate: [dailyPlanningModuleAccessGuard],  //   protect daily planning library
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
