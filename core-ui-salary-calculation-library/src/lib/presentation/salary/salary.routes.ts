import { Routes } from "@angular/router";
import { DialogService } from 'primeng/dynamicdialog';

export const SALARY_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () => import("./salary-list/salary-list.component").then((d) => d.SalaryListComponent),
    data: { title: "Salary Capture", breadcrumb: "Salary Capture" },
  }
];
