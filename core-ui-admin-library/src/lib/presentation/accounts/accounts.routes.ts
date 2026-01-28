import {Routes} from "@angular/router";

export const ACCOUNTS_ROUTES: Routes = [
    {
        path: "",
        loadComponent: () => import("./accounts.component").then(x => x.AccountsComponent),
        children:[
            {
                path: "login",
                loadComponent: () => import("./login/login.component").then(acc => acc.LoginComponent),
                data: {title: "Login", breadcrumb: "Login"}
            }
        ]
    }
]