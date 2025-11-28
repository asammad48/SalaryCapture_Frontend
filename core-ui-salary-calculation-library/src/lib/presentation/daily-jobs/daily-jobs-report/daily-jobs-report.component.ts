import { Component, ViewChild } from '@angular/core';
import { ProgressLoadingComponent } from '../../shared/progress-loading/progress-loading.component';
import { AccordionModule } from 'primeng/accordion';
import { TableModule, Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { CheckboxModule } from 'primeng/checkbox';
import { FullCalendarModule } from '@fullcalendar/angular';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DailyJobsReportDto } from 'core-ui-salary-calculation-library/src/lib/core/domain/models/DailyJobs/daily-jobs-grouped-response';
import { DailyJobsService } from 'core-ui-salary-calculation-library/src/lib/data/repositories/daily-jobs/daily-jobs.service';
import { PagedRequest } from 'core-ui-salary-calculation-library/src/lib/core/domain/models/shared/paged-request.model';
import { Popover, PopoverModule } from 'primeng/popover';
import { DatePicker } from 'primeng/datepicker';
import { DailyJobsReportFilterRequest } from 'core-ui-salary-calculation-library/src/lib/core/domain/requests/daily-jobs-report-filter.request';

@Component({
  selector: 'lib-daily-jobs-report',
  templateUrl: './daily-jobs-report.component.html',
  imports: [
    CommonModule,
    BreadcrumbModule,
    FormsModule,
    TableModule,
    ButtonModule,
    MenuModule,
    CheckboxModule,
    AccordionModule,
    FullCalendarModule,
    AutoCompleteModule,
    DropdownModule,
    ReactiveFormsModule,
    TooltipModule,
    SkeletonModule,
    PaginatorModule,
    ProgressLoadingComponent,
    PopoverModule,
    DatePicker
  ]
})
export class DailyJobsReportComponent {

  @ViewChild('groupDateFilter') groupDateFilter!: Popover;
  groupDateFilterValue: Date | null = null;

  @ViewChild('groupDailyJobsReportTable') groupDataTable!: Table;

  isGroupFilterApplied = false;
  groupAppliedFilters: { key: string; label: string; value: string }[] = [];
  isGroupDismissable = true;

  workerJobsReports: DailyJobsReportDto[] = [];
  isLoadingWorkerJobsReport: boolean = false;
  expandedRows: { [key: string]: boolean } = {};

  pageNumber: number = 1;
  pageSize: number = 10;
  first: number = 0;

  totalRecords: number = 0;
  rowsPerPageOptions: number[] = [10, 20, 50, 100];

  constructor(private readonly dailyJobsService: DailyJobsService) { }

  ngOnInit() {
    this.loadWorkerDailyJobsReport();
  }

  loadWorkerDailyJobsReport() {
    
    this.isLoadingWorkerJobsReport = true;

    const request: PagedRequest<DailyJobsReportFilterRequest> = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      filters: this.createFilterRequest()
    };

    this.dailyJobsService.getWorkerDailyJobsReport(request).subscribe({

      next: (response) => {

        if (response.success) {
          const pageData = response.data;
          this.workerJobsReports = pageData.items;
          this.totalRecords = pageData.totalCount;
          this.pageNumber = pageData.pageNumber;
          this.pageSize = pageData.pageSize;
        }

        this.expandSingleGroupIfApplicable();

      },

      error: (error) => {
        console.error('Error loading worker daily jobs report:', error);
      },

      complete: () => {
        this.isLoadingWorkerJobsReport = false;
      }

    });

  }

  private expandSingleGroupIfApplicable(): void {

    this.expandedRows = {};

    if (this.workerJobsReports.length === 1) {

      const singleGroup = this.workerJobsReports[0];

      if (singleGroup && singleGroup.productionDate) {
        this.expandedRows[singleGroup.productionDate] = true;
      }

    }

  }
  

  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.pageSize = event.rows ?? 10;
    this.pageNumber = Math.floor(this.first / this.pageSize) + 1;

    this.expandedRows = {};
    this.loadWorkerDailyJobsReport(); 
  }

  onRowExpand(event: any) {
    this.expandedRows[event.data.productionDate] = true;
  }

  onRowCollapse(event: any) {
    delete this.expandedRows[event.data.productionDate];
  }

  removeGroupFilters(key: string): void {
    switch (key) {
        case 'productionDate':
            this.groupDateFilterValue = null;
            break;
    }

    this.resetGroupPagination();
    this.loadWorkerDailyJobsReport();
    this.refreshAppliedGroupFilters();
  }

  hideGroupFilters() {
    this.groupDateFilter.hide();
  }

  applyGroupFilters() {
    this.hideGroupFilters();
    this.resetGroupPagination();
    this.loadWorkerDailyJobsReport();
    this.refreshAppliedGroupFilters();
  }

  resetGroupFilters() {
      this.groupDateFilterValue = null;
      this.hideGroupFilters();
      this.resetGroupPagination();
      this.loadWorkerDailyJobsReport();
      this.groupAppliedFilters = [];
      this.isGroupFilterApplied = false;
  }

  resetGroupPagination() {
    this.pageNumber = 1;
    if (this.groupDataTable) {
        this.groupDataTable.reset();
    }
  }

  private refreshAppliedGroupFilters(): void {

    const filterReq = this.createFilterRequest();

    const applied: { key: string; label: string; value: string }[] = [];
    
    if (filterReq.productionDate) {
      applied.push({
          key: 'productionDate',
          label: 'Date',
          value: filterReq.productionDate || ''
      });
    }

    this.groupAppliedFilters = applied;

    this.isGroupFilterApplied = this.groupAppliedFilters.length > 0;
  }

  private createFilterRequest(): DailyJobsReportFilterRequest {

      const filter: DailyJobsReportFilterRequest = {
          productionDate: null,
      };

      filter.productionDate = this.groupDateFilterValue ? this.formatDateToString(this.groupDateFilterValue) : null;  
          
      return filter;
  }

  private formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

}