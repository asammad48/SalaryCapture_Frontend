import { MsalGuardConfiguration, MsalInterceptorConfiguration } from '@azure/msal-angular';
import { BrowserCacheLocation, InteractionType, IPublicClientApplication, LogLevel, PublicClientApplication } from '@azure/msal-browser';

const isIE = typeof window !== 'undefined' && 
  window.navigator.userAgent.indexOf('MSIE ') > -1 || 
  window.navigator.userAgent.indexOf('Trident/') > -1;

export function MSALInstanceFactory(): IPublicClientApplication {
  const clientId = process.env['NX_MSAL_CLIENT_ID'] || '00000000-0000-0000-0000-000000000000';
  
  return new PublicClientApplication({
    auth: {
      clientId: clientId,
      authority: process.env['NX_MSAL_AUTHORITY'] || 'https://login.microsoftonline.com/common',
      redirectUri: process.env['NX_MSAL_REDIRECT_URI'] || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4200'),
      postLogoutRedirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4200',
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
    },
    system: {
      loggerOptions: {
        loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
          if (containsPii) {
            return;
          }
          switch (level) {
            case LogLevel.Error:
              console.error(message);
              return;
            case LogLevel.Info:
              console.info(message);
              return;
            case LogLevel.Verbose:
              console.debug(message);
              return;
            case LogLevel.Warning:
              console.warn(message);
              return;
          }
        },
        logLevel: LogLevel.Warning,
        piiLoggingEnabled: false
      }
    }
  });
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  
  const baseApiUrl = process.env['NX_BASE_DPS_URL'] || '';
  if (baseApiUrl) {
    protectedResourceMap.set(baseApiUrl + '/*', ['api://' + (process.env['NX_MSAL_CLIENT_ID'] || '') + '/access_as_user']);
  }
  
  protectedResourceMap.set('https://graph.microsoft.com/v1.0/me', ['user.read']);

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: ['user.read', 'openid', 'profile', 'email']
    },
    loginFailedRoute: '/accounts/login'
  };
}
