import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Injector, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Checkbox } from 'primeng/checkbox';
import { DatePicker } from 'primeng/datepicker';
import { Menu } from 'primeng/menu';
import { Popover, PopoverModule } from 'primeng/popover';
import { TableModule } from 'primeng/table';
import { ConfirmationDialogComponent } from '../../../shared/confirmation-dialog/confirmation-dialog.component';
import { DailyPlanningPortalBase } from '../../../base/daily-planning-base/daily-planning.base';
import { RouterLink } from '@angular/router';
import { takeUntil } from 'rxjs';
import { BasePlanFiltersDto, BasePlanResponseDto, BasePlanResponseDtoPagedList, GetBasePlansRequestDto, Client, Pagination } from '../../../../data/api-clients/daily-planning-api.client';
import { DateHelper } from '../../../../core/utils/date.helper';
import { BasePlanStatus } from '../../../../core/domain/constants/base-plan.constants';
import { ProgressLoadingComponent } from '../../../shared/components/progress-loading/progress-loading.component';
import { withLoaderService } from '../../../../core/utils/with-loader.operator';

@Component({
  standalone: true,
  selector: 'app-base-plan-list',
  templateUrl: './base-plan-list.component.html',
  styleUrls: ['./base-plan-list.component.scss'],
  imports: [
    TableModule,
    Menu,
    FormsModule,
    CommonModule,
    PopoverModule,
    Checkbox,
    DatePicker,
    RouterLink,
    ReactiveFormsModule,
    ProgressLoadingComponent
  ],
})
export class BasePlanListComponent extends DailyPlanningPortalBase implements OnInit, OnDestroy {

  isFilterApplied = false;
  allStatusIndeterminate = false;

  @ViewChild('nameFilter') nameFilter!: Popover;
  @ViewChild('statusFilter') statusFilter!: Popover;
  @ViewChild('dateFilter') dateFilter!: Popover;

  @Output() editBasePlanRequest = new EventEmitter<any>();
  @Output() deleteBasePlanRequest = new EventEmitter<any>();

  basePlans: BasePlanResponseDto[] = [];

  readonly BasePlanStatus = BasePlanStatus;

  first = 0;
  pageNumber = 1;
  pageSize = 10;
  totalRecords = 0;

  // Filter properties
  statusFilterForm: FormGroup;
  statusOptions: { key: string; label: string }[] = [];
  selectedStatusFilters: number[] = [];
  nameFilterValue = '';
  createdOnFilterValue: Date | null = null;
  appliedFilters: { key: string; label: string; value: string }[] = [];

  constructor(
    injector: Injector,
    private fb: FormBuilder
  ) {
    super(injector);
    this.statusFilterForm = this.fb.group({ all: [false] });
    this.initializeStatusOptions();
  }


  ngOnInit(): void {
    this.getBasePlans();
  }

  private initializeStatusOptions(): void {
    const statusValues = Object.values(BasePlanStatus)
      .filter(value => typeof value === 'number')
      .map(value => value as number);

    this.statusOptions = statusValues.map(statusValue => {
      const statusName = BasePlanStatus[statusValue];
      return { key: statusValue.toString(), label: statusName };
    });

    this.statusOptions.sort((a, b) => a.label.localeCompare(b.label));
    this.initializeStatusFilterForm();
  }

  private initializeStatusFilterForm(): void {
    const formGroup: Record<string, FormControl> = {
      all: new FormControl(false)
    };

    this.statusOptions.forEach(option => {
      formGroup[option.key] = new FormControl(false);
    });

    this.statusFilterForm = this.fb.group(formGroup);
    this.setupStatusFilterListeners();
    this.selectedStatusFilters = [];
  }

  private setupStatusFilterListeners(): void {
    const allControl = this.statusFilterForm.get('all');
    if (!allControl) return;

    allControl.valueChanges.pipe(takeUntil(this.destroyer$)).subscribe(allChecked => {
      this.statusOptions.forEach(opt => {
        const control = this.statusFilterForm.get(opt.key);
        if (control) {
          control.setValue(allChecked, { emitEvent: false });
        }
      });
      this.updateSelectedStatusFilters();
    });

    this.statusOptions.forEach(opt => {
      const control = this.statusFilterForm.get(opt.key);
      if (control) {
        control.valueChanges.pipe(takeUntil(this.destroyer$)).subscribe(() => {
          this.updateAllControlState();
          this.updateSelectedStatusFilters();
        });
      }
    });
  }

  private updateAllControlState(): void {
    const allValues = this.statusOptions.map(opt =>
      this.statusFilterForm.get(opt.key)?.value || false
    );

    const allChecked = allValues.every(v => v === true);
    const noneChecked = allValues.every(v => v === false);

    const allControl = this.statusFilterForm.get('all');
    if (allControl) {
      allControl.setValue(allChecked, { emitEvent: false });
      this.allStatusIndeterminate = !allChecked && !noneChecked;
    }
  }

  private updateSelectedStatusFilters(): void {
    this.selectedStatusFilters = this.statusOptions
      .filter(option => this.statusFilterForm.get(option.key)?.value === true)
      .map(option => parseInt(option.key));
  }

  getBasePlans(event?: any): void {

    const request = new GetBasePlansRequestDto();

    request.pagination = new Pagination({
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    });

    request.filters = this.createFilterRequest();

    this.apiClient.getBasePlans(request)
      .pipe(
        withLoaderService(this.loaderService, 'BasePlan_List'),
        takeUntil(this.destroyer$)
      )
      .subscribe({

        next: (response) => {
          const responseData = response.data as BasePlanResponseDtoPagedList;
          this.basePlans = (responseData?.items || []) as BasePlanResponseDto[];
          this.totalRecords = responseData?.totalCount || 0;
        },

        error: (error: any) => {
          console.error('Error loading base plans:', error);
        }

      });

  }

