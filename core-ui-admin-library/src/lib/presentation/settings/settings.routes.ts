import { Routes } from "@angular/router";

export const SETTINGS_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () => import("./syncing/syncing.component").then((d) => d.SyncingComponent),
    data: { title: "Settings", breadcrumb: "Settings" },
  }
];