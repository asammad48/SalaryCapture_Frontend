import { Route } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CoreModule } from './core/core.module';
import { DataModule } from './data/data.module';

export const coreUiDailyPlanningLibraryRoutes: Route[] = [
  {
    path: '',
    loadChildren: () =>
      import('./presentation/presentation.routes').then(
        (m) => m.PRESENTATION_ROUTES
      ),
    providers: [
      importProvidersFrom([
        // Daily Planning Library Modules
        CoreModule,
        DataModule,
        TranslateModule.forChild({
          isolate: false,
          extend: true,
          loader: {
            provide: TranslateLoader,
            useFactory: (http: HttpClient) =>
              new TranslateHttpLoader(http, './assets/i18n/', '.json'),
            deps: [HttpClient],
          },
        }),
      ]),
      DialogService,
      ConfirmationService,
      MessageService,
    ],
  },
];
