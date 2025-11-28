import { Component, Injector } from '@angular/core';
import { Subject } from 'rxjs';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { LoaderService } from '../../../data/shared/loader.service';
import { Client } from '../../../data/api-clients/daily-planning-api.client';
import { DailyPlanningAccessService } from '../../../data/repositories/access/daily-planning-access.service';

@Component({
  template: '',
  standalone: false,
})
export abstract class DailyPlanningPortalBase {
  public destroyer$: Subject<boolean> = new Subject<boolean>();
  public dialogService: DialogService;
  public messageService: MessageService;
  public translate: TranslateService;
  public confirmationService: ConfirmationService;
  public router: Router;
  public dialogRef: DynamicDialogRef | undefined;
  public loaderService: LoaderService;
  public apiClient: Client;
  public accessService: DailyPlanningAccessService;
  private readonly BASE_PLAN_ROUTE = 'base-plan';
  protected constructor(injector: Injector) {
    this.dialogService = injector.get(DialogService);
    this.confirmationService = injector.get(ConfirmationService);
    this.translate = injector.get(TranslateService);
    this.messageService = injector.get(MessageService);
    this.router = injector.get(Router);
    this.loaderService = injector.get(LoaderService);
    this.apiClient = injector.get(Client);
    this.accessService = injector.get(DailyPlanningAccessService);
  }

  isBasePlanRoute(): boolean {
    return this.router.url.includes(this.BASE_PLAN_ROUTE);
  }
}
