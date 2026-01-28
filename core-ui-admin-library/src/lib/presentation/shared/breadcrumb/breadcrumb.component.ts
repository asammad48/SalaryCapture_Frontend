import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BreadcrumbModule } from "primeng/breadcrumb";
import { MenuItem } from "primeng/api";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { distinctUntilChanged, filter } from "rxjs";

@Component({
    selector: "app-breadcrumb",
    imports: [CommonModule, BreadcrumbModule],
    templateUrl: "./breadcrumb.component.html",
    styles: [`:host::ng-deep .p-breadcrumb {
      background: none;
  }`]
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: MenuItem[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.breadcrumbs = this.buildBreadCrumb(this.activatedRoute.root);
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      distinctUntilChanged()
    ).subscribe(() => {
      this.breadcrumbs = this.buildBreadCrumb(this.activatedRoute.root);
    });
  }

  buildBreadCrumb(route: ActivatedRoute, url: string = "", breadcrumbs: MenuItem[] = []): MenuItem[] {
    //If no routeConfig is available we are on the root path
    let label = route.routeConfig && route.routeConfig.data ? route.routeConfig.data["breadcrumb"] : "";
    let path = route.routeConfig && route.routeConfig.data ? route.routeConfig.path : "";

    // If the route is dynamic route such as ':id', remove it
    const lastRoutePart = path?.split("/").pop();
    const isDynamicRoute = lastRoutePart?.startsWith(":");
    if (isDynamicRoute && route.snapshot && lastRoutePart) {
      const paramName = lastRoutePart?.split(":")[1];
      path = path?.replace(lastRoutePart, route.snapshot.params[paramName]);
      label = route.snapshot.params[paramName];
    }

    //In the routeConfig the complete path is not available,
    //so we rebuild it each time
    const nextUrl = path ? `${url}/${path}` : url;

    const breadcrumb: MenuItem = {
      label: label,
      routerLink: nextUrl
    };
    // Only adding route with non-empty label
    const newBreadcrumbs = breadcrumb.label ? [...breadcrumbs, breadcrumb] : [...breadcrumbs];
    if (route.firstChild) {
      //If we are not on our current path yet,
      //there will be more children to look after, to build our breadcrumb
      return this.buildBreadCrumb(route.firstChild, nextUrl, newBreadcrumbs);
    }
    return newBreadcrumbs;
  }
}
