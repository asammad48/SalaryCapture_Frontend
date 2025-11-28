import { Routes } from '@angular/router';
import { DpsComponent } from './dps.component';

export const PRESENTATION_ROUTES: Routes = [
  {
    path: '',
    component: DpsComponent,
    children: [
      {
        path: 'daily-plan',
        loadChildren: () =>
          import('./features/daily-plan/daily-plan.routes').then(
            (m) => m.DAILY_PLAN_ROUTES
          ),
      },
      {
        path: 'base-plan',
        loadChildren: () =>
          import('./features/base-plan/base-plan.routes').then(
            (m) => m.BASE_PLAN_ROUTES
          ),
      },
      {
        path: '',
        redirectTo: 'daily-plan',
        pathMatch: 'full',
      },
      { path: '**', redirectTo: '/page-not-found' },
    ],
  },
];