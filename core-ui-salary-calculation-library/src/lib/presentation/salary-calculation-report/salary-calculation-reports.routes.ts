import { Routes } from "@angular/router";
import { salaryReportAccessGuard, salaryReportHistoryAccessGuard } from "../base/utils/guards";

export const SALARY_CALCULATION_REPORT: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./salary-calculation-report.component").then(
        (d) => d.SalaryCalculationReportComponent
      ),
    data: { title: "Salary Report", breadcrumb: "Salary Report" },
    canActivate: [salaryReportAccessGuard],
  },
  {
    path: "salary-calculations-history",
    loadComponent: () =>
      import("./salary-reports-grid/salary-reports-grid.component").then(
        (m) => m.SalaryReportsGridComponent
      ),
    data: { title: "Salary History", breadcrumb: "Salary History" },
    canActivate: [salaryReportHistoryAccessGuard],
  },
];

