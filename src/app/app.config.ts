import { ApplicationConfig, importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { PreloadAllModules, provideRouter, withEnabledBlockingInitialNavigation, withPreloading, } from '@angular/router';
import { appRoutes } from './app.routes';
import { HttpClient, provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
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
import { PublicClientApplication, InteractionType, BrowserCacheLocation, LogLevel } from '@azure/msal-browser';
import { MsalInterceptor, MSAL_INSTANCE, MSAL_GUARD_CONFIG, MSAL_INTERCEPTOR_CONFIG, MsalGuardConfiguration, MsalInterceptorConfiguration, MsalService, MsalGuard, MsalBroadcastService } from '@azure/msal-angular';

export function MSALInstanceFactory(): PublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: process.env["NX_AZURE_CLIENT_ID"] || 'your-client-id',
      authority: process.env["NX_AZURE_AUTHORITY_URL"] || 'https://login.microsoftonline.com/your-tenant-id',
      redirectUri: 'http://localhost:4200',
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
    }
  });
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set(`${process.env["NX_BASE_DPS_URL"]}/*`, ['User.Read']);
  return {
    interactionType: InteractionType.Popup,
    protectedResourceMap,
  };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Popup,
    authRequest: {
      scopes: ['User.Read'],
    },
  };
}

export function initializeMsal(msal: MsalService) {
  return () => msal.instance.initialize();
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
      useFactory: MSALInstanceFactory,
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory,
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory,
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeMsal,
      deps: [MsalService],
      multi: true
    },
    provideHttpClient(withInterceptorsFromDi()),
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

