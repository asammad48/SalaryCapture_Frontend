import {Route} from '@angular/router';
import {importProvidersFrom} from "@angular/core";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {HttpClient, provideHttpClient, withInterceptors} from "@angular/common/http";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import {defaultInterceptor, tenantInterceptor} from "./presentation/base/utils/interceptors";
import {CoreModule} from "./core/core.module";
import {DataModule} from "./data/data.module";
import { tokenInterceptor } from './presentation/base/utils/interceptors/token.interceptor';
import { loaderInterceptor } from './presentation/base/utils/interceptors/loader.interceptor';

export const coreUiSalaryCalculationLibraryRoutes: Route[] = [
  {
    path: '',
    loadChildren: () =>
      import('./presentation/presentation.routes').then(
        (p) => p.PRESENTATION_ROUTES
      ),
      providers: [
        importProvidersFrom([
            CoreModule,
            DataModule,
            TranslateModule.forChild({
                isolate: false,
                extend: true,
                loader: {
                    provide: TranslateLoader,
                    useFactory: ((http: HttpClient) => {
                        return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
                    }),
                    deps: [HttpClient]
                }
            }),
        ]),
        provideHttpClient(withInterceptors([
            defaultInterceptor,
            tenantInterceptor,
            loaderInterceptor,
            tokenInterceptor
        ]))
    ]
  },
];
