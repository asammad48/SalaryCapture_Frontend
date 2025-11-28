import { SalaryLineGroupedStatuses } from 'core-ui-salary-calculation-library/src/lib/core/domain/enums/salary-line-grouped-by-status';
import { SalaryCaptureFilterRequest } from 'core-ui-salary-calculation-library/src/lib/core/domain/models/SalaryLine/salary-capture-filter-request.model';
import {
  Permissions,
  PermissionsType,
} from 'core-ui-salary-calculation-library/src/lib/core/domain/constants/claims.constants';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  OnInit,
  Renderer2,
  ViewChild,
  QueryList,
  ViewChildren,
  HostListener,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  EMPTY,
  Subject,
  catchError,
  lastValueFrom,
  take,
  takeUntil,
} from 'rxjs';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { SalaryCalculationPortalBase } from '../../../base/salary-calculation-base/salary-calculation.base';
// import { ConfirmationDialogComponent } from '../../../shared/confirmation-dialog/confirmation-dialog.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Menu, MenuModule } from 'primeng/menu';
import { CheckboxModule } from 'primeng/checkbox';
import { AccordionModule } from 'primeng/accordion';
import { DropdownModule } from 'primeng/dropdown';
import {
  AutoComplete,
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
} from 'primeng/autocomplete';
import { ConfirmationDialogComponent } from '../../../shared/confirmation-dialog/confirmation-dialog.component';
import { PerformServiceWorkerSalariesAndSalaryLinesRequest } from '../../../../core/domain/models/ServiceWorker/ServiceWorker.model';
import {
  GetAllSalariesResponse,
  GetSalaryLineDto,
  PerformCompleteSalaryCaptureRequest,
  PerformCompleteSingleSalaryRequest,
  Salary,
  SalaryResponseDto,
} from '../../../../core/domain/models/Salary/salary.model';
import { SalaryRequest } from '../../../../core/domain/requests/salary.request';
import { AddEditSalaryLineDto } from '../../../../core/domain/requests';
import {
  EditSalaryLineRequest,
  PerformSingleSalaryLineRequest,
  SalaryLine,
} from '../../../../core/domain/models/Salary/salaryline.model';
import { SalaryListFiltersComponent } from '../salary-list-filters/salary-list-filters.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Area } from '../../../../core/domain/models/area.model';
import { ReactiveFormsModule } from '@angular/forms';
import { SalaryLineTypeEnums } from '../../../../data/repositories/salary-line/salary-line-type-enums';
import { FormsModule } from '@angular/forms';
import { DEADLINE_DURATION, MenuActionKey, MenuActions } from '../../../../core/domain/constants/application-constants';
import { getSalaryLineActionWord, getSalaryLineActionTranslationKey, getSalaryLineActionStatuses } from 'core-ui-salary-calculation-library/src/lib/data/shared/helper.function';
import { AmountFormatPipe } from '../../../base/utils/pipes/amount-format.pipe';
import { AccessService } from '../../../../data/repositories/access/access.service';
import { Deadline, DeadlineRequest } from '../../../../core/domain/models';
import {
  SalaryLineActions,
  SalaryStatus,
} from '../../../../core/domain/enums/SalaryLineActions';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { SalaryService } from '../../../../data/repositories/salary/salary-web-repository.ts/salary.service';
import { OrganizationUnitsDeadLineRepository } from '../../../../core/repositories';
import { ServiceWorkerService } from '../../../../data/repositories/service-worker/service-worker-web.repository/serviceworker.service';
import { AccessRepository } from '../../../../core/repositories/access.repository';
import { SalaryLineDialogConfig } from '../../../../core/domain/models/SalaryLine/salary-line-dialog-config';
import { SALARY_LINE_DIALOG_MODE } from '../../../../core/domain/constants/salary-line-dialogue-mode';
import {
  SalaryLineActionsRequest,
  SalaryLineIdsForAction,
} from '../../../../core/domain/models/SalaryLine/SalaryLineRequest.model';
import { SalaryLineService } from '../../../../data/repositories/salary-line/salary-line.service';
import {
  calculateMinutesBetweenDates,
  formatDateForBackend,
  formatDateTimeForBackend,
  formatDateToDDMMYYYY,
  formatDateWithTime,
  getHHMMFromISOString,
  getHHMMFromTimeString,
  handleHttpErrorResponse,
  includesIgnoreCase,
  isValidDateTimeString,

  toIsoDateOnly,
} from 'core-ui-salary-calculation-library/src/lib/data/shared/helper.function';
import { SalaryCode } from 'core-ui-salary-calculation-library/src/lib/core/domain/models/SalaryLine/salary-code.model';
import { HttpErrorResponse } from '@angular/common/module.d-CnjH8Dlt';
import { RegionalWorkerResponse, ServiceWorkersByFilterResponse } from 'core-ui-salary-calculation-library/src/lib/core/domain/models/ServiceWorker/service-worker-by-filter-response.model';
import { GetServiceWorkerAgainstSalariesResponse } from 'core-ui-salary-calculation-library/src/lib/core/domain/models/ServiceWorker/service-worker-against-salaries-response.model';
import { FilterService, MenuItem } from 'primeng/api';
import { AddSalaryLineDialogComponent } from '../../add-salary-line-dialog/add-salary-line-dialog.component';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ConflictDialogData } from 'core-ui-salary-calculation-library/src/lib/core/domain/models/SalaryLine/conflict-dialog-data';
import { ConflictConfirmationDialogComponent } from '../conflict-confirmation-dialog/conflict-confirmation-dialog.component';
import { AddSalaryLineDialogResponse } from 'core-ui-salary-calculation-library/src/lib/core/domain/models/SalaryLine/add-salary-line-dialog-response';
import { UI_TEMPLATE_TYPE } from 'core-ui-salary-calculation-library/src/lib/core/domain/constants/ui-template.constants';
import { ProgressLoadingComponent } from '../../../shared/progress-loading/progress-loading.component';
import { ApproveConflictConfirmationDialogComponent } from '../approve-conflict-confirmation-dialog/approve-conflict-confirmation-dialog.component';
import { Popover, PopoverModule } from 'primeng/popover';
import { CalendarModule } from 'primeng/calendar';
import { WorkerSalaryFilterRequest } from '../../../../core/domain/requests/worker-salary-filter.request';
import { ConflictedSalaryLineData } from 'core-ui-salary-calculation-library/src/lib/core/domain/models/Salary/conflicted-salary-line-data';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { TenantConfigurationService } from '../../../services/tenant-configuration.service';


@Component({
  selector: 'lib-worker-salary-view',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbModule,
    FormsModule,
    TableModule,
    ButtonModule,
    MenuModule,
    CheckboxModule,
    AccordionModule,
    AutoCompleteModule,
    DropdownModule,
    ReactiveFormsModule,
    TooltipModule,
    SkeletonModule,
    PaginatorModule,
    ProgressLoadingComponent,
    PopoverModule,
    CalendarModule
  ],
  templateUrl: './worker-salary-view.component.html'
})
export class WorkerSalaryViewComponent extends SalaryCalculationPortalBase implements OnInit, AfterViewInit  {

    @Input() isFilterApplied: boolean = false;
    @Input() filterData: any = null;