  private createFilterRequest(): BasePlanFiltersDto {

    const filters = new BasePlanFiltersDto();

    filters.name = this.nameFilterValue || undefined;
    filters.createdOn = this.normalizeDate(this.createdOnFilterValue);

    const allSelected = this.statusFilterForm.get('all')?.value === true;
    if (allSelected || this.selectedStatusFilters.length === 0) {
      filters.statuses = undefined;
    } else {
      filters.statuses = this.selectedStatusFilters;
    }

    return filters;
  }

  private normalizeDate(date: Date | null): Date | undefined {

    if (!date) {
      return undefined;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const dateString = `${year}-${month}-${day}T00:00:00.000Z`;
    return new Date(dateString);
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.pageSize = event.rows;
    this.pageNumber = Math.floor(this.first / this.pageSize) + 1;
    this.getBasePlans(event);
  }

  getPlanMenus(plan: any) {

    return [
      {
        label: 'Edit Plan',
        command: () => this.editPlan(plan),
        styleClass: 'color-gray-900',
      },
      {
        label: 'Delete Plan',
        command: () => this.deletePlanModal(plan),
        styleClass: 'text-danger',
      },
    ];

  }

  editPlan(plan: any): void {
    this.editBasePlanRequest.emit(plan);
  }
  deletePlanModal(basePlan: any): void {

    const startDateFormatted = DateHelper.formatDateDDMMYYYY(new Date(basePlan.startDate));
    const endDateFormatted = DateHelper.formatDateDDMMYYYY(new Date(basePlan.endDate));

    const ref = this.dialogService.open(ConfirmationDialogComponent, {
      header: this.translate.instant('BASE_PLAN_DELETE_TITLE'),
      dismissableMask: true,
      closable: true,
      modal: true,
      styleClass: 'p-dialog-draggable dialog-accent p-dialog-danger',
      draggable: true,
      focusOnShow: false,
      data: {
        messages: [
          'All the settings and assignments for all the job packages in the following base plan will be removed permanently.',
          'Plan Name:',
           basePlan.name,
           `${startDateFormatted} - ${endDateFormatted}`,
        ],
      },
    });

    ref.onClose.pipe(takeUntil(this.destroyer$)).subscribe((isConfirmed: boolean) => {
      if (isConfirmed) {
        this.deleteBasePlanRequest.emit(basePlan);
      }
    });
  }

  openMenu(event: MouseEvent, menuRef: Menu) {
    this.stopProp(event);
    menuRef.toggle(event);
  }

  applyFilters(): void {
    this.hideFilters();
    this.resetPagination();
    this.getBasePlans();
    this.refreshAppliedFilters();
  }

  resetFilter(): void {
    this.nameFilterValue = '';
    this.createdOnFilterValue = null;
    this.resetStatusFilters();
    this.hideFilters();
    this.resetPagination();
    this.getBasePlans();
    this.appliedFilters = [];
    this.isFilterApplied = false;
  }

  hideFilters(): void {
    this.nameFilter.hide();
    this.statusFilter.hide();
    this.dateFilter.hide();
  }

  stopProp(e: any) {
    e.stopPropagation();
    e.preventDefault();
  }

  private refreshAppliedFilters(): void {

    const applied: { key: string; label: string; value: string }[] = [];

    if (this.nameFilterValue) {
      applied.push({ key: 'name', label: 'Name', value: this.nameFilterValue });
    }

    if (this.createdOnFilterValue) {
      applied.push({
        key: 'createdOn',
        label: 'Creation Date',
        value: this.getFormattedDate(this.createdOnFilterValue)
      });
    }

    if (this.selectedStatusFilters.length > 0) {
      const labels = this.selectedStatusFilters
        .map(statusId => this.statusOptions.find(opt => +opt.key === statusId)?.label)
        .filter(label => !!label)
        .join(', ');
      applied.push({ key: 'statuses', label: 'Status', value: labels });
    }

    this.appliedFilters = applied;
    this.isFilterApplied = this.appliedFilters.length > 0;
  }

  removeFilter(key: string): void {

    switch (key) {

      case 'name':
        this.nameFilterValue = '';
        break;

      case 'createdOn':
        this.createdOnFilterValue = null;
        break;

      case 'statuses':
        this.resetStatusFilters();
        break;

    }

    this.resetPagination();
    this.getBasePlans();
    this.refreshAppliedFilters();
  }

  private resetStatusFilters(): void {

    if (this.statusFilterForm) {

      const allControl = this.statusFilterForm.get('all');

      if (allControl) {
        allControl.setValue(false, { emitEvent: false });
      }

      this.statusOptions.forEach(option => {

        const control = this.statusFilterForm.get(option.key);

        if (control) {
          control.setValue(false, { emitEvent: false });
        }

      });

      this.selectedStatusFilters = [];
      this.allStatusIndeterminate = false;

    }

  }

  private resetPagination(): void {
    this.first = 0;
    this.pageNumber = 1;
  }

  ngOnDestroy(): void {
    this.destroyer$.next(true);
    this.destroyer$.complete();
  }

  getFormattedDate(date: Date | string | undefined | null): string {
    return DateHelper.formatDateDDMMYYYY(date);
  }

}
