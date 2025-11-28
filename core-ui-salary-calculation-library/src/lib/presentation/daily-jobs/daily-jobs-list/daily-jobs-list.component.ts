import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailyJobsService } from 'core-ui-salary-calculation-library/src/lib/data/repositories/daily-jobs/daily-jobs.service';
import { DailyJobResponse } from 'core-ui-salary-calculation-library/src/lib/core/domain/models/DailyJobs/daily-jobs-response';
import { Subject, takeUntil } from 'rxjs';
import { DailyJobsFilterRequest } from 'core-ui-salary-calculation-library/src/lib/core/domain/requests/daily-jobs-filter.request';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { Popover, PopoverModule } from 'primeng/popover';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePicker } from 'primeng/datepicker';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ProgressLoadingComponent } from '../../shared/progress-loading/progress-loading.component';
import { PagedRequest } from 'core-ui-salary-calculation-library/src/lib/core/domain/models/shared/paged-request.model';
import { PaginatorState } from 'primeng/paginator';
import { formatDateToDDMMYYYY, formatDateWithTime, getHHMMFromISOString, isValidDateTimeString } from 'core-ui-salary-calculation-library/src/lib/data/shared/helper.function';

@Component({
    selector: 'lib-daily-jobs-list',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        PopoverModule,
        CheckboxModule,
        DatePicker,
        ProgressLoadingComponent,
        ReactiveFormsModule,
        FormsModule
    ],
    templateUrl: './daily-jobs-list.component.html',
})

export class DailyJobsListComponent implements OnInit, OnDestroy {

    private readonly destroy$ = new Subject<void>();

    dailyJobs: DailyJobResponse[] = [];
    appliedFilters: { key: string; label: string; value: string }[] = [];

    isLoadingDailyJobs = false;
    isDismissable = true;

    @ViewChild('statusFilter') statusFilter!: Popover;
    @ViewChild('regionFilter') regionFilter!: Popover;
    @ViewChild('areaFilter') areaFilter!: Popover;
    @ViewChild('dateFilter') dateFilter!: Popover;
    @ViewChild('workerFilter') workerFilter!: Popover;
    @ViewChild('jobFilter') jobFilter!: Popover;
    @ViewChild('dt') table!: Table;
    isFilterApplied = false;

    // Pagination properties
    pageNumber = 1;
    pageSize = 200;
    first = 0;

    totalRecords = 0;
    rowsPerPageOptions = [200];

    // Status filtering
    statusFilterForm: FormGroup;

    statusOptions: { key: string, label: string }[] = [
        { key: 'Pending', label: 'Pending' },
        { key: 'Completed', label: 'Completed' }
    ];

    allStatusIndeterminate = false;
    selectedStatusFilters: string[] = [];

    // Other filters
    regionFilterValue = '';
    areaFilterValue = '';
    dateFilterValue: Date | null = null;
    workerFilterValue = '';
    jobFilterValue = '';

    constructor(
        private readonly dailyJobsService: DailyJobsService,
        private readonly fb: FormBuilder
    ) {
        this.statusFilterForm = this.fb.group({ all: [false] });
        this.initializeStatusFilterForm();
    }

    ngOnInit(): void {
        this.loadDailyJobs();
    }