    @Input() areaWorkersWithRegion: ServiceWorkersByFilterResponse[] = [];
    @Input() areaWorkersWithoutRegion: ServiceWorkersByFilterResponse[] = [];

    @Input() allRegionalWorkersForAutocomplete: RegionalWorkerResponse[] = [];
    @Input() allServiceWorkersForAutocomplete: ServiceWorkersByFilterResponse[] = [];

    @Input() salaryCodes: SalaryCode[] = [];
    @Input() selectedSalaryCodeForDialog: SalaryCode | undefined = undefined;

    @Input() organizationUnitId: string = '';
    @Input() selectedStartDateForDialog: string | undefined = undefined;
    @Input() selectedEndDateForDialog: string | undefined = undefined;

    @Input() showCurrentDeadlinePeriod: boolean = true;
    @Input() showPastDeadlinePeriod: boolean = true;

    @Input() startDate: string = '';
    @Input() endDate: string = '';

    @Input() hasDeadline: boolean = false;
    @Input() showDeadLine: boolean = true;
    @Input() hideDeadLineIcon: boolean = false;

    @Input() selectedDuration: string = '';
    @Input() selectedDurationId: number | null = null;
    @Input() addSalaryLineGlobalBtn: any;

    @Output() setGlobalSearchTerm = new EventEmitter<string>();
    @Output() setTotalRecords = new EventEmitter<number>();
    @Output() selectionStateChanged = new EventEmitter<void>();

    @Output() seeConflictClicked = new EventEmitter<ConflictedSalaryLineData>();
    @Output() setLoadingState = new EventEmitter<boolean>();

    Permissions = Permissions;
    pageSize = this.tenantConfig.salaryLineGridPageSize;
  
    // Original unfiltered salary lines
    private originalSalaryLines: GetAllSalariesResponse[] = [];
    private originalOrderSalaryLines: GetAllSalariesResponse[] = [];
    currentFilter: WorkerSalaryFilterRequest = {
      code: null,
      job: null,
      date: null,
      serviceWorker: null,
      type: null,
      status: null
    };

    // Central selection state (per-worker)

    // Simplified selection state for salary lines only
    selectedState: {
      salaryLines: Set<string>; // Set of selected salary line IDs
    } = {
      salaryLines: new Set<string>(),
    };
  
    // Cache salaries per worker (because workers list does NOT include salaries)
    salaryCache: Map<string, any[]> = new Map<string, any[]>();
  
    private destroy$ = new Subject<void>();
    loading = false;
    loadingFilters = false;
    items: MenuItem[] = [];
  
    // Simple state tracking for post-action expansion
    private expandAfterAction: {
      serviceWorkerId: string | null;
      productionDate: string | null;
    } = {
      serviceWorkerId: null,
      productionDate: null,
    };
    home: MenuItem | undefined;
    filterPanelCollapsed = false;
    currentDateString = '';
    currentTimeString = '';
    expandedRows: { [key: string]: boolean } = {};
    // State preservation properties for accordion management
    private preservedAccordionState = -1;
    private preservedExpandedRows: { [key: string]: boolean } = {};
    private shouldPreserveState = false;
    // hasAccess = true;
    // userAreasRoles: CurrentUserAreaRoles[] | undefined;
    noAccessRoles = ['No_Access', 'Read_Access'];
    dummyText: any = 'There are 02 conflicts for this salary line';
  
    serviceWorkers: GetServiceWorkerAgainstSalariesResponse[] = [];
    allServiceWorkers: GetServiceWorkerAgainstSalariesResponse[] = [];

    salaries: SalaryResponseDto[] = [];
    selectedSalaries: Salary[] = [];
    overlappingArray: any[] = [];
    salaryLine: GetSalaryLineDto[] = [];
    salaryLines: GetSalaryLineDto[] = [];
    selectedSalaryLines: SalaryLine[] = [];
    savedSelectedSalaryLines: SalaryLine[] = [];
    salaryToLinesMap: { [salaryId: string]: SalaryLine[] } = {};
    salaryToEventsMap: { [salaryId: string]: any[] } = {};
  
    // areas: Area[] = [];
    areasForAutocomplete: Area[] = [];
    selectedSalary = '';
    lastSelectedSalary = '';
    selectedWorker: number | null = 0;
    // subAreas: Area[] = [];
    editSalaryLineRequestObject!: EditSalaryLineRequest;
    deadlineRequest!: DeadlineRequest;
    daLocale = 'da-DK';
    disableApproveAllButton = false;
    filteredGroups: RegionalWorkerResponse[] = [];
    selectedArea: string | undefined;
    //currentUserRole: string | undefined;
    workerDisabled = true;
    newSalaryLine: any;
    eventElement: any;
    deadline: Deadline | undefined;
    fullDate: string | undefined;
    deadLineText = '';
    minDate: Date = new Date();
    maxDate: Date = new Date();
    indeterminate: boolean | null = null;
    isgetSalaryLinesCalled = false;
    isgetSalaryCalled = false;
    isScrolling = false;
    stackedEvents: any[] = [];
    stackedEventsIds: string[] = [];
    today: Date = new Date();
    allAreas: Area[] = [];
    @ViewChildren('descField') descFields!: QueryList<ElementRef>;
    clickedButtonIndex: number | null = null;
    salaryListMenuItems: MenuItem[] = [];
    salaryMenuItems: MenuItem[] = [];
    filteredWorkers: any[] = [];
    loadingSalary: any = false;
  
    selectedSalaryCode = '';
    selectedServiceWorkers: any[] = [];
    checkedSalaries: any[] = [];
    checkedSalaryLines: any[] = [];

    newlyAddedSalaryLineIds: string[] = [];
  
    isWorkerActionAllowed = true;
    isLoadingFilterServiceWorkers = false;
    
    isTimeDistance = false;
    isTimelineInfo = false;

    salaryCaptureFilterRequest!: SalaryCaptureFilterRequest;
    SalaryLineGroupedStatuses = SalaryLineGroupedStatuses;

    first = 0;
    pagedServiceWorkers: GetServiceWorkerAgainstSalariesResponse[] = [];    
    isLoadingAllSalaries = false;
    allSalaries: SalaryResponseDto[] = [];
    allSalariesOriginal: SalaryResponseDto[] = [];
    allPagedSalaries: SalaryResponseDto[] = [];

    allSalaryLines: GetAllSalariesResponse[] = [];
    pagedSalaryLines: GetAllSalariesResponse[] = [];
  @ViewChild('codeFilter') codeFilter!: Popover;
  @ViewChild('jobFilter') jobFilter!: Popover;
  @ViewChild('dateFilter') dateFilter!: Popover;
  @ViewChild('workerFilter') workerFilter!: Popover;
  @ViewChild('typeFilter') typeFilter!: Popover;
  @ViewChild('statusFilter') statusFilter!: Popover;

  codeFilterValue = '';
  jobFilterValue = '';
  dateFilterValue = '';
  workerFilterValue = '';
  typeFilterValue = '';
  statusFilterValue = '';

  appliedFilters: { key: string; label: string; value: string }[] = [];
  isTableFiltersApplied = false;

