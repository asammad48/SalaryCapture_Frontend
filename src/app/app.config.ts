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
import { defaultInterceptor, tenantInterceptor } from 'core-ui-admin-library/src/lib/presentation/base/utils/interceptors';
import { tokenInterceptor } from 'core-ui-admin-library/src/lib/presentation/base/utils/interceptors/token.interceptor';
import { loaderInterceptor } from 'core-ui-admin-library/src/lib/presentation/base/utils/interceptors/loader.interceptor';
import { errorInterceptor } from 'core-ui-admin-library/src/lib/presentation/base/utils/interceptors/error.interceptor';
import { MessageService } from 'primeng/api';
import { API_BASE_URL, Client } from 'core-ui-admin-library/src/lib/data/api-clients/admin-api.client';
import { IPublicClientApplication, PublicClientApplication, InteractionType, BrowserCacheLocation, LogLevel } from '@azure/msal-browser';
import { MsalInterceptor, MSAL_INSTANCE, MSAL_GUARD_CONFIG, MSAL_INTERCEPTOR_CONFIG, MsalGuardConfiguration, MsalInterceptorConfiguration, MsalService, MsalGuard, MsalBroadcastService } from '@azure/msal-angular';

// MSAL configuration
export function loggerCallback(logLevel: LogLevel, message: string) {
  console.log(message);
}

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: process.env["MSAL_CLIENT_ID"] || 'ENTER_CLIENT_ID_HERE',
      authority: process.env["MSAL_AUTHORITY"] || 'https://login.microsoftonline.com/common',
      redirectUri: window.location.origin,
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
      secureCookies: true,
    },
    system: {
      loggerOptions: {
        loggerCallback,
        logLevel: LogLevel.Info,
        piiLoggingEnabled: false
      }
    }
  });
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  // Add protected resources here if needed
  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: ['user.read']
    }
  };
}

// AoT requires an exported function for factories
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
    MsalService,
    MsalGuard,
    MsalBroadcastService,
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

