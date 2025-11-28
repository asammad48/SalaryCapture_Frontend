import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterModule, RouterOutlet} from '@angular/router';
import {filter, map, Subject, takeUntil} from "rxjs";
import {Title} from "@angular/platform-browser";
import {TranslateService} from "@ngx-translate/core";

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
    translate: TranslateService
  ) {
      translate.setDefaultLang('en');
      translate.use('en');
  }

  ngOnInit(): void {
      this.setPageTitle();
  }

  ngOnDestroy() {
      this.destroy$.next(true);
      this.destroy$.complete(); // ensure subject is completed to avoid memory leaks
  }


  private setPageTitle(): void {
      const defaultPageTitle = 'Salary Calculation Portal';

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
