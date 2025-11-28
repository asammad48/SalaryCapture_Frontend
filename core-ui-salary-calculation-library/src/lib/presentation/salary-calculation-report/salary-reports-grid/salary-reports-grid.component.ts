import { ExportStatus } from './../../../core/domain/enums/export-status';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { ExportedSalaryReportResponse } from 'core-ui-salary-calculation-library/src/lib/core/domain/models/responses/exported-salary-report-response';
import { Subject, takeUntil } from 'rxjs';
import { extractFileNameFromContentDisposition, formatDateToDDMMYYYY, formatDateWithTime, handleHttpErrorResponse } from 'core-ui-salary-calculation-library/src/lib/data/shared/helper.function';
import { SalaryReportsService } from 'core-ui-salary-calculation-library/src/lib/data/repositories/salary-report/salary-report.service';
import { SalaryReportFilterRequest } from 'core-ui-salary-calculation-library/src/lib/core/domain/requests/salary-report-filter.request';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem, MessageService } from 'primeng/api';
import { Popover, PopoverModule } from 'primeng/popover';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePicker } from 'primeng/datepicker';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProgressLoadingComponent } from "../../shared/progress-loading/progress-loading.component";

@Component({
  selector: 'lib-salary-reports-grid',
  imports: [CommonModule, TableModule, BreadcrumbModule, PopoverModule, CheckboxModule, DatePicker, ProgressLoadingComponent, ReactiveFormsModule, FormsModule],
  templateUrl: './salary-reports-grid.component.html',
})
export class SalaryReportsGridComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  exportedSalaryReports$: ExportedSalaryReportResponse[] = [];
  filteredReports: ExportedSalaryReportResponse[] = [];
  originalReports: ExportedSalaryReportResponse[] = [];
  appliedFilters: { key: string; label: string; value: string }[] = [];

  isLoadingSalaryReports = false;
  ExportStatus = ExportStatus;
  items: MenuItem[] = [];
  home: MenuItem | undefined;
  isDismissable = true;

  @ViewChild('statusFilter') statusFilter!: Popover;
  @ViewChild('areaFilter') areaFilter!: Popover;
  @ViewChild('regionFilter') regionFilter!: Popover;
  @ViewChild('dateFilter') dateFilter!: Popover;
  @ViewChild('dt') table!: Table;
  isFilterApplied:boolean = false;

  // Pagination properties
  rows = 20;
  first = 0;
  totalRecords = 0;
  rowsPerPageOptions = [20, 50, 100, 500, 5000];

  // Status filtering
  statusFilterForm: FormGroup;
  statusOptions: { key: string, label: string }[] = [];
  allStatusIndeterminate = false;
  selectedStatusFilters: string[] = [];

  // Other filters
  regionFilterValue = '';
  areaFilterValue = '';
  dateFilterValue: Date | null = null;

  constructor(
    private readonly salaryReportService: SalaryReportsService,
    private readonly messageService: MessageService,
    private readonly translateService: TranslateService,
    private readonly fb: FormBuilder
  ) {
    this.statusFilterForm = this.fb.group({ all: [false] });
    this.initializeStatusOptions();
  }

  ngOnInit(): void {
    this.getExportedSalaryReports();
    this.items = [{ label: 'Salary History' }];
    this.home = { label: 'Salary Calculation Portal', routerLink: '' };
  }

  private getExportedSalaryReports() {

    this.isLoadingSalaryReports = true;
    const filterRequest = this.createFilterRequest();

    this.salaryReportService.getExportedSalaryReports(filterRequest).pipe(takeUntil(this.destroy$)).subscribe({

        next: (response) => {
          this.originalReports = response?.data || [];
          this.exportedSalaryReports$ = [...this.originalReports];
          this.totalRecords = this.exportedSalaryReports$.length;
          this.isLoadingSalaryReports = false;
        },

        error: (error) => {
          console.error('Error fetching reports:', error);
          this.originalReports = [];
          this.exportedSalaryReports$ = [];
          this.totalRecords = 0;
          this.isLoadingSalaryReports = false;
        },
      });
  }

  private initializeStatusOptions(): void {

    const statusValues = Object.values(ExportStatus)
      .filter(value => typeof value === 'number')
      .map(value => value as number);

    this.statusOptions = statusValues.map(statusValue => {
      const statusName = ExportStatus[statusValue];
      return { key: statusValue.toString(), label: statusName };
    });

    this.statusOptions.sort((a, b) => a.label.localeCompare(b.label));

    this.initializeStatusFilterForm();
  }

  private initializeStatusFilterForm(): void {

    // Create form group with 'all' control
    const formGroup: Record<string, FormControl> = {
      all: new FormControl(false)
    };

    // Add control for each unique status
    this.statusOptions.forEach(option => {
      formGroup[option.key] = new FormControl(false);
    });

    // Create the form group with all controls
    this.statusFilterForm = this.fb.group(formGroup);

    // Setup the listeners for checkbox interactions
    this.setupStatusFilterListeners();

    // Reset selected filters
    this.selectedStatusFilters = [];
  }

  private setupStatusFilterListeners(): void {

    // Get the "all" control
    const allControl = this.statusFilterForm.get('all');

    if (!allControl) return;

    // When "all" changes, update all other controls
    allControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(allChecked => {

      // Update all individual status controls
      this.statusOptions.forEach(opt => {

        const control = this.statusFilterForm.get(opt.key);

        if (control) {
          control.setValue(allChecked, { emitEvent: false });
        }

      });

      // Update selected filters
      this.updateSelectedStatusFilters();

    });

    // Listen to individual status filter changes
    this.statusOptions.forEach(opt => {

      const control = this.statusFilterForm.get(opt.key);

      if (control) {
        control.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
          this.updateAllControlState();
          this.updateSelectedStatusFilters();
        });
      }

    });

  }

  private updateAllControlState(): void {

    // Get values of all individual status controls
    const allValues = this.statusOptions.map(opt =>
      this.statusFilterForm.get(opt.key)?.value || false
    );

    // Determine if all are checked or none are checked
    const allChecked = allValues.every(v => v === true);
    const noneChecked = allValues.every(v => v === false);

    // Update the "all" control state
    const allControl = this.statusFilterForm.get('all');

    if (allControl) {

      // Set the value to true only if all individual controls are checked
      allControl.setValue(allChecked, { emitEvent: false });

      // Set indeterminate state when some but not all are checked
      this.allStatusIndeterminate = !allChecked && !noneChecked;
    }

  }

  private updateSelectedStatusFilters(): void {
    this.selectedStatusFilters = this.statusOptions
      .filter(option => this.statusFilterForm.get(option.key)?.value === true)
      .map(option => option.key);
  }

  reExportSalaryTransactionsReport(reportId: string): void {

    if (!reportId) {
      console.warn('Report ID is required');
      return;
    }

    this.salaryReportService
      .reExportSalaryTransactionsReport(reportId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.resetPagination();
          this.getExportedSalaryReports();
        },

        error: () => {
          this.resetPagination();
          this.getExportedSalaryReports();
        },
      });
  }

  formatDate(date: Date): string | undefined {
    return formatDateToDDMMYYYY(date, '-');
  }

  formatDateTime(date: Date): string | undefined {
    return formatDateWithTime(date, '-');
  }

  private resetStatusFilters() : void {

    // Reset status filters
    if (this.statusFilterForm) {

      // Reset "all" checkbox
      const allControl = this.statusFilterForm.get('all');
      if (allControl) {
        allControl.setValue(false, { emitEvent: false });
      }

      // Reset individual status checkboxes
      this.statusOptions.forEach(option => {
        const control = this.statusFilterForm.get(option.key);
        if (control) {
          control.setValue(false, { emitEvent: false });
        }
      });

      // Clear selected status filters
      this.selectedStatusFilters = [];
      this.allStatusIndeterminate = false;
    }

  }

  hideFilters() {
    this.statusFilter.hide();
    this.areaFilter.hide();
    this.regionFilter.hide();
    this.dateFilter.hide();
  }