  @ViewChild('addSalaryLineBtn') addSalaryLineBtn: any;
  @ViewChild('rejectGlobalBtn') rejectGlobalBtn: any;
  @ViewChild('approveGlobalBtn') approveGlobalBtn: any;
  @ViewChild('accRejectBtn') accRejectBtn: any;
  @ViewChild('accApproveBtn') accApproveBtn: any;
  @ViewChild('resourceTimeline') calendarComponent!: FullCalendarComponent;
  @ViewChild('workerAutoCompleteRef') workerAutoCompleteRef!: AutoComplete;
  @ViewChildren('accordionMenuBtn') accordionMenuBtns!: QueryList<ElementRef>;
  @ViewChildren('subAccordionMenuBtn') subAccordionMenuBtns!: QueryList<ElementRef>;
  @ViewChildren('salaryLineRejectBtn') salaryLineRejectBtns!: QueryList<ElementRef>;
  @ViewChildren('salaryLineApproveBtn') salaryLineApproveBtns!: QueryList<ElementRef>;
  @ViewChildren('subLineRejectBtn') subLineRejectBtns!: QueryList<ElementRef>;
  @ViewChildren('subLineApproveBtn') subLineApproveBtns!: QueryList<ElementRef>;
  @ViewChild('selectAllWorkers') selectAllWorkers!: any;

    constructor(
    inject: Injector,
    private renderer: Renderer2,
    private salaryService: SalaryService,
    private salaryLineService: SalaryLineService,
    private accessRepository: AccessRepository,
    private tenantConfig: TenantConfigurationService
  ) {
    super(inject);
    this.currentDateString = this.getCurrentDateTime().date;
    this.currentTimeString = this.getCurrentDateTime().time;
  }

  getCurrentDateTime(): { date: string; time: string } {
    const currentDate = new Date();
    const isoDateTime = currentDate.toISOString();
    const hours = ('0' + currentDate.getHours()).slice(-2);
    const minutes = ('0' + currentDate.getMinutes()).slice(-2);

    return {
      date: isoDateTime.slice(0, 10),
      time: hours + ':' + minutes,
    };
  }

  ngOnInit() {
    this.items = [{ label: 'Salary Capture' }];
    this.home = {
      label: 'Salary Calculation Portal',
      routerLink: '/salary-capture',
    };
    
    this.checkUserAreaRole();
    this.unfocusTableItems();

    // Initialize filters
    this.resetFilter();
  }

  // Simplified method to get all salary lines
  async getAllSalaryLines(scrollToLineId?: string): Promise<void> {
    try {
      this.loading = true;
      this.setLoadingState.emit(true);

      const request = {
        ...this.salaryCaptureFilterRequest,
      } as SalaryRequest;

      const response = await lastValueFrom(
        this.salaryService.getAllSalaries(request).pipe(
          takeUntil(this.destroy$),
          catchError((err) => {
            this.handleError(err);
            return EMPTY;
          })
        )
      );

      if (response.success) {
        // Extract all salary lines from all salaries
        this.originalSalaryLines = response.data || [];
        this.originalOrderSalaryLines = [...this.originalSalaryLines];
        this.allSalaryLines = [...this.originalSalaryLines];
        this.setTotalRecords.emit(this.allSalaryLines.length);
        this.updatePagedSalaryLines();

        if (scrollToLineId) {
          this.scrollToSalaryLine(scrollToLineId);
        }
        
      }
    } catch (e: any) {
      console.error('Error in getAllSalaryLines:', e);
      this.showErrors(e);
    } finally {
      this.loading = false;
      this.setLoadingState.emit(false);
    }
  }



  private updatePagedSalaryLines(): void {
    const start = this.first;
    const end = this.first + this.pageSize;
    this.pagedSalaryLines = this.allSalaryLines.slice(start, end);
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.updatePagedSalaryLines();
  }

  customSort(event: any) {

    if (!event.data || !event.field) return;

    event.data.sort((data1: GetAllSalariesResponse, data2: GetAllSalariesResponse) => {
      const value1 = data1[event.field as keyof GetAllSalariesResponse];
      const value2 = data2[event.field as keyof GetAllSalariesResponse];
      let result = 0;

      // Handle null/undefined values - always push to bottom
      if (value1 == null && value2 != null) {
        return 1;
      } else if (value1 != null && value2 == null) {
        return -1;
      } else if (value1 == null && value2 == null) {
        return 0;
      }

      // Only handle specific columns that need custom sorting
      // Let PrimeNG handle string columns by default
      
      // Boolean field - hasConflict (true values first when ascending)
      if (event.field === 'hasConflict') {
        result = (value1 === value2) ? 0 : value1 ? -1 : 1;
      }
      // Date fields - sort chronologically
      else if (event.field === 'productionDate' || event.field === 'startTime' || event.field === 'endTime' || event.field === 'reviewedAt') {
        const date1 = new Date(value1 as string).getTime();
        const date2 = new Date(value2 as string).getTime();
        result = date1 - date2;
      }
      // Numeric fields - sort as numbers
      else if (event.field === 'salaryCodeValue') {
        const num1 = typeof value1 === 'number' ? value1 : parseFloat(String(value1)) || 0;
        const num2 = typeof value2 === 'number' ? value2 : parseFloat(String(value2)) || 0;
        result = num1 - num2;
      }
      // Status ID - sort as numbers
      else if (event.field === 'statusId') {
        result = (Number(value1) || 0) - (Number(value2) || 0);
      }
      // For all other fields (strings), let PrimeNG handle it
      else {
        // String comparison
        if (typeof value1 === 'string' && typeof value2 === 'string') {
          result = value1.localeCompare(value2);
        } else {
          // Fallback: convert to string and compare
          result = String(value1).localeCompare(String(value2));
        }
      }

      // Apply sort order (1 for ascending, -1 for descending)
      return event.order * result;
    });

      this.updatePagedSalaryLines();

  }

  // Selection methods for salary lines
  isSalaryLineChecked(salaryLineId: string): boolean {
    return this.selectedState.salaryLines.has(salaryLineId);
  }

  onSalaryLineCheckboxChange(salaryLine: GetSalaryLineDto, checked: boolean) {
    if (checked) {
      this.selectedState.salaryLines.add(salaryLine.id);
    } else {
      this.selectedState.salaryLines.delete(salaryLine.id);
    }
    this.updateCheckedSalaryLines();
    this.selectionStateChanged.emit();
  }

  onAllSalaryLinesCheckboxChange(checked: boolean) {
    if (checked) {
      this.pagedSalaryLines.forEach(line => {
        this.selectedState.salaryLines.add(line.id);
      });
    } else {
      this.pagedSalaryLines.forEach(line => {
        this.selectedState.salaryLines.delete(line.id);
      });
    }
    this.updateCheckedSalaryLines();
    this.selectionStateChanged.emit();
  }

  onSelectAllSalaryLinesChange(checked: boolean) {

    if (checked) {
      this.allSalaryLines.forEach(line => {
        this.selectedState.salaryLines.add(line.id);
      });

    } else {
      this.allSalaryLines.forEach(line => {
        this.selectedState.salaryLines.delete(line.id);
      });
    }

    this.updateCheckedSalaryLines();
  }

