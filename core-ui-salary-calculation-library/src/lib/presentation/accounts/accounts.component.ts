import {Component, Injector, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {ToastModule} from "primeng/toast";
import {OverlayModule} from "primeng/overlay";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {Title} from "@angular/platform-browser";
import {ConfirmationService, MessageService} from "primeng/api";
import {DialogService} from "primeng/dynamicdialog";
import { SalaryCalculationPortalBase } from '../base/salary-calculation-base/salary-calculation.base';

@Component({
    selector: 'core-ui-vehicle-portal-accounts',
    imports: [
        CommonModule,
        RouterOutlet,
        ToastModule,
        OverlayModule,
        ConfirmDialogModule,
    ],
    providers: [Title, MessageService, DialogService, ConfirmationService],
    templateUrl: './accounts.component.html',
    styles: []
})
export class AccountsComponent
    extends SalaryCalculationPortalBase
    implements OnDestroy
{
  constructor(inject: Injector) {
    super(inject);
  }

  ngOnDestroy() {
    this.destroyer$.next(true);
    this.destroyer$.unsubscribe();
  }
}