removeFilter(key: string): void {
  switch (key) {
    case 'region':
      this.regionFilterValue = '';
      break;
    case 'area':
      this.areaFilterValue = '';
      break;
    case 'generatedAt':
      this.dateFilterValue = null;
      break;
    case 'statuses':
      this.resetStatusFilters();
      break;
  }

  this.resetPagination();
  this.getExportedSalaryReports();
  this.refreshAppliedFilters();
}
applyFilters() {
  this.hideFilters();
  this.resetPagination();
  this.getExportedSalaryReports();
  this.refreshAppliedFilters();
}

resetFilter() {
  this.regionFilterValue = '';
  this.areaFilterValue = '';
  this.dateFilterValue = null;
  this.resetStatusFilters();
  this.hideFilters();
  this.resetPagination();
  this.getExportedSalaryReports();
  this.appliedFilters = [];
  this.isFilterApplied = false;
}

private refreshAppliedFilters(): void {
  const filterReq = this.createFilterRequest();
  const applied: { key: string; label: string; value: string }[] = [];

  if (filterReq.region) {
    applied.push({ key: 'region', label: 'Region', value: filterReq.region });
  }
  if (filterReq.area) {
    applied.push({ key: 'area', label: 'Area', value: filterReq.area });
  }
  if (filterReq.generatedAt) {
    applied.push({
      key: 'generatedAt',
      label: 'Generated At',
      value: this.formatDateTime(new Date(filterReq.generatedAt)) || ''
    });
  }
  if (filterReq.statuses && filterReq.statuses.length > 0) {
    const labels = filterReq.statuses
      .map(s => this.statusOptions.find(opt => +opt.key === s)?.label)
      .filter(l => !!l)
      .join(', ');
    applied.push({ key: 'statuses', label: 'Status', value: labels });
  }

  this.appliedFilters = applied;
  this.isFilterApplied = this.appliedFilters.length > 0;
}

  private createFilterRequest(): SalaryReportFilterRequest {
    const filter: SalaryReportFilterRequest = {
      region: null,
      area: null,
      statuses: null,
      generatedAt: null
    };

    filter.region = this.regionFilterValue || null;
    filter.area = this.areaFilterValue || null;
    filter.generatedAt = this.formatDateToString(this.dateFilterValue);
    // If "all" is selected or no statuses are selected, send null
    const allSelected = this.statusFilterForm.get('all')?.value === true;

    if (allSelected || this.selectedStatusFilters.length === 0) {
      filter.statuses = null;

    } else {
      filter.statuses = this.selectedStatusFilters.map(statusKey => parseInt(statusKey));
    }

    return filter;
  }

  onPageChange(event: { first: number, rows: number }) {
    this.first = event.first;
    this.rows = event.rows;
  }

  resetPagination() {

    this.first = 0;

    if (this.table) {
      this.table.reset();
    }

  }

  downloadReport(reportId: string): void {

    if (!reportId) {
      console.error('Report Id is required');
      return;
    }

    this.salaryReportService.downloadReport(reportId).pipe(takeUntil(this.destroy$)).subscribe({

      next: (response) => {
        const blob = response.body as Blob;
        const fileName = extractFileNameFromContentDisposition(response) ?? `report_${reportId}.csv`;
        this.saveBlobAsFile(blob, fileName);
      },

      error: (error) => {
        const err = handleHttpErrorResponse(error);
        this.messageService.add({
          severity: 'error',
          summary: this.translateService.instant('DOWNLOAD_REPORT_TITLE'),
          detail: err || this.translateService.instant('DOWNLOAD_REPORT_FAILED'),
        });
      },

    });

}

private saveBlobAsFile(blob: Blob, fileName: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
private formatLocalDateTime(date: Date): any {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // No milliseconds
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

  private formatDateToString(date: Date | null): string | null {
    if (!date) {
      return null;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T00:00:00`;
  }

}
