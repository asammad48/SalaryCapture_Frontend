import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MSAL_GUARD_CONFIG, MsalGuardConfiguration, MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { AccountInfo, AuthenticationResult, EventMessage, EventType, InteractionStatus, RedirectRequest } from '@azure/msal-browser';
import { Subject, filter, takeUntil } from 'rxjs';
import { LocalStorageService } from '../../../services/local-storage.service';
import { LocalStorageKeys } from 'core-ui-admin-library/src/lib/data/repositories/access/local-storage-keys';

@Injectable({
  providedIn: 'root'
})
export class MsalAuthService {
  private readonly _destroying$ = new Subject<void>();
  
  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private router: Router,
    private localStorageService: LocalStorageService
  ) {
    this.initializeMsal();
  }

  private isInProgress = false;

  private initializeMsal(): void {
    this.msalBroadcastService.inProgress$
      .pipe(
        takeUntil(this._destroying$)
      )
      .subscribe((status: InteractionStatus) => {
        this.isInProgress = status !== InteractionStatus.None;
        if (status === InteractionStatus.None) {
          this.checkAndSetActiveAccount();
        }
      });

    this.msalService.instance.handleRedirectPromise().then(result => {
      if (result) {
        console.log('MSAL Redirect Result:', result);
        const payload = result;
        this.msalService.instance.setActiveAccount(payload.account);
        this.storeTokenData(payload);
        
        // After processing the redirect, clean up the URL hash to prevent re-triggering
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }
      this.checkAndSetActiveAccount();
    }).catch(error => {
      console.error('MSAL Redirect Error:', error);
    });

    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS || msg.eventType === EventType.HANDLE_REDIRECT_END),
        takeUntil(this._destroying$)
      )
      .subscribe((result: EventMessage) => {
        if (result.eventType === EventType.LOGIN_SUCCESS) {
          const payload = result.payload as AuthenticationResult;
          this.msalService.instance.setActiveAccount(payload.account);
          this.storeTokenData(payload);
        }
        this.checkAndSetActiveAccount();
      });

    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGOUT_SUCCESS),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.clearAuthData();
      });
  }

  private checkAndSetActiveAccount(): void {
    const activeAccount = this.msalService.instance.getActiveAccount();
    
    if (!activeAccount && this.msalService.instance.getAllAccounts().length > 0) {
      const accounts = this.msalService.instance.getAllAccounts();
      this.msalService.instance.setActiveAccount(accounts[0]);
    }
  }

  private storeTokenData(authResult: AuthenticationResult): void {
    if (authResult.accessToken) {
      this.localStorageService.add(LocalStorageKeys.ACCESS_TOKEN, authResult.accessToken);
    }
    
    if (authResult.account) {
      this.localStorageService.add(LocalStorageKeys.FIRST_NAME, authResult.account.name || '');
      this.localStorageService.add(LocalStorageKeys.EMAIL, authResult.account.username || '');
    }
  }

  private clearAuthData(): void {
    this.localStorageService.remove(...Object.values(LocalStorageKeys));
  }

  login(): void {
    if (this.isInProgress) {
      console.warn('MSAL: Interaction already in progress');
      return;
    }
    
    if (this.msalGuardConfig.authRequest) {
      this.msalService.loginRedirect({
        ...this.msalGuardConfig.authRequest
      } as RedirectRequest);
    } else {
      this.msalService.loginRedirect();
    }
  }

  logout(): void {
    this.msalService.logoutRedirect({
      postLogoutRedirectUri: window.location.origin
    });
  }

  isAuthenticated(): boolean {
    return this.msalService.instance.getAllAccounts().length > 0;
  }

  getActiveAccount(): AccountInfo | null {
    return this.msalService.instance.getActiveAccount();
  }

  getAccessToken(): string | null {
    return this.localStorageService.get(LocalStorageKeys.ACCESS_TOKEN);
  }

  destroy(): void {
    this._destroying$.next();
    this._destroying$.complete();
  }
}
