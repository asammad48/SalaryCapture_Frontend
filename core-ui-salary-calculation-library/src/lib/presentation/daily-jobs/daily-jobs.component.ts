import { Component, OnInit } from '@angular/core';
import { ProgressLoadingComponent } from '../shared/progress-loading/progress-loading.component';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { DailyJobsPaths, DailyJobsTabs } from '../../core/domain/constants/application-constants';
import { TabsModule } from 'primeng/tabs';
import { DailyJobsListComponent } from './daily-jobs-list/daily-jobs-list.component';
import { DailyJobsReportComponent } from './daily-jobs-report/daily-jobs-report.component';

@Component({
  selector: 'app-daily-jobs',
  templateUrl: './daily-jobs.component.html',
  imports: [
    BreadcrumbModule,
    TabsModule,
    DailyJobsListComponent,
    DailyJobsReportComponent
  ]
})

export class DailyJobsComponent implements OnInit {

    DailyJobsTabs = DailyJobsTabs;
    DailyJobsPaths = DailyJobsPaths;

    activeTab: string = DailyJobsPaths.DAILY_JOBS_REPORT;
    
    items: MenuItem[] = [];
    home: MenuItem | undefined;

    constructor() {
        this.initializeBreadcrumbs();
    }

    ngOnInit(): void {
        
    }

    private initializeBreadcrumbs() {
        this.items = [{ label: 'Daily Jobs' }];
        this.home = { label: 'Salary Calculation Portal', routerLink: '' };
    }

    switchTab(currentTab:string){ 
        this.activeTab = currentTab;
    }

}
