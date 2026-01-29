import { ApplicationConfig, APP_INITIALIZER, importProvidersFrom, } from '@angular/core';
import { PreloadAllModules, provideRouter, withEnabledBlockingInitialNavigation, withPreloading, } from '@angular/router';
import { appRoutes } from './app.routes';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import Aura from '@primeng/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { defaultInterceptor, tenantInterceptor } from 'core-ui-admin-library/src/lib/presentation/base/utils/interceptors';
import { tokenInterceptor } from 'core-ui-admin-library/src/lib/presentation/base/utils/interceptors/token.interceptor';
import { loaderInterceptor } from 'core-ui-admin-library/src/lib/presentation/base/utils/interceptors/loader.interceptor';
import { errorInterceptor } from 'core-ui-admin-library/src/lib/presentation/base/utils/interceptors/error.interceptor';
import { MessageService } from 'primeng/api';
import { API_BASE_URL, Client } from 'core-ui-admin-library/src/lib/data/api-clients/admin-api.client';
import { MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, MsalBroadcastService, MsalGuard, MsalInterceptor, MsalService } from '@azure/msal-angular';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MSALGuardConfigFactory, MSALInstanceFactory, MSALInterceptorConfigFactory } from 'core-ui-admin-library/src/lib/presentation/base/utils/auth/msal.config';
import { IPublicClientApplication } from '@azure/msal-browser';

export function initializeMsalFactory(msalInstance: IPublicClientApplication): () => Promise<void> {
  return () => msalInstance.initialize();
}

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export const appConfig: ApplicationConfig = {
  providers: [
    MessageService,
    Client,
    {
      provide: API_BASE_URL,
      useValue: process.env["NX_BASE_DPS_URL"]
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeMsalFactory,
      deps: [MSAL_INSTANCE],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
    provideHttpClient(
      withInterceptors(
        [
          loaderInterceptor,
          defaultInterceptor,
          tenantInterceptor,
          tokenInterceptor,
          errorInterceptor
      ]
    )),
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
