import { Routes } from '@angular/router';
import { BasePlanComponent } from './base-plan.component';
import { BasePlanJobPackagesComponent } from './base-plan-job-packages/base-plan-job-packages.component';

export const BASE_PLAN_ROUTES: Routes = [
  {
    path: '',
    component: BasePlanComponent,
    data: { title: 'Base Plans'},
  },
  {
    path: 'base-plan-job-packages/:planId',
    component: BasePlanJobPackagesComponent,
    data: { title: 'Base Plan Job Packages'},
  },
];
