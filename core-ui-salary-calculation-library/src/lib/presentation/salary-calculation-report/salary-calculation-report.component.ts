import { OnDestroy } from '@angular/core';
import { map, Subject, takeUntil } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Breadcrumb } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { SalaryReportFiltersComponent } from './salary-report-filters/salary-report-filters.component';
import { TableModule } from 'primeng/table';
import { animate, style, transition, trigger } from '@angular/animations';
import { Router, RouterModule } from '@angular/router';
import { SalaryReportRow } from '../../core/domain/models/responses/salary-report-row-response';
import { SalaryReportSummary } from '../../core/domain/models/responses/salary-report-summary';
import { ApiResponse } from '../../core/domain/models/shared/response.model';
import { SalaryReportRequest } from '../../core/domain/requests/salary-report.request';
import { SalaryReportsService } from '../../data/repositories/salary-report/salary-report.service';
import { ROUTE_PATHS } from '../../core/domain/constants/route-paths';
import { ProgressLoadingComponent } from "../shared/progress-loading/progress-loading.component";
import { WarningBannerComponent } from "../shared/warning-banner";
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'lib-salary-calculation-report',
  imports: [
    CommonModule,
    TableModule,
    Breadcrumb,
    RouterModule,
    SalaryReportFiltersComponent,
    ProgressLoadingComponent,
    WarningBannerComponent,
    TooltipModule
],
  templateUrl: './salary-calculation-report.component.html',
   animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, height: '0px', overflow: 'hidden' }),
        animate('300ms ease-out', style({ opacity: 1, height: '*' })),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ opacity: 0, height: '0px', overflow: 'hidden' })
        ),
      ]),
    ]),
  ],
})

export class SalaryCalculationReportComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject<void>();

  salaryReports$: SalaryReportRow[] = [];
  filteredSalaryReport: SalaryReportSummary = {};

  items: MenuItem[] = [];
  home: MenuItem | undefined;

  filtersApplied = false;
  filterPanelCollapsed = false;

  // showWarning = false;
  // warningMessage: string | undefined = undefined;

  constructor(
    private readonly salaryReportsService: SalaryReportsService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {

    this.items = [{ label: 'Salary Report' }];

    this.home = {
      label: 'Salary Calculation Portal',
      routerLink: '/salary-calculations-report',
    };

  }

  filterPanelToggler(event: any) {
    this.filterPanelCollapsed = event;
  }

  // toggleWarning() {
  //   this.showWarning = !this.showWarning;
  // }

  navigateToExportReports(): void {
    this.router.navigate([ROUTE_PATHS.EXPORT_REPORTS]);
  }
hasPendingReports() : boolean{
  return this.salaryReports$.some(item => item.pending ?? 0 > 0);
}

  exportReports() {

    if(!this.filteredSalaryReport) return;

    const request: SalaryReportRequest = {
      areaId: this.filteredSalaryReport.organizationUnitId,
      fromDate: this.filteredSalaryReport?.fromDate,
      toDate: this.filteredSalaryReport?.toDate,
    };

    this.salaryReportsService.exportSalaryReport(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({

        next: (response) => {
          this.salaryReports$ = [];
          this.filteredSalaryReport = {};
          // this.warningMessage = undefined;
          // this.showWarning = false;
          this.navigateToExportReports();
        },

        error: (error) => {
          console.error('Error exporting salary report:', error);
        }

    });

  }


  onFiltersApplied($event: SalaryReportRequest): void {
    this.filtersApplied = true;
    this.getFilteredSalaryReport($event);
  }

  private getFilteredSalaryReport(request: SalaryReportRequest) {

    this.salaryReportsService.getFilteredSalaryReport(request).pipe(
      takeUntil(this.destroy$),
      map((response: ApiResponse<SalaryReportSummary> | undefined) => {

        if (!response?.data) {
          return this.getDefaultReportStructure();
        }

        const data = response.data;
        this.filteredSalaryReport = data;

        const totalSalaryLines = data.totalSalaryLines ?? 0;
        const pendingSalaryLines = data.pendingSalaryLines ?? 0;
        const approvedSalaryLines = data.approvedSalaryLines ?? 0;
        const rejectedSalaryLines = data.rejectedSalaryLines ?? 0;
        const approvedProcessed = data.approvedProcessed ?? 0;
        const approvedUnprocessed = data.approvedUnprocessed ?? 0;

        return [
          {
            label: 'Service Workers',
            total: data.totalServiceWorkers ?? 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            approvedProcessed: 0,
            approvedUnprocessed: 0,
          },
          {
            label: 'Job Salary Lines',
            total: data.jobSalaryLines ?? 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            approvedProcessed: 0,
            approvedUnprocessed: 0,
          },
          {
            label: 'Manual Salary Lines',
            total: totalSalaryLines,
            pending: pendingSalaryLines,
            approved: approvedSalaryLines,
            rejected: rejectedSalaryLines,
            approvedProcessed: approvedProcessed,
            approvedUnprocessed: approvedUnprocessed,
          }
        ];

      })

    ).subscribe({

      next: (salaryReports) => {
        this.salaryReports$ = salaryReports;
      },

      error: (error) => {
        console.error('Error fetching salary reports:', error);
        this.salaryReports$ = this.getDefaultReportStructure();
      }

    });

  }

  private getDefaultReportStructure(): SalaryReportRow[] {
    return [
      {
        label: 'Service Workers',
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      },
      {
        label: 'Job Salary Lines',
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      },
      {
        label: 'Manual Salary Lines',
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      }
    ];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