  private updateCheckedSalaryLines(): void {
    this.checkedSalaryLines = this.pagedSalaryLines.filter(line => 
      this.selectedState.salaryLines.has(line.id)
    );
  }

  areAllSalaryLinesChecked(): boolean {
    if (!this.pagedSalaryLines.length) return false;
    return this.pagedSalaryLines.every(line => 
      this.selectedState.salaryLines.has(line.id)
    );
  }

  areSomeSalaryLinesChecked(): boolean {
    if (!this.pagedSalaryLines.length) return false;
    const someChecked = this.pagedSalaryLines.some(line => 
      this.selectedState.salaryLines.has(line.id)
    );
    return someChecked && !this.areAllSalaryLinesChecked();
  }

  // Action methods
  salaryLineInlineActions(salaryLine: GetSalaryLineDto, statusId: number) {
    const salaryLinesData: SalaryLineIdsForAction[] = [{
      ServiceWorkerID: salaryLine.serviceWorkerId,
      SalaryLineIDs: [salaryLine.id]
    }];

    const ref = this.dialogService.open(ApproveConflictConfirmationDialogComponent, {
      header: statusId === 2 ? 'Reject' : 'Approve',
      dismissableMask: true,
      closable: true,
      modal: true,
      draggable: true,
      focusOnShow: false,
      styleClass: statusId === 2
        ? 'p-dialog-danger p-dialog-draggable dialog-accent manual-line-reject-dialog'
        : 'p-dialog-draggable dialog-accent manual-line-approve-dialog',
      data: {
        messages: [
          statusId === SalaryStatus.Rejected
            ? `The following salary line will be reset to pending.`
            : `The following salary line will be approved.`,
          'Salary line:',
          salaryLine.salaryCode, 
        ],
        salaryLinesData: salaryLinesData,
        action: statusId,
        salaryCaptureFilterRequest: this.salaryCaptureFilterRequest,
      },
    });

    ref.onClose.subscribe(async (result: any) => {
      if (result.confirmed) {
        await this.getAllSalaryLines();
      }
    });
  }

  salaryLineReset(salaryLine: GetSalaryLineDto) {
    const salaryLinesData: SalaryLineIdsForAction[] = [{
      ServiceWorkerID: salaryLine.serviceWorkerId,
      SalaryLineIDs: [salaryLine.id]
    }];

    const ref = this.dialogService.open(ConfirmationDialogComponent, {
      header: 'Reset Status',
      styleClass: 'p-dialog-sm p-dialog-draggable dialog-accent reset-status-dialog p-dialog-warning',
      closable: true,
      modal: true,
      data: {
        messages: [
          `The following salary line will be reset to pending.`,
          'Salary line:',
          salaryLine.salaryCode,
        ],
      },
      draggable: true,
    });

    ref.onClose.subscribe(async (result: any) => {
      if (result.confirmed) {
        await this.handleSalaryLineActions(salaryLinesData, 6);
      }
    });
  }

  salaryLineRemove(salaryLine: GetSalaryLineDto) {
    const salaryLinesData: SalaryLineIdsForAction[] = [{
      ServiceWorkerID: salaryLine.serviceWorkerId,
      SalaryLineIDs: [salaryLine.id]
    }];

    const ref = this.dialogService.open(ConfirmationDialogComponent, {
      header: 'Remove Entry',
      styleClass: 'p-dialog-danger p-dialog-draggable dialog-accent remove-entries-dialog',
      closable: true,
      modal: true,
      data: {
        messages: [
          `The following salary line will be permanently removed.`,
          'Salary line:',
          salaryLine.salaryCode,
        ],
      },
      draggable: true,
    });

    ref.onClose.subscribe(async (result: any) => {
      if (result.confirmed) {
        await this.handleSalaryLineActions(salaryLinesData, 7);
      }
    });
  }

