import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { filter, map, Subject, takeUntil } from "rxjs";
import { Title } from "@angular/platform-browser";
import { TranslateService } from "@ngx-translate/core";
import { MsalService, MsalBroadcastService } from "@azure/msal-angular";
import { InteractionStatus, AuthenticationResult } from "@azure/msal-browser";
import { AccessService } from 'core-ui-admin-library/src/lib/data/repositories/access/access.service';
import { LocalStorageKeys } from 'core-ui-admin-library/src/lib/data/repositories/access/local-storage-keys';
import { LocalStorageService } from 'core-ui-admin-library/src/lib/presentation/services/local-storage.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private title: Title,
    private router: Router,
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private accessService: AccessService,
    private localStorage: LocalStorageService,
    translate: TranslateService
  ) {
    translate.setDefaultLang('en');
    translate.use('en');
  }

  ngOnInit(): void {
    this.handleMsalRedirect();
    this.setPageTitle();
    this.checkAndFetchUserData();
  }

  private checkAndFetchUserData(): void {
    const account = this.msalService.instance.getActiveAccount() || this.msalService.instance.getAllAccounts()[0];
    if (account) {
      const claims = this.localStorage.get(LocalStorageKeys.ROLE_CLAIMS);
      const regions = this.localStorage.get(LocalStorageKeys.USER_REGIONS);

      if (!claims || !regions) {
        this.fetchUserData();
      }
    }
  }

  private fetchUserData(): void {
    forkJoin({
      claims: this.accessService.fetchAndSaveRoleClaims(),
      regions: this.accessService.fetchAndSaveUserRegions()
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => console.log('AppComponent: User data fetched and saved'),
        error: (err) => console.error('AppComponent: Error fetching user data', err)
      });
  }

  private handleMsalRedirect(): void {
    this.msalService.handleRedirectObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: AuthenticationResult | null) => {
          if (result && result.account) {
            this.msalService.instance.setActiveAccount(result.account);
            this.localStorage.add(LocalStorageKeys.ACCESS_TOKEN, result.accessToken);
            this.fetchUserData();
            this.router.navigateByUrl('/daily-planning/base-plan');
            console.log('AppComponent: MSAL Redirect handled successfully', result);
          }
        },
        error: (error) => {
          if (error.errorCode !== 'no_token_request_cache_error') {
            console.error('AppComponent: MSAL Redirect error', error);
          }
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();  // ensure subject is completed to avoid memory leaks
  }


  private setPageTitle(): void {
    const defaultPageTitle = 'Daily Planning Portal';

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          let child = this.activatedRoute.firstChild;

          if (!child) {
            return (
              this.activatedRoute.snapshot.data['title'] || defaultPageTitle
            );
          }

          while (child.firstChild) {
            child = child.firstChild;
          }

          if (child.snapshot.data['title']) {
            return child.snapshot.data['title'];
          }
        })
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((title: string) =>
        this.title.setTitle(`${title} - ${defaultPageTitle}`)
      );
  }
}
