import { Routes } from "@angular/router";
import { dailyJobsAccessGuard } from "../base/utils/guards";

export const DAILY_JOBS_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () => import("./daily-jobs.component").then((d) => d.DailyJobsComponent),
    data: { title: "Daily Jobs", breadcrumb: "Daily Jobs" },
    canActivate: [dailyJobsAccessGuard],
  }
];