  private async handleSalaryLineActions(
    salaryLinesData: SalaryLineIdsForAction[],
    action: number
  ): Promise<void> {
    const salaryLineActionsRequest: SalaryLineActionsRequest = {
      salariesLines: salaryLinesData,
      actionId: action,
      ...this.salaryCaptureFilterRequest,
    };

    try {
      this.salaryLineService
        .SalaryLineActions(salaryLineActionsRequest)
        .subscribe(async (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('SALARY_LINE_TITLE'),
              detail: this.getSalaryLineActionMessage(action, true),
            });

            await this.getAllSalaryLines();
          } else {
            this.messageService.add({
              severity: 'warn',
              summary: this.translate.instant('SALARY_LINE_TITLE'),
              detail: this.getSalaryLineActionMessage(action, false),
            });
          }
        });
    } catch (error) {
      console.error('Error in handleSalaryLineActions:', error);
      this.messageService.add({
        severity: 'warn',
        summary: this.translate.instant('SALARY_LINE_TITLE'),
        detail: this.getSalaryLineActionMessage(action, false),
      });
    } finally {
      this.clearCheckedSalaries();
    }
  }

  private getSalaryLineActionMessage(action: number, isSuccess: boolean): string {
  
    const translationKey = getSalaryLineActionTranslationKey(isSuccess);
    
    if (isSuccess) {
      const actionWord = getSalaryLineActionWord(action, isSuccess);
      return this.translate.instant(translationKey, { value: actionWord });

    } else {
      const statuses = getSalaryLineActionStatuses(action);
      return this.translate.instant(translationKey, { from: statuses.from, to: statuses.to });
    }

  }

  private getSalaryActionMessageKey(action: number, isSuccess: boolean): string {
    const baseKey = (() => {
      switch (action) {
        case 2: return 'REJECT';
        case 3: return 'APPROVE';
        case 6: return 'RESET';
        case 7: return 'DELETE';
        default: return 'GENERIC';
      }
    })();

    const suffix = isSuccess ? '_SUCCESS' : '_FAILED';
    return `SALARYLINE_SALARY_LINE_${baseKey}${suffix}`;
  }

  // Menu methods
  openSalaryLineMenu(event: MouseEvent, menu: Menu, salaryLine: GetSalaryLineDto) {
    const isReadOnly = this.isSalaryLineReadOnly(salaryLine);

    const menuItems: MenuItem[] = [
      {
        label: 'Edit Entry',
        styleClass: 'list-default fs-14',
        command: () => this.editSalaryLine(salaryLine),
        disabled: !this.canEditSalaryLine(salaryLine.statusId) || isReadOnly,
        visible: this.accessService.hasPermission(Permissions.SALARY_CAPTURE_EDIT_BUTTON)
      },
      {
        label: 'Reset Status',
         styleClass: 'list-warning fs-14',
        command: () => this.salaryLineReset(salaryLine),
        disabled: salaryLine.statusId === 1 || !salaryLine.isManual || !this.canResetSalaryLine() || isReadOnly,
        visible: this.accessService.hasPermission(Permissions.SALARY_CAPTURE_RESET_BUTTON),
      },
      {
        label: 'Remove Entry',
        styleClass: 'list-danger fs-14',
        command: () => this.salaryLineRemove(salaryLine),
        disabled: !this.canRemoveSalaryLines(salaryLine),
        visible: this.accessService.hasPermission(Permissions.SALARY_CAPTURE_REMOVEENTRY_SALARY_BUTTON) || isReadOnly,
      }
    ];

    menu.model = menuItems;
    menu.toggle(event);
    event.stopPropagation();
    event.preventDefault();
  }

  editSalaryLine(salaryLine: GetSalaryLineDto) {
    
    const salaryLineWorker = this.allServiceWorkersForAutocomplete.find(sw => sw.id === salaryLine.serviceWorkerId);
    const workersArr = salaryLineWorker ? [salaryLineWorker] : [];

    const data: SalaryLineDialogConfig = {
      mode: SALARY_LINE_DIALOG_MODE.EDIT,
      openedFromHeader: false,
      salaryLine: salaryLine,
      serviceWorkers: workersArr,
      organizationUnitId:
        salaryLine?.organizationUnitId || this.organizationUnitId || undefined,
      deadlineStartDate: undefined,
      deadlineEndDate: undefined,
      productionDate: undefined,
      allServiceWorkers: this.allServiceWorkersForAutocomplete,
      allSalaryCodes: this.salaryCodes,
      salaryCaptureFilterRequest: this.salaryCaptureFilterRequest,
    };

    const ref = this.dialogService.open(AddSalaryLineDialogComponent, {
      header: 'Edit Salary Line',
      styleClass: 'p-dialog-sm p-dialog-draggable dialog-accent dialog-w-transition',
      focusOnShow: false,
      closable: true,
      modal: true,
      draggable: true,
      data: data
    });

    ref?.onClose?.subscribe(async (result: AddSalaryLineDialogResponse) => {

      if (result?.success) {
        
        if (result.salaryLines.length > 0) {
          
        if (result?.salaryLines.length === 1) {
          await this.getAllSalaryLines(result.salaryLines[0].id);

        } else {
          await this.getAllSalaryLines();
        }

      } else {
        await this.getAllSalaryLines();
      }

    }})
  }

  seeConflict(salaryLine: GetSalaryLineDto) {
    // Emit event to parent component to switch view and navigate to the specific salary line
    if(salaryLine.hasConflict !== true) {
      return;
    }
    this.seeConflictClicked.emit({
      serviceWorkerId: salaryLine.serviceWorkerId,
      productionDate: salaryLine.productionDate,
      salaryLineId: salaryLine.id
    });
  }

  // Filter methods
  getFiltersData(data: any) {
    setTimeout(() => {

this.focusWorkerAutoComplete();

},300);
    this.newlyAddedSalaryLineIds = [];
    this.clearSelectedState();
    this.setGlobalSearchTerm.emit('');

    const { area, region, duration, fromDate, toDate, salaryLines, salaryStatus } = data;
    this.salaryCaptureFilterRequest = {
      organizationUnitId: area?.areaId || null,
      regionId: area?.parentId || null,
      durationId: duration?.id || null,
      startDate: fromDate ? formatDateForBackend(new Date(fromDate)) : null,
      endDate: toDate ? formatDateForBackend(new Date(toDate)) : null,
      salaryCodeId: salaryLines?.map((x: any) => x.salaryCodeId) || null,
      statusId: salaryStatus || null,
    };

    this.filterData = data;
    const regionId = region?.areaId;

    if (data.region != null) {
      this.getCurrentUserSelectedRegionAccess(regionId);
    } else {
      this.hasAccess = true;
    }
    // Load salary lines based on filters
    this.getAllSalaryLines();
  }

  async getCurrentUserSelectedRegionAccess(regionId: any): Promise<void> {
    try {
      // Call the service directly
      const response = await lastValueFrom(
        this.accessRepository
          .getCurrentUserSelectedRegionAccess(regionId)
          .pipe(takeUntil(this.destroyer$))
      );

      // Handle the response directly in the component
      this.hasAccess = response; // or whatever property contains the access data
    } catch (err) {
      this.showErrors(err);
    }
  }


  // Utility methods
  formateProductionDate(date: string): string | undefined {
    return formatDateToDDMMYYYY(new Date(date));
  }

  formateDateTime(date: string): string | undefined {
    return formatDateWithTime(new Date(date));
  }

  showConflictTooltip(salaryLine?: GetSalaryLineDto): boolean {
    return !!salaryLine && salaryLine.hasConflict === true;
  }

  clearSelectedState(): void {
    this.selectedState.salaryLines.clear();
    this.checkedSalaryLines = [];
  }

  // Permission methods
  canShowCheckboxesForSalaryLine(): boolean {
    return (
      this.canPerformSalaryAction(Permissions.SALARY_CAPTURE_REJECT_BUTTON) ||
      this.canPerformSalaryAction(Permissions.SALARY_CAPTURE_APPROVE_BUTTON) ||
      this.canPerformSalaryAction(Permissions.SALARY_CAPTURE_RESET_BUTTON) ||
      this.canPerformSalaryAction(Permissions.SALARY_CAPTURE_REMOVEENTRY_SALARY_BUTTON) ||
      this.canPerformSalaryAction(Permissions.SALARY_CAPTURE_EDIT_BUTTON)
    );
  }

  canApproveSalaryLine(salaryLine: GetSalaryLineDto): boolean {
    return (
      this.canPerformSalaryAction(Permissions.SALARY_CAPTURE_APPROVE_BUTTON) &&
      this.isValidSalaryLine(salaryLine)
    );
  }

  canRejectSalaryLine(salaryLine: GetSalaryLineDto): boolean {
    return (
      this.canPerformSalaryAction(Permissions.SALARY_CAPTURE_REJECT_BUTTON) &&
      this.isValidSalaryLine(salaryLine)
    );
  }

  private isValidSalaryLine(salaryLine: GetSalaryLineDto): boolean {
    return (
      salaryLine.statusId === SalaryStatus.Pending &&
      salaryLine.isManual === true
    );
  }

  canAddSalaryLine(): boolean {
    return this.canPerformSalaryAction(Permissions.SALARY_CAPTURE_ADD_SALARYLINE_BUTTON);
  }

  private canRemoveSalaryLines(salaryLine: any): boolean {
    if (
      (salaryLine.statusId === SalaryStatus.Approved ||
        salaryLine.statusId === SalaryStatus.Rejected) &&
      !this.accessService.hasPermission(Permissions.SALARYCAPTURE_AFTERAPPROVE_REMOVE_SALARY_LINE)
    ) {
      return false;
    }
    return this.canRemoveSalaryLine();
  }

  canRemoveSalaryLine(): boolean {
    return this.canPerformSalaryAction(Permissions.SALARY_CAPTURE_REMOVEENTRY_SALARY_BUTTON);
  }

  canEditSalaryLine(statusId: any): boolean {
    if (
      (statusId === SalaryStatus.Approved || statusId === SalaryStatus.Rejected) &&
      !this.accessService.hasPermission(Permissions.SALARY_CAPTURE_AFTERAPPROVE_EDIT_SALARY_LINE)
    ) {
      return false;
    }
    return this.canUpdateSalaryLine();
  }

  canUpdateSalaryLine(): boolean {
    return this.canPerformSalaryAction(Permissions.SALARY_CAPTURE_EDIT_BUTTON);
  }

  canResetSalaryLine(): boolean { 
    return this.canPerformSalaryAction(Permissions.SALARY_CAPTURE_RESET_BUTTON);
  }

  private canPerformSalaryAction(requiredPermission: PermissionsType): boolean {
    if (!this.isFilterApplied || !this.hasAccess || !this.hasDeadline)
      return false;

    return this.accessService.hasPermission(requiredPermission);
  }

  isSalaryLineReadOnly(salaryLine: GetSalaryLineDto): boolean {
    return salaryLine.isReadOnly === true;
  }

  // Other required methods
  ngAfterViewInit() {
    this.unfocusTableItems();
  }

  checkUserAreaRole() {
    this.checkUserAreaAccess();
  }

  unfocusTableItems() {
    setTimeout(() => {
      const pdatatablewrapper = document.querySelector('.p-datatable-wrapper');
      if (pdatatablewrapper) {
        this.renderer?.setAttribute(pdatatablewrapper, 'tabindex', '-1');
      }
    });
  }

  private showErrors(error: any): void {
    let message = this.translate.instant('SOMETHING_WENT_WRONG_TRY_AGAIN');

    if (error?.error) {
      message = error.error.message
        ? error.error.message
        : error.error.errors[0];
    }
    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('SALARY_LINE_TITLE'),
      detail: this.translate.instant(message),
      life: 3000,
    });
  }

  onSubAreaChange(organizationUnitId: string) {
    this.organizationUnitId = organizationUnitId || '';
  }

  onSalaryCodeChange(selectedSalaryCode: any) {
    this.selectedSalaryCodeForDialog = selectedSalaryCode[0];
  }
  onSalaryCodesChange(salaryCodes: SalaryCode[]): void {
    this.salaryCodes = salaryCodes;
  }
    filterPanelToggler(event: any) {
    this.filterPanelCollapsed = event;
  }
  // Filter related methods
  hideFilters() {
    // this.jobFilter.hide();
    // this.codeFilter.hide();
    // this.dateFilter.hide();
    this.workerFilter.hide();
    // this.typeFilter.hide();
    // this.statusFilter.hide();
  }

  updateAppliedFilters() {
    this.appliedFilters = [];
    
    if (this.currentFilter.code) {
      this.appliedFilters.push({
        key: 'code',
        label: 'Code',
        value: this.currentFilter.code
      });
    }
    
    if (this.currentFilter.date) {
      this.appliedFilters.push({
        key: 'date',
        label: 'Date',
        value: formatDateToDDMMYYYY(this.currentFilter.date) || ''
      });
    }
    
    if (this.currentFilter.serviceWorker) {
      this.appliedFilters.push({
        key: 'worker',
        label: 'Service Worker',
        value: this.currentFilter.serviceWorker
      });
    }
    
    if (this.currentFilter.type) {
      this.appliedFilters.push({
        key: 'type',
        label: 'Type',
        value: this.currentFilter.type
      });
    }
    if (this.currentFilter.job) {
      this.appliedFilters.push({
        key: 'job',
        label: 'Job',
        value: this.currentFilter.job
      });
    }
    
    if (this.currentFilter.status !== null) {
      const statusMap: { [key: number]: string } = {
        1: 'Pending',
        2: 'Rejected',
        3: 'Approved',
        4: 'Completed'
      };
      this.appliedFilters.push({
        key: 'status',
        label: 'Status',
        value: statusMap[this.currentFilter.status] || ''
      });
    }

    this.isTableFiltersApplied = this.appliedFilters.length > 0;
  }

  applyFilters() {
    this.hideFilters();

    // Update the current filter
    this.currentFilter = {
      code: this.codeFilterValue || null,
      job: this.jobFilterValue || null,
      date: this.dateFilterValue ? new Date(this.dateFilterValue) : null,
      serviceWorker: this.workerFilterValue || null,
      type: this.typeFilterValue || null,
      status: this.statusFilterValue ? parseInt(this.statusFilterValue) : null
    };

    this.filterSalaryLines();
  }

  // Individual reset functions for each filter
  resetCodeFilter() {
    this.codeFilterValue = '';
    this.currentFilter.code = null;
    this.filterSalaryLines();
  }

  resetJobFilter() {
    this.jobFilterValue = '';
    this.currentFilter.job = null;
    this.filterSalaryLines();
  }

  resetDateFilter() {
    this.dateFilterValue = '';
    this.currentFilter.date = null;
    this.filterSalaryLines();
  }

  resetWorkerFilter() {
    this.workerFilterValue = '';
    this.currentFilter.serviceWorker = null;
    this.filterSalaryLines();
    this.workerFilter.hide();
  }

  resetTypeFilter() {
    this.typeFilterValue = '';
    this.currentFilter.type = null;
    this.filterSalaryLines();
  }

  resetStatusFilter() {
    this.statusFilterValue = '';
    this.currentFilter.status = null;
    this.filterSalaryLines();
  }

  // Reset all filters at once
  resetFilter() {
    this.codeFilterValue = '';
    this.jobFilterValue = '';
    this.dateFilterValue = '';
    this.workerFilterValue = '';
    this.typeFilterValue = '';
    this.statusFilterValue = '';
    
    this.currentFilter = {
      code: null,
      job: null,
      date: null,
      serviceWorker: null,
      type: null,
      status: null
    };

    this.allSalaryLines = [...this.originalSalaryLines];
    this.updatePagedSalaryLines();
    this.setTotalRecords.emit(this.allSalaryLines.length);
    this.appliedFilters = [];
    this.isTableFiltersApplied = false;
  }

  removeFilter(key: string) {
    switch (key) {
      case 'code':
        this.codeFilterValue = '';
        this.currentFilter.code = null;
        break;
      case 'date':
        this.dateFilterValue = '';
        this.currentFilter.date = null;
        break;
      case 'worker':
        this.workerFilterValue = '';
        this.currentFilter.serviceWorker = null;
        break;
      case 'type':
        this.typeFilterValue = '';
        this.currentFilter.type = null;
        break;
      case 'job':
        this.jobFilterValue = '';
        this.currentFilter.job = null;
        break;
      case 'status':
        this.statusFilterValue = '';
        this.currentFilter.status = null;
        break;
    }

    this.filterSalaryLines();
  }

  private filterSalaryLines() {
    if (!this.originalSalaryLines.length) {
      this.originalSalaryLines = [...this.allSalaryLines];
      this.originalOrderSalaryLines = [...this.allSalaryLines];
    }

    let filteredLines = [...this.originalSalaryLines];

    // Apply all active filters
    if (this.currentFilter.code) {
      filteredLines = filteredLines.filter(line => 
        line.salaryCode?.toLowerCase().includes(this.currentFilter.code!.toLowerCase())
      );
    }

    if (this.currentFilter.date) {
      const filterDate = new Date(this.currentFilter.date).setHours(0, 0, 0, 0);
      filteredLines = filteredLines.filter(line => {
        const lineDate = new Date(line.productionDate).setHours(0, 0, 0, 0);
        return lineDate === filterDate;
      });
    }

    if (this.currentFilter.serviceWorker) {
      filteredLines = filteredLines.filter(line =>
        line.serviceWorkerName?.toLowerCase().includes(this.currentFilter.serviceWorker!.toLowerCase())
      );
    }

    if (this.currentFilter.type) {
      filteredLines = filteredLines.filter(line =>
        line.salaryName?.toLowerCase().includes(this.currentFilter.type!.toLowerCase())
      );
    }
    if (this.currentFilter.job) {
      filteredLines = filteredLines.filter(line =>
        line.jobNumber?.toLowerCase().includes(this.currentFilter.job!.toLowerCase())
      );
    }

    if (this.currentFilter.status !== null) {
      filteredLines = filteredLines.filter(line =>
        line.statusId === this.currentFilter.status
      );
    }

    this.allSalaryLines = filteredLines;
    this.originalOrderSalaryLines = [...filteredLines];
    this.updatePagedSalaryLines();
    this.setTotalRecords.emit(this.allSalaryLines.length);
    this.updateAppliedFilters();
  }

  private prepareSalaryActionRequestPayload(statusId: number): SalaryLineIdsForAction[] {

    const selectedIds = Array.from(this.selectedState.salaryLines);

    const groupedByWorker = new Map<string, string[]>();

    this.allSalaryLines.forEach(line => {

      if (selectedIds.includes(line.id)) {

        const workerId = line.serviceWorkerId;

        if (!groupedByWorker.has(workerId)) {
          groupedByWorker.set(workerId, []);
        }

        groupedByWorker.get(workerId)!.push(line.id);
      }

    });

    return Array.from(groupedByWorker.entries()).map(
      ([serviceWorkerId, salaryLineIds]) => ({
        ServiceWorkerID: serviceWorkerId,
        SalaryLineIDs: salaryLineIds
      })
    );

  }

  headerConfirmationDialog(statusId: number) {

    const salaryActionRequest = this.prepareSalaryActionRequestPayload(statusId);

    if (salaryActionRequest.length === 0) return;

    const ref = this.dialogService.open(ApproveConflictConfirmationDialogComponent, {
      header: statusId === 2 ? 'Reject All' : 'Approve All',
      dismissableMask: true,
      closable: true,
      modal: true,
      draggable: true,
      focusOnShow: false,
      styleClass:
        statusId === 2
          ? 'p-dialog-danger p-dialog-draggable dialog-accent reject-all-dialog'
          : 'p-dialog-draggable dialog-accent approve-all-dialog',
      data: {
        messages: [
          statusId === 2
            ? 'The selected salary lines will be rejected.'
            : 'The selected salary lines will be approved.',
        ],
        salaryLinesData: salaryActionRequest,
        action: statusId,
        salaryCaptureFilterRequest: this.salaryCaptureFilterRequest,
        hideDetails: true,
      },
    });

    ref.onClose.subscribe(async (result: any) => {
      if (result.confirmed) {
        await this.getAllSalaryLines();
        this.clearCheckedSalaries();
      }
    });
  }

  hasAnyExternalWorker(workers: GetServiceWorkerAgainstSalariesResponse[]): boolean {
    return !!workers?.some(w => w.isExternal);
  }

  private getAddPopupWorkers(workers: GetServiceWorkerAgainstSalariesResponse[], regionalScope: boolean): ServiceWorkersByFilterResponse[] {

    if (regionalScope) {
      return this.areaWorkersWithRegion;

    } else {
      return this.areaWorkersWithoutRegion;
    }

  }

  
