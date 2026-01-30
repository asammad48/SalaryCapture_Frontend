import { Injectable } from '@angular/core';
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { MsalService } from '@azure/msal-angular';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private readonly msalService: MsalService) {
    console.log('AuthService initialized');
  }

  async getAccessToken(apiScope: string): Promise<string | null> {
    let activeAccount = this.msalService.instance.getActiveAccount();
    if (
      !activeAccount &&
      this.msalService.instance.getAllAccounts().length > 0
    ) {
      let accounts = this.msalService.instance.getAllAccounts();
      this.msalService.instance.setActiveAccount(accounts[0]);
      activeAccount = accounts[0];
    }
    if (activeAccount) {
      try {
        const response = await firstValueFrom(
          this.msalService.acquireTokenSilent({
            account: activeAccount,
            scopes: [apiScope],
          })
        );
        // Requirement: Insert all of the Claim in Storage as it is
        if (response.idTokenClaims) {
          localStorage.setItem('id_token_claims', JSON.stringify(response.idTokenClaims));
        }
        return response.accessToken;
      } catch (error) {
        console.error('Token acquisition failed', error);
          if (error instanceof InteractionRequiredAuthError) {
            // Fallback to default scopes if specific API scope fails
            try {
               const response = await firstValueFrom(
                  this.msalService.acquireTokenSilent({
                    account: activeAccount,
                    scopes: ['openid', 'profile'],
                  })
                );
                return response.accessToken;
            } catch (innerError) {
              this.msalService.logoutRedirect();
              localStorage.clear();
              sessionStorage.clear();
            }
        }
        return null;
      }
    }
    return null;
  }

  logout() {
    this.msalService.logoutRedirect();
  }
}