    private loadDailyJobs(): void {

        this.isLoadingDailyJobs = true;

        const filterRequest = this.createFilterRequest();

        const paginatedRequest: PagedRequest<DailyJobsFilterRequest> = {
            pageNumber: this.pageNumber,
            pageSize: this.pageSize,
            filters: filterRequest
        };

        this.dailyJobsService.getWorkerDailyJobs(paginatedRequest)
            .pipe(takeUntil(this.destroy$))
            .subscribe({

                next: (response) => {

                    if(response.success) {
                        this.isLoadingDailyJobs = false;
                        const pageData = response.data;
                        this.dailyJobs = pageData.items;
                        this.totalRecords = pageData.totalCount;
                        this.pageNumber = pageData.pageNumber;
                        this.pageSize = pageData.pageSize;
                    }

                },

                error: (error) => {
                    this.dailyJobs = [];
                    this.totalRecords = 0;
                    console.error('Error loading daily jobs:', error);
                },

                complete: () => {
                    this.isLoadingDailyJobs = false;
                },

        });
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

    private resetStatusFilters(): void {

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
        this.regionFilter.hide();
        this.areaFilter.hide();
        this.dateFilter.hide();
        this.workerFilter.hide();
        this.jobFilter.hide();
    }

    removeFilter(key: string): void {
        switch (key) {
            case 'region':
                this.regionFilterValue = '';
                break;
            case 'area':
                this.areaFilterValue = '';
                break;
            case 'productionDate':
                this.dateFilterValue = null;
                break;
            case 'worker':
                this.workerFilterValue = '';
                break;
            case 'job':
                this.jobFilterValue = '';
                break;
            case 'statuses':
                this.resetStatusFilters();
                break;
        }

        this.resetPagination();
        this.loadDailyJobs();
        this.refreshAppliedFilters();
    }

    applyFilters() {
        this.hideFilters();
        this.resetPagination();
        this.loadDailyJobs();
        this.refreshAppliedFilters();
    }

    resetFilter() {
        this.regionFilterValue = '';
        this.areaFilterValue = '';
        this.dateFilterValue = null;
        this.workerFilterValue = '';
        this.jobFilterValue = '';
        this.resetStatusFilters();
        this.hideFilters();
        this.resetPagination();
        this.loadDailyJobs();
        this.appliedFilters = [];
        this.isFilterApplied = false;
    }

    private refreshAppliedFilters(): void {

        const filterReq = this.createFilterRequest();

        const applied: { key: string; label: string; value: string }[] = [];

        if (filterReq.regionName) {
            applied.push({ key: 'region', label: 'Region', value: filterReq.regionName });
        }
        if (filterReq.areaName) {
            applied.push({ key: 'area', label: 'Area', value: filterReq.areaName });
        }
        if (filterReq.productionDate) {
            applied.push({
                key: 'productionDate',
                label: 'Date',
                value: filterReq.productionDate || ''
            });
        }
        if (filterReq.workerSearchTerm) {
            applied.push({ key: 'worker', label: 'Worker', value: filterReq.workerSearchTerm });
        }
        if (filterReq.jobNumber) {
            applied.push({ key: 'job', label: 'Job', value: filterReq.jobNumber });
        }
        if (filterReq.statuses && filterReq.statuses.length > 0) {

            const statusLabels = filterReq.statuses
                .map(s => this.statusOptions.find(opt => opt.key === s)?.label)
                .filter(l => !!l)
                .join(', ');

            applied.push({ key: 'statuses', label: 'Status', value: statusLabels });
        }

        this.appliedFilters = applied;
        this.isFilterApplied = this.appliedFilters.length > 0;
    }

    private createFilterRequest(): DailyJobsFilterRequest {

        const filter: DailyJobsFilterRequest = {
            productionDate: null,
            regionName: null,
            areaName: null,
            workerSearchTerm: null,
            jobNumber: null,
            statuses: null
        };

        filter.regionName = this.regionFilterValue || null;
        filter.areaName = this.areaFilterValue || null;
        filter.productionDate = this.dateFilterValue ? this.formatDateToString(this.dateFilterValue) : null;
        
        // Sending the same worker filter value to both name and username fields
        // The API will handle searching in both fields
        filter.workerSearchTerm = this.workerFilterValue || null;
                
        filter.jobNumber = this.jobFilterValue || null;

        // If "all" is selected or no statuses are selected, send null
        const allSelected = this.statusFilterForm.get('all')?.value === true;

        if (allSelected || this.selectedStatusFilters.length === 0) {
            filter.statuses = null;

        } else {
            filter.statuses = this.selectedStatusFilters;
        }
        
        return filter;
    }

    private formatDateToString(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.pageSize = event.rows ?? 10;
    this.pageNumber = Math.floor(this.first / this.pageSize) + 1;
    this.loadDailyJobs();
    }

    resetPagination() {
        this.pageNumber = 1;
        if (this.table) {
            this.table.reset();
        }
    }

    formatDateToDDMMYYYY(date: Date | null | undefined): string | undefined | null {
        if(!isValidDateTimeString(date)) return null;
        return formatDateToDDMMYYYY(date);
    }

    getHHMMFromTime(date: string | null | undefined): string | null | undefined {
        if(!isValidDateTimeString(date)) return null;
        return getHHMMFromISOString(date);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
