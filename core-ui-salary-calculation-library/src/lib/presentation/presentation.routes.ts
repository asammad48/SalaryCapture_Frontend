import { Routes } from '@angular/router';
import { authGuard, salaryModuleAccessGuard } from './base/utils/guards';
import { Title } from '@angular/platform-browser';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';

export const PRESENTATION_ROUTES: Routes = [
  {
    path: 'accounts',
    loadChildren: () =>
      import('./accounts/accounts.routes').then((acc) => acc.ACCOUNTS_ROUTES),
    data: { title: 'Accounts', breadcrumb: 'Accounts' },
    // providers: [importProvidersFrom([NgxsModule.forFeature([AccountsState])])],
  },

  {
    path: '',
    loadComponent: () =>
      import('./layout/layout.component').then((l) => l.LayoutComponent),
    children: [
      // Default route redirects to daily-planning/base-plan
      {
        path: '',
        redirectTo: 'daily-planning/base-plan',
        pathMatch: 'full'
      },
      {
        path: 'user-management',
        loadChildren: () =>
          import('./user-management/user-management.routes').then(
            (d) => d.USER_MANAGEMENT_ROUTES
          ),
        data: { title: 'User Management', breadcrumb: 'User Management' },
        providers: [
          // importProvidersFrom([NgxsModule.forFeature([UserManagementState])]),
        ],
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./settings/settings.routes').then(
            (d) => d.SETTINGS_ROUTES
          ),
        data: { title: 'Settings', breadcrumb: 'Settings' },
        // providers: [
        //   importProvidersFrom([NgxsModule.forFeature([SettingsState])]),
        // ],
      },

      { path: 'page-not-found', component: PageNotFoundComponent, data: { title: '404', breadcrumb: '404' }, },
    ],
    providers: [
      //importProvidersFrom([NgxsModule.forFeature([BaseState])]),
      DialogService,
      ConfirmationService,
      Title,
      MessageService,
    ],
    canActivate: [authGuard],
  },
  // Accounts Routes
  // {
  //   path: 'accounts',
  //   loadChildren: () =>
  //     import('./accounts/accounts.routes').then((acc) => acc.ACCOUNTS_ROUTES),
  //   data: { title: 'Accounts', breadcrumb: 'Accounts' },
  // },


];
