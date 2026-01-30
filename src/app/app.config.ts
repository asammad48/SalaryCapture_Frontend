import { ApplicationConfig, importProvidersFrom, } from '@angular/core';
import { PreloadAllModules, provideRouter, withEnabledBlockingInitialNavigation, withPreloading, } from '@angular/router';
import { appRoutes } from './app.routes';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import Aura from '@primeng/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import { API_BASE_URL, Client } from 'core-ui-admin-library/src/lib/data/api-clients/admin-api.client';

import { 
  IPublicClientApplication, 
  PublicClientApplication, 
  InteractionType, 
  BrowserCacheLocation, 
  LogLevel 
} from '@azure/msal-browser';
import { 
  MsalInterceptor, 
  MSAL_INSTANCE, 
  MsalService, 
  MSAL_GUARD_CONFIG, 
  MSAL_INTERCEPTOR_CONFIG, 
  MsalGuardConfiguration, 
  MsalInterceptorConfiguration, 
  MsalGuard, 
  MsalBroadcastService 
} from '@azure/msal-angular';
import { environment } from '../environment';
import { tokenInterceptor } from './token.interceptor';

export function loggerCallback(logLevel: LogLevel, message: string) {
  console.log(message);
}

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.NX_CLIENTID,
      authority: environment.NX_AUTHORITY,
      redirectUri: environment.NX_REDIRECT_URL,
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
    },
    system: {
      loggerOptions: {
        loggerCallback,
        logLevel: LogLevel.Info,
        piiLoggingEnabled: false,
      },
    },
  });
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  // Map API URLs to their respective scopes. If specific scopes are unknown, openid/profile is used as a baseline.
  protectedResourceMap.set(environment.NX_BASE_AM_URL, environment.NX_SCOPES);
  protectedResourceMap.set(environment.apiUrl, environment.NX_SCOPES);

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap,
  };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: environment.NX_SCOPES,
    },
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
      useValue: environment.NX_BASE_DPS_URL ? environment.NX_BASE_DPS_URL + '/api' : environment.NX_BASE_AM_URL
    },
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
          tokenInterceptor
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
  ]
};

