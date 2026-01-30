import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterModule, RouterOutlet} from '@angular/router';
import {filter, map, Subject, takeUntil, switchMap, of} from "rxjs";
import {Title} from "@angular/platform-browser";
import {TranslateService} from "@ngx-translate/core";
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { InteractionStatus, AuthenticationResult } from '@azure/msal-browser';
import { DailyPlanningAccessService } from '../../core-ui-daily-planning-library/src/lib/data/repositories/access/daily-planning-access.service';
import { LocalStorageKeys } from '../../core-ui-daily-planning-library/src/lib/data/repositories/access/local-storage-keys';
import { LocalStorageService } from '../../core-ui-daily-planning-library/src/lib/presentation/services/local-storage.service';

@Component({
    selector: 'app-root',
    imports: [RouterModule, RouterOutlet],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy{
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private title: Title,
    private router: Router,
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private accessService: DailyPlanningAccessService,
    private localStorageService: LocalStorageService,
    translate: TranslateService
  ) {
      translate.setDefaultLang('en');
      translate.use('en');
  }

  ngOnInit(): void {
      this.msalService.handleRedirectObservable().subscribe({
        next: (result: AuthenticationResult) => {
          if (result && result.account) {
            this.msalService.instance.setActiveAccount(result.account);
            
            // 1. Store ID Token Claims
            if (result.idTokenClaims) {
              localStorage.setItem('id_token_claims', JSON.stringify(result.idTokenClaims));
            }

            // 2. Fetch Role Claims (GetRoleClaims) and Areas (GetUserAssignedAreasAndSubAreas)
            this.accessService.getRoleClaims().pipe(
              switchMap((res: any) => {
                const claims = Array.isArray(res?.data) ? res.data : [];
                this.localStorageService.add(LocalStorageKeys.ROLE_CLAIMS, claims);
                this.accessService.refreshClaims();
                return this.accessService.fetchAndSaveUserRegions();
              }),
              takeUntil(this.destroy$)
            ).subscribe({
              next: () => console.log('Claims and Regions loaded successfully'),
              error: (err) => console.error('Error loading claims/regions:', err)
            });
          }
        },
        error: (error) => console.error('MSAL Redirect Error:', error)
      });

      this.msalBroadcastService.inProgress$
        .pipe(
          filter((status: InteractionStatus) => status === InteractionStatus.None),
          takeUntil(this.destroy$)
        )
        .subscribe(() => {
          this.checkAndLogin();
        });

      this.setPageTitle();
  }

  private checkAndLogin() {
    if (this.msalService.instance.getAllAccounts().length === 0) {
      this.msalService.loginRedirect();
    }
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