addSalaryLineGlobal(event: any) {

    const checkedWorkers: GetServiceWorkerAgainstSalariesResponse[] = []

    const hasExternalWorkers = this.hasAnyExternalWorker(checkedWorkers);
    const appropriateWorkers = this.getAddPopupWorkers(checkedWorkers, hasExternalWorkers);
    const focusByKeyboard = event instanceof KeyboardEvent;

    const data: SalaryLineDialogConfig = {
      mode: SALARY_LINE_DIALOG_MODE.ADD,
      openedFromHeader: true,
      salaryLine: undefined,
      serviceWorkers: checkedWorkers,
      salaryCode: this.selectedSalaryCodeForDialog,
      organizationUnitId: this.organizationUnitId || undefined,
      deadlineStartDate: this.selectedStartDateForDialog || undefined,
      deadlineEndDate: this.selectedEndDateForDialog || undefined,
      productionDate: undefined,
      allServiceWorkers: appropriateWorkers,
      allSalaryCodes: this.salaryCodes,
      salaryCaptureFilterRequest: this.salaryCaptureFilterRequest,
      isRegionalScope: hasExternalWorkers
    };

    const ref = this.dialogService.open(AddSalaryLineDialogComponent, {
      header: 'Add Salary Line',
      styleClass: 'p-dialog-sm p-dialog-draggable dialog-accent dialog-w-transition',
      focusOnShow: false,
      closable: true,
      modal: true,
      draggable: true,
      data: data,
    });

    (data as any).focusInput = focusByKeyboard;

    ref?.onClose?.subscribe(async (result: AddSalaryLineDialogResponse) => {
      
      this.focusAddGlobalSalaryLineButton();
      
      if (!result?.success) return;

      if (result.salaryLines.length > 0 && !result.isEdit) {
        this.newlyAddedSalaryLineIds.push(
          ...result.salaryLines.map((line) => line.id)
        );

        if (result?.salaryLines.length === 1) {
          // Scroll to the newly added salary line
          await this.getAllSalaryLines(result.salaryLines[0].id);
        } else {
          await this.getAllSalaryLines();
        }
      } else {
        await this.getAllSalaryLines();
      }

    });
  }

  addSalaryLine(serviceWorker: GetServiceWorkerAgainstSalariesResponse, fromHeader = false, isRegionalScope = false) {

  // Get checked workers from the selection state
  const checkedWorkers = this.allServiceWorkers.some(
    (w) => w.id === serviceWorker.id
  )
    ? this.allServiceWorkers.filter((w) => w.id === serviceWorker.id)
    : [serviceWorker];

  const hasExternalWorkers = this.hasAnyExternalWorker(checkedWorkers);
  const scope = isRegionalScope || hasExternalWorkers;
  const appropriateWorkers = this.getAddPopupWorkers(checkedWorkers, scope);

  const focusByKeyboard = event instanceof KeyboardEvent;

  const data: SalaryLineDialogConfig = {
    mode: SALARY_LINE_DIALOG_MODE.ADD,
    openedFromHeader: false,
    salaryLine: undefined,
    serviceWorkers: checkedWorkers,
    salaryCode: this.selectedSalaryCodeForDialog,
    organizationUnitId: this.organizationUnitId || '',
    deadlineStartDate: this.selectedStartDateForDialog,
    deadlineEndDate: this.selectedEndDateForDialog,
    productionDate: undefined,
    allServiceWorkers: appropriateWorkers,
    allSalaryCodes: this.salaryCodes,
    salaryCaptureFilterRequest: this.salaryCaptureFilterRequest,
    isRegionalScope: scope
  };

  
(data as any).focusInput = focusByKeyboard;

  const ref = this.dialogService.open(AddSalaryLineDialogComponent, {
    header: 'Add Salary Line',
    styleClass: 'p-dialog-sm p-dialog-draggable dialog-accent dialog-w-transition',
    focusOnShow:false,
    closable: true,
    modal: true,
    draggable: true,
    data: data,
  });

  ref?.onClose?.subscribe(async (result: AddSalaryLineDialogResponse) => {

    if(fromHeader){
      this.focusAddGlobalSalaryLineButton();
    }

    else{
      this.addSalaryLineBtn.nativeElement.focus();
    }

    if (!result?.success) return;

    if (result.salaryLines.length > 0 && !result.isEdit) {
      this.newlyAddedSalaryLineIds.push(
        ...result.salaryLines.map((line) => line.id)
      );

      if (result?.salaryLines.length === 1) {
        // Scroll to the newly added salary line
        await this.getAllSalaryLines(result.salaryLines[0].id);
      } else {
        await this.getAllSalaryLines();
      }
    } else {
      await this.getAllSalaryLines();
    }
  });
}

  async onWorkerFilterSelected(event: any) {

      const selectedWorker = event.value; 

      if (this.canAddSalaryLine()) {
        this.setGlobalSearchTerm.emit('');
        this.addSalaryLine(selectedWorker, true, true);
      }

  }

  private getPageForSalaryLineId(salaryLineId: string): number {
    const index = this.allSalaryLines.findIndex(line => line.id === salaryLineId);
    return index === -1 ? 0 : Math.floor(index / this.pageSize);
  }

  private scrollToSalaryLine(salaryLineId: string): void {
    try {
      // Calculate which page the salary line is on
      const targetPage = this.getPageForSalaryLineId(salaryLineId);
      
      if (targetPage >= 0) {
        this.first = targetPage * this.pageSize;
        
        // Update paged salary lines to show the correct page
        this.updatePagedSalaryLines();

        // Wait for the DOM to update, then scroll to the element
        setTimeout(() => {
          const element = document.getElementById(salaryLineId);

          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 200);
      }

    } catch (error) {
      console.error('Error scrolling to salary line:', error);
    }
  }

  
@HostListener('window:keydown', ['$event'])

handleKeyboardShortcut(event: KeyboardEvent): void {

if (event.ctrlKey && event.key.toLowerCase() === 'l') {

event.preventDefault();

event.stopPropagation();

event.stopImmediatePropagation();

if (this.isFilterApplied && this.canAddSalaryLine()) {

this.addSalaryLineGlobal(event);

}

}

if (event.altKey && event.key.toLowerCase() === 'p') {

this.focusFirstPaginatorPage();

}

if (event.key === 'Tab') {

const focusedHeader = document.querySelector('.p-accordionheader.p-focus');

if (focusedHeader) {

focusedHeader.classList.remove('p-focus');

}

}

if (event.altKey && event.key.toLowerCase() === 'k') {

this.focusWorkerAutoComplete();

}

}

focusFirstPaginatorPage(): void {

setTimeout(() => {

const firstPageBtn = document.querySelector(

'.p-paginator-pages .p-paginator-page'

) as HTMLElement;

if (firstPageBtn) {

firstPageBtn.focus();

}

},10);

}

focusPaginatorSelectedIfEndReached(): void {

setTimeout(() => {

const nextBtn = document.querySelector('.p-paginator-next') as HTMLElement;

const lastBtn = document.querySelector('.p-paginator-last') as HTMLElement;

const prevtBtn = document.querySelector('.p-paginator-prev') as HTMLElement;

const firsttBtn = document.querySelector('.p-paginator-first') as HTMLElement;

const bothEndBtnsDisabled =

nextBtn?.classList.contains('p-disabled') &&

lastBtn?.classList.contains('p-disabled');

const bothStartBtnsDisabled =

prevtBtn?.classList.contains('p-disabled') &&

firsttBtn?.classList.contains('p-disabled');

if (bothEndBtnsDisabled || bothStartBtnsDisabled) {

const selectedPage =

(document.querySelector('.p-paginator-page-selected') as HTMLElement);

if (selectedPage) {

selectedPage.focus();

}

}

});

}

handlePaginatorTabNavigation() {

setTimeout(() => {

const paginator = document.querySelector('.p-paginator');

if (!paginator) return;

const keyListener = (event: KeyboardEvent) => {

if (event.key !== 'Tab' || event.shiftKey) return;

const nextBtn = document.querySelector('.p-paginator-next') as HTMLElement;

const lastBtn = document.querySelector('.p-paginator-last') as HTMLElement;

const pageButtons = Array.from(document.querySelectorAll('.p-paginator-pages .p-paginator-page')) as HTMLElement[];

if (!pageButtons.length) return;

const activeElement = document.activeElement as HTMLElement;

const lastPageButton = pageButtons[pageButtons.length - 1];

const isFocusedOnLastPage = activeElement === lastPageButton;

const isFocusedOnLastBtn = activeElement === lastBtn;

const bothDisabled =

nextBtn?.classList.contains('p-disabled') &&

lastBtn?.classList.contains('p-disabled');

const bothEnabled =

!nextBtn?.classList.contains('p-disabled') &&

!lastBtn?.classList.contains('p-disabled');

if (bothDisabled && isFocusedOnLastPage) {

this.selectAllWorkers?.inputViewChild?.nativeElement.focus();

}

if (bothEnabled && isFocusedOnLastBtn) {

this.selectAllWorkers?.inputViewChild?.nativeElement.focus();

}

};

paginator.addEventListener('keydown', keyListener as EventListener);

}, 1000);

}


focusWorkerAutoComplete() {

if (this.workerAutoCompleteRef?.inputEL) {

this.workerAutoCompleteRef.inputEL.nativeElement.focus();

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

  focusAddGlobalSalaryLineButton(): void {
    if (this.addSalaryLineGlobalBtn && this.addSalaryLineGlobalBtn.nativeElement) {
      this.addSalaryLineGlobalBtn.nativeElement.focus();
    }
  }

  headerConfirmationDialogForMenu(statusId: number) {

    const salaryActionRequest = this.prepareSalaryActionRequestPayload(statusId);

    if (salaryActionRequest.length === 0) return;

    const ref = this.dialogService.open(ConfirmationDialogComponent, {
      header: statusId === 6 ? 'Reset All' : 'Remove All',
      dismissableMask: true,
      closable: true,
      modal: true,
      draggable: true,
      styleClass:
        statusId === 6
          ? 'p-dialog-sm p-dialog-draggable dialog-accent reset-status-dialog p-dialog-warning'
          : 'p-dialog-sm p-dialog-draggable dialog-accent remove-entries-dialog p-dialog-danger',
      data: {
        messages: [
          statusId === 6
            ? 'The selected salary lines will be reset.'
            : 'The selected salary lines will be removed.',
        ],
      },
    });

    ref.onClose.subscribe(async (result: any) => {
      if (result.confirmed) {
        await this.handleSalaryLineActions(
          salaryActionRequest,
          statusId
        );
      }
    });

  }

  onBulkMenuActionClicked(action: MenuActionKey) {

    switch (action) {

      case MenuActions.REMOVE:
        this.headerConfirmationDialogForMenu(7);
        break;

      case MenuActions.RESET:
        this.headerConfirmationDialogForMenu(6);
        break;

    }

  }

  canShowBulkMenu(): boolean {
    return this.checkedSalaryLines.length > 0;
  }

  clearCheckedSalaries(): void {
    this.selectedState.salaryLines.clear();
    this.checkedSalaryLines = [];
    this.selectionStateChanged.emit();
  }

}
