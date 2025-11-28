import { ApplicationConfig, importProvidersFrom, } from '@angular/core';
import { PreloadAllModules, provideRouter, withEnabledBlockingInitialNavigation, withPreloading, } from '@angular/router';
import { appRoutes } from './app.routes';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
// eslint-disable-next-line @nx/enforce-module-boundaries
import Aura from '@primeng/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { defaultInterceptor, tenantInterceptor } from 'core-ui-salary-calculation-library/src/lib/presentation/base/utils/interceptors';
import { tokenInterceptor } from 'core-ui-salary-calculation-library/src/lib/presentation/base/utils/interceptors/token.interceptor';
import { loaderInterceptor } from 'core-ui-salary-calculation-library/src/lib/presentation/base/utils/interceptors/loader.interceptor';
import { errorInterceptor } from 'core-ui-salary-calculation-library/src/lib/presentation/base/utils/interceptors/error.interceptor';
import { MessageService } from 'primeng/api';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export const appConfig: ApplicationConfig = {
  providers: [
    MessageService,
    provideHttpClient(withInterceptors([loaderInterceptor])),
    importProvidersFrom([
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
        isolate: false,
        extend: true,
      }),
    ]),
    provideRouter(appRoutes, withEnabledBlockingInitialNavigation(),
      withPreloading(PreloadAllModules)),
    provideAnimations(),
    provideHttpClient(
      withInterceptors(
        [
          defaultInterceptor,
          tenantInterceptor,
          tokenInterceptor,
          errorInterceptor
      ]
    )),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark-mode',
          cssLayer: {
            name: 'primeng',
          },
        },
      },
    }),
  ]
};

