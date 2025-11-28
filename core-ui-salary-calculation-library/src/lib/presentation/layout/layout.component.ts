import { Component, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { SidebarStartComponent } from './sidebar-start/sidebar-start.component';
import { RouterOutlet } from '@angular/router';
import { SalaryCalculationPortalBase } from '../base/salary-calculation-base/salary-calculation.base';
import { Title } from '@angular/platform-browser';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'lib-layout',
    imports: [CommonModule, SidebarStartComponent, HeaderComponent, RouterOutlet, ToastModule],
    templateUrl: './layout.component.html',
    styleUrls: [],
    providers: [Title, MessageService, DialogService, ConfirmationService]
})
export class LayoutComponent extends SalaryCalculationPortalBase {

  constructor(inject: Injector) {
    super(inject);
  }

}
