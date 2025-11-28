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
import {
  FullCalendarComponent,
  FullCalendarModule,
} from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { PerformServiceWorkerSalariesAndSalaryLinesRequest } from '../../../../core/domain/models/ServiceWorker/ServiceWorker.model';
import {
  GetSalaryLineDto,
  PerformCompleteSalaryCaptureRequest,
  PerformCompleteSingleSalaryRequest,
  Salary,
  SalaryResponseDto,
  TimelineJobEvent,
  TimelineSalaryEvent,
  GetSalaryLineJobEvents,
  GetSalaryLineEcgGraphData,
} from '../../../../core/domain/models/Salary/salary.model';
import { SalaryRequest } from '../../../../core/domain/requests/salary.request';
import { DateTime } from 'luxon';
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
import { DEADLINE_DURATION } from '../../../../core/domain/constants/application-constants';
import { getSalaryLineActionWord, getSalaryLineActionTranslationKey, getSalaryLineActionStatuses } from '../../../../core/domain/constants/salary-line-action-messages.constants';
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
import { SalaryLineActionsResponse } from '../../../../core/domain/models/responses/salary-line-actions-response';
import { SalaryLineService } from '../../../../data/repositories/salary-line/salary-line.service';
import {
  calculateMinutesBetweenDates,
  formatDateForBackend,
  formatDateTimeForBackend,
  formatDateToDDMMYYYY,
  formatDateWithTime,
  getHHMMFromISOString,
  handleHttpErrorResponse,
  includesIgnoreCase,
  isValidDateTimeString,
  toIsoDateOnly,
} from 'core-ui-salary-calculation-library/src/lib/data/shared/helper.function';
import { SalaryCode } from 'core-ui-salary-calculation-library/src/lib/core/domain/models/SalaryLine/salary-code.model';
import { HttpErrorResponse } from '@angular/common/module.d-CnjH8Dlt';
import { jobEventsSwappedDummy } from '../activity-timeline';
import { JobSwipeIntervalDto } from 'core-ui-salary-calculation-library/src/lib/core/domain/models/SalaryLine/JobSwipeIntervalDto';
import {
  RegionalWorkerResponse,
  ServiceWorkersByFilterResponse,
} from 'core-ui-salary-calculation-library/src/lib/core/domain/models/ServiceWorker/service-worker-by-filter-response.model';
import { GetServiceWorkerAgainstSalariesResponse } from 'core-ui-salary-calculation-library/src/lib/core/domain/models/ServiceWorker/service-worker-against-salaries-response.model';
import { FilterService, MenuItem } from 'primeng/api';
import { AddSalaryLineDialogComponent } from '../../add-salary-line-dialog/add-salary-line-dialog.component';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ConflictDialogData } from 'core-ui-salary-calculation-library/src/lib/core/domain/models/SalaryLine/conflict-dialog-data';
import { ConflictConfirmationDialogComponent } from '../conflict-confirmation-dialog/conflict-confirmation-dialog.component';
import { ApproveConflictConfirmationDialogComponent } from '../approve-conflict-confirmation-dialog/approve-conflict-confirmation-dialog.component';
import { TenantConfigurationService } from '../../../services/tenant-configuration.service';
import { AddSalaryLineDialogResponse } from 'core-ui-salary-calculation-library/src/lib/core/domain/models/SalaryLine/add-salary-line-dialog-response';
import { UI_TEMPLATE_TYPE } from 'core-ui-salary-calculation-library/src/lib/core/domain/constants/ui-template.constants';
import { ProgressLoadingComponent } from '../../../shared/progress-loading/progress-loading.component';
import { ConflictedSalaryLineData } from 'core-ui-salary-calculation-library/src/lib/core/domain/models/Salary/conflicted-salary-line-data';

@Component({
  selector: 'lib-worker-accordion-view',
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
    FullCalendarModule,
    AutoCompleteModule,
    DropdownModule,
    ReactiveFormsModule,
    TooltipModule,
    SkeletonModule,
    PaginatorModule,
    ProgressLoadingComponent,
  ],
  templateUrl: './worker-accordion-view.component.html',
})
export class WorkerAccordionViewComponent
  extends SalaryCalculationPortalBase
  implements OnInit, AfterViewInit
{
  @Input() isFilterApplied: boolean = false;
  @Input() filterData: any = null;

  @Input() currentlyOpenedWorkerIndex: number | null = null;

  @Input() areaWorkersWithRegion: ServiceWorkersByFilterResponse[] = [];
  @Input() areaWorkersWithoutRegion: ServiceWorkersByFilterResponse[] = [];

  @Input() allRegionalWorkersForAutocomplete: RegionalWorkerResponse[] = [];
  @Input() allServiceWorkersForAutocomplete: ServiceWorkersByFilterResponse[] =
    [];

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

  @Input() conflictedSalaryLineData: ConflictedSalaryLineData | undefined =
    undefined;

  @Input() addSalaryLineGlobalBtn: any;
  @Input() rejectGlobalBtn: any;
  @Input() approveGlobalBtn: any;

  @Output() setGlobalSearchTerm = new EventEmitter<string>();
  @Output() setTotalRecords = new EventEmitter<number>();
  @Output() setLoadingState = new EventEmitter<boolean>();

  @Output() setCurrentlyOpenedWorker = new EventEmitter<number | null>();

  Permissions = Permissions;
  pageSize = this.tenantConfig.salaryLineAccordionPageSize;

  // Central selection state (per-worker)
  selectedState: {
    workers: Set<string>; // fully selected worker IDs
    salaries: Map<string, Set<string>>; // workerId -> Set<salaryKey> (salaryKey = workerId__productionDate)
    salaryLines: Map<string, Set<string>>; // workerId -> Set<salaryLineId>
  } = {
    workers: new Set<string>(),
    salaries: new Map<string, Set<string>>(),
    salaryLines: new Map<string, Set<string>>(),
  };

  // Cache salaries per worker (because workers list does NOT include salaries)
  salaryCache: Map<string, any[]> = new Map<string, any[]>();

  private destroy$ = new Subject<void>();
  loading = false;
  loadingFilters = false;
  active = -1;
  calendarEvents: any[] = [];
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

  @ViewChild('addSalaryLineBtn') addSalaryLineBtn: any;
  @ViewChild('accRejectBtn') accRejectBtn: any;
  @ViewChild('accApproveBtn') accApproveBtn: any;
  @ViewChild('resourceTimeline') calendarComponent!: FullCalendarComponent;
  @ViewChild('workerAutoCompleteRef') workerAutoCompleteRef!: AutoComplete;
  @ViewChildren('accordionMenuBtn') accordionMenuBtns!: QueryList<ElementRef>;
  @ViewChildren('subAccordionMenuBtn')
  subAccordionMenuBtns!: QueryList<ElementRef>;
  @ViewChildren('salaryLineRejectBtn')
  salaryLineRejectBtns!: QueryList<ElementRef>;
  @ViewChildren('salaryLineApproveBtn')
  salaryLineApproveBtns!: QueryList<ElementRef>;
  @ViewChildren('subLineRejectBtn') subLineRejectBtns!: QueryList<ElementRef>;
  @ViewChildren('subLineApproveBtn') subLineApproveBtns!: QueryList<ElementRef>;
  @ViewChild('selectAllWorkers') selectAllWorkers!: any;

  lastAccMenuBtn: string | null = null;

  lastLineActionBtn: string | null = null;

  lastSubLineActionBtn: string | null = null;

  lastSubAccMenuBtn: string | null = null;

  filteredWorkers: any[] = [];
  loadingSalary: any = false;

  selectedSalaryCode = '';
  selectedServiceWorkers: any[] = [];
  checkedSalaries: any[] = [];
  checkedSalaryLines: any[] = [];

  newlyAddedSalaryLineIds: string[] = [];
  navigatedSalaryLineId: string | null = null;

  isWorkerActionAllowed = true;
  isLoadingFilterServiceWorkers = false;

  isTimeDistance = false;
  isTimelineInfo = false;

  salaryCaptureFilterRequest!: SalaryCaptureFilterRequest;
  SalaryLineGroupedStatuses = SalaryLineGroupedStatuses;

  activityTimelineEvents: any;
  activityTimelineEcgEvents: GetSalaryLineEcgGraphData[] = [];
  activityTimelineJobEvents: GetSalaryLineJobEvents[] = [];

  jobEventsSwappedDummy = jobEventsSwappedDummy;

  pixelsPerHour = 77.46;
  eventMinWidth = 20;

  first = 0;
  pagedServiceWorkers: GetServiceWorkerAgainstSalariesResponse[] = [];
  timelineSlotInterval: number = this.tenantConfig.calendarMovementInterval;
  showWorkerEmptyState: boolean = false;

  getCurrentDateTime(): { date: string; time: string } {
    const currentDate = new Date();
    const isoDateTime = currentDate.toISOString();
    const hours = ('0' + currentDate.getHours()).slice(-2); // Get hours in 2-digit format
    const minutes = ('0' + currentDate.getMinutes()).slice(-2); // Get minutes in 2-digit format

    return {
      date: isoDateTime.slice(0, 10), // Slice to get date (e.g., '2024-04-01')
      time: hours + ':' + minutes, // Combine hours and minutes
    };
  }
  constructor(
    inject: Injector,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
    private salaryService: SalaryService,
    private serviceWorkerService: ServiceWorkerService,
    private accessRepository: AccessRepository,
    private salaryLineService: SalaryLineService,
    private configService: TenantConfigurationService,
    private tenantConfig: TenantConfigurationService
  ) {
    super(inject);
    this.getCurrentDateTime().date;
    this.currentDateString = this.getCurrentDateTime().date;
    this.currentTimeString = this.getCurrentDateTime().time;
    this.editSalaryLineRequestObject = {
      id: '',
      salaryId: '',
      salaryAmount: 0,
      description: '',
      startTime: '',
      endTime: '',
    };
    this.deadlineRequest = {
      organizationUnitId: '',
      durationId: 0,
    };
  }

  ngOnInit() {
    this.unfocusTableItems();
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.updatePagedServiceWorkers();
    this.active = -1;

    this.scrollToElementById('salaryCaptureAccPanel0');
    this.focusPaginatorSelectedIfEndReached();
  }

  scrollToElementById(elementId: string) {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  private updatePagedServiceWorkers(): void {
    const start = this.first;
    const end = this.first + this.pageSize;
    this.pagedServiceWorkers = this.serviceWorkers.slice(start, end);
  }

  toggleWorkerSelection(worker: any, isChecked: boolean) {
    if (isChecked) {
      // Add if not already selected by ID
      if (!this.selectedServiceWorkers.some((w) => w.id === worker.id)) {
        this.selectedServiceWorkers.push(worker);
      }
    } else {
      // Remove if unchecked by ID
      this.selectedServiceWorkers = this.selectedServiceWorkers.filter(
        (w) => w.id !== worker.id
      );
    }
  }

  onSubAreaChange(organizationUnitId: string) {
    this.organizationUnitId = organizationUnitId || '';
  }

  onSalaryCodeChange(selectedSalaryCode: any) {
    this.selectedSalaryCodeForDialog = selectedSalaryCode[0];
  }

  getConflictToolTip(): string {
    return 'There is a conflict for this salary line';
  }

  getSalaryConflictToolTip(count: number): string {
    if (count == 0) {
      return 'There is a conflict for this salary';
    } else if (count > 0) {
      return 'There are ' + count + ' conflicts for this salary';
    } else return '';
  }

  getWorkerConflictToolTip(count: number): string {
    if (count == 0) {
      return 'There is a conflict in any salary line';
    } else if (count > 0) {
      return 'There are ' + count + ' conflicts in salary lines';
    } else return '';
  }

  ngAfterViewInit() {
    this.unfocusTableItems();

    setTimeout(() => {
      this.focusWorkerAutoComplete();
    }, 300);

    this.handlePaginatorTabNavigation();
  }

  checkUserAreaRole() {
    this.checkUserAreaAccess();
  }

  backDateAccess(actionType: any, salary: any = {}) {
    const { durationId } = this.getFilterIds(this.filterData);
    if ([6].includes(durationId)) {
      if (['Admin', 'SuperUser'].includes(this.currentUserRole ?? '')) {
        if ([4, 5, 11, 12].includes(actionType)) {
          // Added for Salary Line Count  === 1
          if ([4, 5].includes(actionType)) {
            // const { salaryLinesCount } = salary;
            // if (salaryLinesCount === 1 && this.salaries.length === 1) {
            return true;
            // } else {
            //   return false;
            // }
          } else {
            return false;
          }
        } else {
          return true;
        }
      }

      if ([1, 3, 4, 5, 6, 7, 10, 11, 12].includes(actionType)) {
        if ([4, 5].includes(actionType)) {
          if (!['Admin', 'SuperUser'].includes(this.currentUserRole ?? '')) {
            return false;
          }

          return true;
        } else {
          return false;
        }
      } else if (actionType === SalaryLineActions.ApproveSalaryLine) {
        if (['Admin', 'SuperUser'].includes(this.currentUserRole ?? '')) {
          return true;
        } else {
          return false;
        }
      } else if (actionType === SalaryLineActions.AddSalaryLine) {
        if (
          ['Admin', 'SuperUser', 'DailyUser'].includes(
            this.currentUserRole ?? ''
          )
        ) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  setMinMaxDates() {
    if (!this.showDeadLine) {
      this.minDate = new Date(this.startDate);
      this.maxDate = new Date(this.endDate); // 10 days from today
    }
  }

  checkBoxDisabled(type: number, salary: Salary) {
    if (
      ['Admin', 'SuperUser'].includes(this.currentUserRole ?? '') &&
      type === 2
    ) {
      return false;
    } else {
      if (salary.salaryLinesCount === 1 && this.salaries.length === 1) {
        return false;
      }
      return !this.showDeadLine;
    }
  }

  checkUserAreaRolAccess(salary: any): boolean {
    const areaName = this.getSubSalaryAreaName(salary);
    const area = this.userAreasRoles!.filter((x) => x.areaName == areaName);
    if (area.length > 0) {
      return !this.noAccessRoles.includes(area[0].areaRoleName);
    }
    return false;
  }
  overlappingEvents = [];
  calendarOptions: CalendarOptions = {
    plugins: [resourceTimelinePlugin, interactionPlugin],
    initialView: 'resourceTimeline',
    duration: { days: 1 },
    eventStartEditable: false, // Allow events to be moved by dragging
    eventDurationEditable: false, // Prevent resizing
    eventResizableFromStart: false, // Prevent resizing from start
    snapDuration: { minutes: this.timelineSlotInterval },
    // slotMinTime: '-03:00:00', // start timeline at previous day 21:00
    // slotMaxTime: '24:00:00',
    eventConstraint: {
      start: '00:00:00',
      end: '23:00:00',
    },
    height: 'auto',
    resourceAreaWidth: '0px',
    slotLabelFormat: {
      hour: '2-digit',
      minute: '2-digit',
      omitZeroMinute: false,
      hour12: false, // This ensures a 24-hour format
    },
    headerToolbar: {
      start: '',
      center: '',
      end: '',
    },
    resourceOrder: 'order',
    eventMinWidth: 5,
    resources: [
      // { id: 'activity', title: 'Activity Timeline' },
      { id: 'timelineIcons', title: 'Job Icons', order: 1 },
      { id: 'job', title: 'Jobs', order: 2 },
      { id: 'manualLine', title: 'Manual Lines', order: 3 },
    ],
    events: [],
    // slotMinWidth: 60,
    // scrollTime: '00:00:00',
    eventClassNames: function (arg) {
      const classes = [];

      if (arg.event.extendedProps['timelineType'] === 'timelineIcons') {
        classes.push('bg-white border-0');
      }

      // Job timeline classes
      if (arg.event.extendedProps['timelineType'] === 'job') {
        classes.push('rounded-4 mb-px-12 p-0 border-0 height-px-5');
        if (arg.event.extendedProps['typeId'] == 1) {
          classes.push('bg-warning-500');
        } else if (arg.event.extendedProps['typeId'] == 2) {
          classes.push('bg-success-500');
        } else if (arg.event.extendedProps['typeId'] == 3) {
          classes.push('bg-danger-500');
        } else if (arg.event.extendedProps['typeId'] == 4) {
          classes.push('bg-warning-500');
        }
      }

      if (arg.event.extendedProps['timelineType'] === 'manualLine') {
        classes.push('manual-line event min-w-px-20');
        if (arg.event.extendedProps['statusId'] == 3) {
          classes.push('bg-success-200-op7 border-success-200');
        }
        if (arg.event.extendedProps['statusId'] == 2) {
          classes.push('bg-danger-200-op7 border-danger-200');
        }
      }

      // Activity timeline classes
      if (arg.event.extendedProps['timelineType'] === 'activity') {
        classes.push('height-px-50 border-0');
        if (arg.event.extendedProps['type'] === 'terminal') {
          classes.push('activity-terminal bg-warning-100 mt-2');
        } else if (arg.event.extendedProps['type'] === 'active') {
          classes.push('activity-active bg-success-100 mt-2');
        }
      }

      return classes;
    },
    // eventClick: this.handleEventClick.bind(this),

    eventAllow: (dropInfo, draggedEvent) => {
      // 👇 Now `this.canEditSalaryLine` is available
      if (!this.canEditSalaryLine(draggedEvent!.extendedProps['statusId'])) {
        return false;
      }

      // Check if salary line is read-only
      if (draggedEvent!.extendedProps['timelineType'] === 'manualLine') {
        const salaryLine = this.getBySalaryLineId(draggedEvent!.id);
        if (salaryLine && this.isSalaryLineReadOnly(salaryLine)) {
          return false;
        }
      }

      const newStartDate = DateTime.fromJSDate(dropInfo.start);
      const newEndDate = DateTime.fromJSDate(dropInfo.end);
      const checkDate = newStartDate.hasSame(newEndDate, 'day');

      return checkDate;
    },

    eventOverlap: function (stillEvent) {
      // Check if the movingEvent overlaps with the specific event (based on ID)
      if (stillEvent.extendedProps['timelineType'] === 'manualLine') {
        return true;
      }
      return false; // Allow overlapping for other events
    },

    eventContent: function (arg) {
      const htmlContent = arg.event.extendedProps['htmlContent'];
      return { html: htmlContent };
    },

    eventClick: this.onCalendarEditSalaryLine.bind(this),
    eventDrop: this.onCalenderEventDrop.bind(this),
    eventResize: this.onCalenderEventDrop.bind(this),
    eventDidMount: (info) => {
      this.activityLineSvg(info);
      // this.eventStartEndIcon(info);
      // this.activityTimelineIcons(info);
      this.unFocusCalendarEvents(info);

      if (info.event.extendedProps['timelineType'] === 'manualLine') {
        const laneFrame = info.el.closest('.fc-timeline-lane-frame');
        laneFrame?.classList.add('height-px-57');

        const eventsWrapper = laneFrame?.querySelector('.fc-timeline-events');
        eventsWrapper?.classList.add('height-px-47');
      }
    },
  };

  private getServiceWorkerById(
    id: string
  ): GetServiceWorkerAgainstSalariesResponse | undefined {
    return this.serviceWorkers.find((worker) => worker.id === id);
  }

  private getBySalaryLineId(id: string): GetSalaryLineDto | undefined {
    return this.salaryLine.find((line) => line.id === id);
  }

  private onCalendarAddSalaryLine(
    info: DateClickArg,
    serviceWorkerId: string,
    productionDate: string
  ): void {
    const clickedDateTime = info.dateStr;

    const startTime = new Date(clickedDateTime);
    const endTime = new Date(clickedDateTime);
    endTime.setMinutes(endTime.getMinutes() + 30); // Default to 30-minute slot

    const serviceWorker = this.getServiceWorkerById(serviceWorkerId);

    if (!this.canAddSalaryLine()) {
      return;
    }

    this.addSalaryLineFromTimeline(
      [serviceWorker!],
      productionDate,
      startTime,
      endTime,
      serviceWorker?.isExternal
    );
  }

  addSalaryLineFromTimeline(
    serviceWorkers: GetServiceWorkerAgainstSalariesResponse[],
    productionDate: string,
    startTime?: Date,
    endTime?: Date,
    isRegionalScope = false
  ) {
    const addPopupWorkers = this.getAddPopupWorkers(
      serviceWorkers,
      isRegionalScope
    );

    const data: SalaryLineDialogConfig = {
      mode: SALARY_LINE_DIALOG_MODE.ADD,
      openedFromHeader: false,
      salaryLine: undefined,
      serviceWorkers: serviceWorkers,
      salaryCode: this.selectedSalaryCodeForDialog,
      organizationUnitId: this.organizationUnitId || '',
      deadlineStartDate: this.selectedStartDateForDialog,
      deadlineEndDate: this.selectedEndDateForDialog,
      productionDate: productionDate,
      timelineStartTime: startTime ? startTime.toISOString() : undefined,
      timelineEndTime: endTime ? endTime.toISOString() : undefined,
      allServiceWorkers: addPopupWorkers,
      allSalaryCodes: this.salaryCodes,
      salaryCaptureFilterRequest: this.salaryCaptureFilterRequest,
      isRegionalScope: isRegionalScope,
    };

    const ref = this.dialogService.open(AddSalaryLineDialogComponent, {
      header: 'Add Salary Line',
      styleClass: 'p-dialog-sm p-dialog-draggable dialog-accent dialog-w-transition',
      closable: true,
      modal: true,
      draggable: true,
      focusOnShow: false,
      data: data,
    });

    ref?.onClose?.subscribe(async (result: AddSalaryLineDialogResponse) => {
      if (!result.success) return;

      if (result.salaryLines.length > 0 && !result.isEdit) {
        this.newlyAddedSalaryLineIds.push(
          ...result.salaryLines.map((line) => line.id)
        );

        if (result?.salaryLines.length === 1) {
          this.handleNewSalaryLineAdded(
            result.salaryLines[0].serviceWorkerId,
            new Date(result.salaryLines[0].productionDate)
          );
        } else {
          this.active = -1;
          await this.loadServiceWorkers(this.salaryCaptureFilterRequest);
        }
      } else {
        // For edits, preserve expansion context (same as action methods)
        if (
          this.selectedWorker !== null &&
          this.selectedWorker >= 0 &&
          this.selectedWorker < this.serviceWorkers.length
        ) {
          this.expandAfterAction.serviceWorkerId =
            this.serviceWorkers[this.selectedWorker].id;
          // Store the currently expanded p-table row (production date)
          const expandedKeys = Object.keys(this.expandedRows).filter(
            (key) => this.expandedRows[key]
          );
          this.expandAfterAction.productionDate =
            expandedKeys.length > 0 ? expandedKeys[0] : null;
        }

        // Refresh and restore expansion
        this.loadServiceWorkers(this.salaryCaptureFilterRequest);
        await this.expandBasedOnStoredIds();
      }
    });
  }

  private onCalendarEditSalaryLine(args: EventClickArg): void {
    if (
      args.event.extendedProps &&
      args.event.extendedProps['timelineType'] === 'manualLine'
    ) {
      const salaryLine = this.getBySalaryLineId(args.event.id);
      const serviceWorker = this.getServiceWorkerById(
        salaryLine?.serviceWorkerId ?? ''
      );

      if (!this.canEditSalaryLine(args.event.extendedProps['statusId'])) {
        return;
      }

      if (salaryLine && this.isSalaryLineReadOnly(salaryLine)) {
        return;
      }

      this.editSalaryLineFromTimeline(salaryLine, [serviceWorker!]);
    }
  }

  private async onCalenderEventDrop(info: any): Promise<void> {
    if (!this.canEditSalaryLine(info.event.extendedProps['statusId'])) {
      return;
    }

    if (info.event.extendedProps['timelineType'] === 'manualLine') {
      const salaryLine = this.getBySalaryLineId(info.event.id.split('|')[0]);
      if (salaryLine && this.isSalaryLineReadOnly(salaryLine)) {
        info.revert();
        return;
      }
    }

    const Id = info.event.id.split('|')[0];
    const startDate = DateTime.fromJSDate(info.event?.start || new Date());
    const endDate = DateTime.fromJSDate(info.event?.end || new Date());

    const salaryLine = this.getBySalaryLineId(Id);

    if (!salaryLine) {
      info.revert();
      return;
    }

    const worker = this.serviceWorkers[this.selectedWorker || 0];

    const productionDate = salaryLine.productionDate.toString();
    const selectedDate = new Date(productionDate);
    const startDateTime = formatDateTimeForBackend(
      selectedDate,
      new Date(startDate.toISO() || '')
    )!;
    const endDateTime = formatDateTimeForBackend(
      selectedDate,
      new Date(endDate.toISO() || '')
    )!;
    const totalMinutes = calculateMinutesBetweenDates(
      info.event.start,
      info.event.end
    );

    const request: AddEditSalaryLineDto = {
      id: salaryLine.id,
      productionDate: formatDateForBackend(new Date(productionDate)),
      serviceWorkerIds: [worker.id],
      jobNumber: salaryLine.jobNumber || '',
      salaryCodeId: salaryLine.salaryCodeId!,
      salaryCodeValue: totalMinutes || 0,
      startTime:
        formatDateTimeForBackend(
          new Date(info.event.start),
          new Date(info.event.start)
        ) || '',
      endTime:
        formatDateTimeForBackend(
          new Date(info.event.end),
          new Date(info.event.end)
        ) || '',
      startLocation: salaryLine.startLocation || '',
      endLocation: salaryLine.endLocation || '',
      organizationUnitId: this.organizationUnitId,
      forceSaveJobEventConflict: false,
    };

    const conflictDialogData: ConflictDialogData = {
      productionDate: productionDate,
      workerFullName: `${worker?.firstName} (${worker?.userName})`,
      previousStartTime: this.getTimeFromDateTime(salaryLine.startTime),
      previousEndTime: this.getTimeFromDateTime(salaryLine.endTime),
      newStartTime: this.getTimeFromDateTime(startDateTime),
      newEndTime: this.getTimeFromDateTime(endDateTime),
    };

    const ref = this.dialogService.open(ConflictConfirmationDialogComponent, {
      header: 'Edit Salary Line',
      styleClass: 'p-dialog-sm  p-dialog-draggable dialog-accent',
      dismissableMask: true,
      closable: true,
      modal: true,
      draggable: true,
      data: {
        request: request,
        conflictDialogData: conflictDialogData,
      },
    });

    ref.onClose.subscribe(async ({ revert, openUpdateSalaryLineDialog }) => {
      if (revert) {
        if (openUpdateSalaryLineDialog) {
          const serviceWorker = this.getServiceWorkerById(
            salaryLine?.serviceWorkerId ?? ''
          );
          this.editSalaryLineFromTimeline(salaryLine, [serviceWorker!]);
        }

        info.revert();
      } else {
        await this.refreshDataAfterUpdate();
      }
    });
  }

  private getTimeFromDateTime(dateTime: string): string {
    if (!dateTime) return '';
    return DateTime.fromISO(dateTime).toFormat('HH:mm');
  }

  private handleEventDropUpdate(
    request: AddEditSalaryLineDto,
    eventInfo: any
  ): void {
    this.salaryLineService
      .updateSalaryLine(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (response) => {
          if (response?.success) {
            try {
              this.loading = true;

              // Show success message
              this.messageService.add({
                severity: 'success',
                summary: this.translate.instant('SALARY_LINE_TITLE'),
                detail: this.translate.instant('SALARY_LINE_UPDATED_SUCCESS'),
                life: 3000,
              });

              // Refresh data
              await this.refreshDataAfterUpdate();
            } catch (e: any) {
              eventInfo.revert();
              this.handleError(e);
            } finally {
              this.loading = false;
            }
          } else {
            // Handle conflict scenarios
            if (response?.message?.startsWith('CONFIRM:')) {
              this.openJobEventConflictConfirmationDialog(
                request,
                eventInfo,
                this.translate.instant('TIMELINE_CONFLICT_WARNING')
              );
            } else {
              this.messageService.add({
                severity: 'error',
                life: 6000,
                summary: this.translate.instant('SALARY_LINE_TITLE'),
                detail: this.translate.instant('TIMELINE_CONFLICT_WARNING'),
              });
              eventInfo.revert();
            }
          }
        },
        error: (error: HttpErrorResponse) => {
          const errorMessage = handleHttpErrorResponse(error);
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('SALARY_LINE_TITLE'),
            detail: errorMessage,
          });
          eventInfo.revert();
        },
      });
  }

  private openJobEventConflictConfirmationDialog(
    request: AddEditSalaryLineDto,
    eventInfo: any,
    confirmationMessage: string
  ): void {
    // Add delay to ensure previous dialog is fully closed before opening new one
    setTimeout(() => {
      const ref = this.dialogService.open(ConfirmationDialogComponent, {
        header: 'Job Event Conflict',
        styleClass: 'p-dialog-warning p-dialog-draggable dialog-accent',
        dismissableMask: true,
        closable: true,
        modal: true,
        draggable: true,
        data: { messages: [confirmationMessage] },
      });

      ref.onClose.subscribe((result: any) => {
        if (result?.confirmed) {
          request.forceSaveJobEventConflict = true;
          this.handleEventDropUpdate(request, eventInfo);
        } else {
          request.forceSaveJobEventConflict = false;
          eventInfo.revert();
        }
      });
    }, 300); // Small delay to allow previous dialog to close completely
  }

  private async refreshDataAfterUpdate(): Promise<void> {
    // Store expansion context for edit operations (same as action methods)
    if (
      this.selectedWorker !== null &&
      this.selectedWorker >= 0 &&
      this.selectedWorker < this.serviceWorkers.length
    ) {
      this.expandAfterAction.serviceWorkerId =
        this.serviceWorkers[this.selectedWorker].id;
      // Store the currently expanded p-table row (production date)
      const expandedKeys = Object.keys(this.expandedRows).filter(
        (key) => this.expandedRows[key]
      );
      this.expandAfterAction.productionDate =
        expandedKeys.length > 0 ? expandedKeys[0] : null;
    }

    // Refresh and restore expansion
    await this.loadServiceWorkers(this.salaryCaptureFilterRequest);
    await this.expandBasedOnStoredIds();
  }

  editSalaryLineFromTimeline(
    salaryLine: GetSalaryLineDto | undefined,
    serviceWorker: GetServiceWorkerAgainstSalariesResponse[] | undefined
  ) {
    const selectedServiceWorkers =
      this.mapToServiceWorkersByFilter(serviceWorker);

    const data: SalaryLineDialogConfig = {
      mode: SALARY_LINE_DIALOG_MODE.EDIT,
      openedFromHeader: false,
      salaryLine: salaryLine,
      serviceWorkers: selectedServiceWorkers,
      organizationUnitId:
        salaryLine?.organizationUnitId || this.organizationUnitId || undefined,
      deadlineStartDate: undefined,
      deadlineEndDate: undefined,
      productionDate: undefined,
      allServiceWorkers: this.allServiceWorkersForAutocomplete,
      allSalaryCodes: this.salaryCodes,
      salaryCaptureFilterRequest: this.salaryCaptureFilterRequest,
      editFromTimeline: true,
    };

    const ref = this.dialogService.open(AddSalaryLineDialogComponent, {
      header: 'Edit Salary Line',
      styleClass: 'p-dialog-sm p-dialog-draggable dialog-accent dialog-w-transition',
      focusOnShow: false,
      closable: true,
      modal: true,
      data: data,
      draggable: true,
    });

    ref?.onClose?.subscribe(async (result: AddSalaryLineDialogResponse) => {
      if (result?.success) {
        // Store expansion context for edit operations (same as action methods)
        if (
          this.selectedWorker !== null &&
          this.selectedWorker >= 0 &&
          this.selectedWorker < this.serviceWorkers.length
        ) {
          this.expandAfterAction.serviceWorkerId =
            this.serviceWorkers[this.selectedWorker].id;
          // Store the currently expanded p-table row (production date)
          const openedSalaryGroupDate =
            this.formatProductionDateForExpansion(
              new Date(result.salaryLines[0]?.productionDate)
            ) || '';
          this.expandAfterAction.productionDate = openedSalaryGroupDate;
        }

        // Refresh and restore expansion
        this.loadServiceWorkers(this.salaryCaptureFilterRequest);
        await this.expandBasedOnStoredIds();
      }
    });
  }

  selectAllRows() {
    // this.selectedSalaryLines = [...this.salaryLines];
  }

  deselectAllRows() {
    // this.selectedSalaryLines = [];
  }

  dataSelectionChange(event: any) {
    // anything
  }

  dataSelectionSalaryLineChange(event: any) {
    // anything
  }

  rowSelected(event: any) {
    const existsRowSelected = this.selectedSalaries?.find(
      (x) => x.id === this.selectedSalary
    );
    if (existsRowSelected) {
      // this.selectedSalaryLines = this.salaryLines;
    }
  }

  enableSalaryCaptureRejectButton() {
    let disableButton = true;

    if (this.serviceWorkers.length < 1) {
      return true;
    }
    const selectedSalariesAsPerSW = this.selectedSalaries.filter(
      (item) => item.statusId === 1
    );
    const selectedSalaryLinesAsPerSW = this.savedSelectedSalaryLines.filter(
      (item) => item.statusId === 1
    );
    if (
      selectedSalariesAsPerSW.length > 0 ||
      selectedSalaryLinesAsPerSW.length > 0
    ) {
      disableButton = false;
    }
    return disableButton;
  }

  enableSalaryCaptureApproveButton() {
    let disableButton = false;
    let noConflictSalary = true;
    let noConflictSalaryLine = true;
    if (this.serviceWorkers.length < 1) {
      return true;
    }
    const selectedSalariesAsPerSW = this.selectedSalaries.filter(
      (item) => item.statusId === 1
    );
    const selectedSalaryLinesAsPerSW = this.selectedSalaryLines.filter(
      (item) => item.statusId === 1
    );
    if (
      selectedSalariesAsPerSW.length > 0 ||
      selectedSalaryLinesAsPerSW.length > 0
    ) {
      selectedSalariesAsPerSW.forEach((data: Salary) => {
        const { hasConflict } = data;
        if (noConflictSalary) {
          noConflictSalary = hasConflict ? false : true;
        }
      });

      selectedSalaryLinesAsPerSW.forEach((data: SalaryLine) => {
        const { id: selectedID } = data;
        const itemOverlapping = this.overlappingArray.find(
          (x) => x.id === selectedID
        );

        if (noConflictSalaryLine) {
          noConflictSalaryLine = !itemOverlapping?.isOverlapping;
        }
      });
      disableButton = !(noConflictSalary && noConflictSalaryLine);
    } else {
      disableButton = this.disableApproveAllButton;
    }

    return disableButton;
  }

  convertDate(date: any) {
    const selectedDate = new Date(date);
    const seletedMonth =
      selectedDate.getMonth() + 1 >= 10
        ? selectedDate.getMonth() + 1
        : '0' + (selectedDate.getMonth() + 1);
    const seletedDay =
      selectedDate.getDate() >= 10
        ? selectedDate.getDate()
        : '0' + selectedDate.getDate();
    const formatedDate =
      selectedDate.getFullYear() + '-' + seletedMonth + '-' + seletedDay;
    return formatedDate;
  }

  getFilterIds(filter: any) {
    const area = filter?.area || null;
    let areaId = area?.areaId || null;
    const duration = filter?.duration || null;
    let durationId = duration?.id || null;
    const region = filter?.region || null;
    let regionId = region?.areaId || null;
    const date = filter?.date || null;
    const paymentStatus = filter?.paymentStatus || null;
    // const paymentId = paymentStatus?.id || null;
    const salaryLines = filter?.salaryLines || null;
    const lineTypeId = salaryLines?.salaryCodeId || null;

    const startDate = filter?.startDate
      ? this.convertDate(filter.startDate)
      : null;
    const endDate = filter?.endDate ? this.convertDate(filter.endDate) : null;
    areaId = areaId === 'null' ? null : areaId;
    regionId = regionId === 'null' ? null : regionId;
    durationId = durationId === 'null' || durationId === null ? 8 : durationId;
    // return { areaId, durationId, regionId, paymentId, lineTypeId};
    return { areaId, durationId, regionId, lineTypeId, startDate, endDate };
  }

  async loadServiceWorkers(
    serviceWorkerFilter: SalaryCaptureFilterRequest,
    lastWorker?: GetServiceWorkerAgainstSalariesResponse
  ): Promise<void> {
    try {
      this.setGlobalSearchTerm.emit('');
      this.isgetSalaryCalled = false;
      this.isgetSalaryLinesCalled = false;

      this.selectedSalaries = [];
      this.loading = true; // Add loading state if needed
      this.setLoadingState.emit(true);

      const response = await lastValueFrom(
        this.serviceWorkerService
          .GetServiceWorkersAgainstSalaries(serviceWorkerFilter)
          .pipe(
            takeUntil(this.destroyer$),
            catchError((err) => {
              this.handleError(err);
              return EMPTY;
            })
          )
      );

      if (response?.success && response.data) {
        this.serviceWorkers = response.data;
        this.setTotalRecords.emit(this.serviceWorkers.length);
        this.updatePagedServiceWorkers();
        this.allServiceWorkers = [...this.serviceWorkers];
        if (this.conflictedSalaryLineData) {
          this.navigateToSalaryLine(
            this.conflictedSalaryLineData?.serviceWorkerId,
            this.conflictedSalaryLineData?.productionDate,
            this.conflictedSalaryLineData?.salaryLineId
          );
        }
        if (lastWorker !== null && lastWorker !== undefined) {
          const lastWorkerExists = this.serviceWorkers.find(
            (sw) => sw.id === lastWorker.id
          );
          if (!lastWorkerExists) {
            this.active = -1;
          }
        }
      }
    } catch (e: any) {
      this.showErrors(e);
    } finally {
      this.loading = false;
      this.setLoadingState.emit(false);
    }
  }

  onAccordionOpen(event: any) {
    this.getSalary(0);
  }

  onAccordionClose(event: any) {
    this.setCurrentlyOpenedWorker.emit(-1);
    this.showWorkerEmptyState = false;
  }

  private handleNewSalaryLine(
    workers: GetServiceWorkerAgainstSalariesResponse[]
  ): void {
    const { serviceWorkerId } = this.newSalaryLine;
    const index = workers.findIndex((x) => x.id === serviceWorkerId);

    if (index > -1) {
      this.selectedWorker = index;
      this.getSalary(index);
      // Remove state dispatch: this.store.dispatch(new UpdateSelectedSalary());
    }
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

  getSalary(index: number | null, salary = false): Promise<void> {
    this.setCurrentlyOpenedWorker.emit(index);
    setTimeout(() => {
      this.showWorkerEmptyState = true;
    }, 50);
    this.checkedSalaryLines = [];
    this.checkedSalaries = [];
    if (this.isgetSalaryCalled) {
      if (!salary) {
        return Promise.resolve();
      }
    }
    // Only reset states if we're not preserving them
    if (!this.shouldPreserveState) {
      this.expandedRows = {};
    }
    this.salaries = [];
    this.salaryLine = [];

    // Adjusted for pagination
    const globalIndex = this.getGlobalWorkerIndex(index ?? 0);
    const serviceWorkerId = this.serviceWorkers[globalIndex]?.id;
    this.selectedWorker = globalIndex;
    this.isgetSalaryCalled = true;

    const request = {
      serviceWorkerId: serviceWorkerId,
      ...this.salaryCaptureFilterRequest,
    } as SalaryRequest;

    this.loading = true;
    this.loadingSalary = true;

    return new Promise<void>((resolve, reject) => {
      this.salaryService
        .getSalariesV1(request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.loading = false;
            this.loadingSalary = false;
            if (response.success) {
              this.salaries = response.data || []; // ← Fix null reference

              // ===== CHANGE: cache loaded salaries per worker because worker object doesn't contain salaries
              this.salaryCache.set(serviceWorkerId, this.salaries);
              // If worker was fully selected BEFORE loading salaries, populate salaryLines for UI consistency
              if (this.selectedState.workers.has(serviceWorkerId)) {
                const allLineIds = (response.data || []).flatMap((s: any) =>
                  (s.salaryLines || []).map((l: any) => l.id)
                );
                if (allLineIds.length > 0) {
                  this.selectedState.salaryLines.set(
                    serviceWorkerId,
                    new Set(allLineIds)
                  );
                }
              }

              this.toggleWorkerActionAllowed(response.data);
              resolve(); // ← Resolve the Promise when success
            } else {
              resolve(); // ← Still resolve (but no data loaded)
            }
          },
          error: (error) => {
            this.loading = false;
            this.loadingSalary = false;
            this.showError(error);
            reject(error); // ← Reject the Promise on error
          },
        });
    });
  }

  private toggleWorkerActionAllowed(salaries: SalaryResponseDto[]) {
    if (salaries && salaries.length > 0) {
      this.isWorkerActionAllowed = salaries.some(
        (salary) => salary.statusId === 1
      );
    } else {
      this.isWorkerActionAllowed = false;
    }
  }

  private showError(error: any): void {
    const message = error?.error?.message
      ? error.error.message
      : error?.error?.errors?.[0]
      ? error.error.errors[0]
      : this.translate.instant('SOMETHING_WENT_WRONG_TRY_AGAIN');

    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('SALARY_LINE_TITLE'),
      detail: this.translate.instant(message),
      life: 3000,
    });
  }
  toggleRow(id: string) {
    // Extract production date from combined salaryKey (format: "workerId__productionDate")
    // PrimeNG expects dataKey values (productionDate) as keys, not combined salaryKey
    const productionDate = id.includes('__') ? id.split('__')[1] : id;
    this.expandedRows[productionDate] = !this.expandedRows[productionDate];
  }

  toggleAllSalaryChecks(event: any) {
    if (event.checked) {
      this.checkedSalaries = [...this.salaries];
    } else {
      this.checkedSalaries = [];
    }
  }

  toggleAllLineChecks(event: any) {
    if (event.checked) {
      this.checkedSalaryLines = [...this.salaryLine];
    } else {
      this.checkedSalaryLines = [];
    }
  }

  formateProductionDate(date: string): string | undefined {
    return formatDateToDDMMYYYY(new Date(date));
  }

  formateDateTime(date: string): string | undefined {
    return formatDateWithTime(new Date(date));
  }

  onRowExpand(event: any) {
    // Child table data comes from parent salaries data, no API call needed
  }

  onRowCollapse(event: any) {
    // Optional: cleanup if needed
  }
  mapSalaryLinesToTimelineSalaryEvents(
    lines: GetSalaryLineDto[]
  ): TimelineSalaryEvent[] {
    return lines.map(
      (line) =>
        ({
          id: line.id,
          resourceId: 'manualLine',
          timelineType: 'manualLine',
          statusId: line.statusId,
          title: line.salaryCode ?? '',
          start: line.startTime,
          end: line.endTime,
          hasConflicts: line.hasConflict,
          editable: this.canEditSalaryLine(line.statusId) && !line.isReadOnly,
          salaryCode: line.salaryCode,
          salaryName: line.salaryName,
          salaryUnit: line.salaryUnit,
          salaryCodeValue: line.salaryCodeValue,
          description: line.salaryDescription,
          isReadOnly: line.isReadOnly,
          // eventMinWidth: this.eventMinWidth,
        } as TimelineSalaryEvent)
    );
  }

  mapEventsToTimelineJobEvents(
    JobSwipeIntervalDto: JobSwipeIntervalDto[]
  ): any[] {
    if (!JobSwipeIntervalDto) {
      return [];
    }

    return JobSwipeIntervalDto.map((event, index) => ({
      id: index + 1,
      resourceId: 'job',
      timelineType: 'job',
      start: event.start,
      end: event.end,
      editable: false,
      typeId: event.typeId,
      // eventMinWidth:5,
    }));
  }

  maptimeLineIcons(): any[] {
    if (!this.activityTimelineJobEvents) {
      return [];
    }

    return this.activityTimelineJobEvents.map((event, index) => ({
      id: index + 1,
      resourceId: 'timelineIcons',
      timelineType: 'timelineIcons',
      start: event.eventTime,
      editable: false,
      typeId: event.eventId,
    }));
  }

  mapSalaryLinesToTimelineJobEvents(
    lines: GetSalaryLineDto[]
  ): TimelineJobEvent[] {
    if (!lines) {
      return [];
    }

    return lines.map(
      (line) =>
        ({
          id: line.id,
          resourceId: 'job',
          timelineType: 'job',
          title: line.jobNumber ?? 'No Job',
          start: line.startTime,
          end: line.endTime,
          editable: false,
          typeId: 2,
        } as TimelineJobEvent)
    );
  }

  showConflictTooltip(salaryLine?: GetSalaryLineDto): boolean {
    return !!salaryLine && salaryLine.hasConflict === true;
  }

  getSalaryLinesv2(
    salary: SalaryResponseDto,
    salaryLines: GetSalaryLineDto[],
    expanded: boolean,
    worker: GetServiceWorkerAgainstSalariesResponse,
    salaryProductionDate?: string,
    salaryLineId = '',
    scrollToView = false
  ) {
    // MANUALLY manage expandedRows since PrimeNG isn't doing it automatically
    if (!expanded) {
      // Row is being expanded - add it to expandedRows
      this.expandedRows[salary.productionDate] = true;
    } else {
      // Row is being collapsed - remove it from expandedRows
      delete this.expandedRows[salary.productionDate];
    }

    this.salaryLines = salaryLines;
    //TODO: Uncomment with full calendar implementation
    this.activityTimelineEvents = [];
    this.checkedSalaryLines = [];
    if (expanded) {
      return;
    }

    this.salaryLine = salaryLines.filter((x) => x.isManual === true);

    const salaryLinesWithValidDates = salaryLines.filter(
      (x) =>
        isValidDateTimeString(x.startTime) && isValidDateTimeString(x.endTime)
    );
    this.activityTimelineJobEvents = salary.jobEvents || [];
    //TODO: Uncomment with full calendar implementation
    this.activityTimelineEvents = [
      ...this.maptimeLineIcons(),
      ...this.mapSalaryLinesToTimelineSalaryEvents(
        salaryLinesWithValidDates.filter((x) => x.isManual === true)
      ),
      ...this.mapEventsToTimelineJobEvents(salary.jobSwipeInterval || []),
      //   ...this.mapSalaryLinesToTimelineJobEvents(
      //   salaryLinesWithValidDates.filter((x) => x.isManual === false)
      // ),
      // ...(salary.salaryLinesEcgGraph || []),
    ];
    this.activityTimelineEcgEvents = salary.salaryLinesEcgGraph || [];

    let initialDate: string;

    if (this.activityTimelineEvents.length > 0) {
      initialDate = this.activityTimelineEvents[0].start.split('T')[0]; // keep as-is from ISO
    } else {
      initialDate =
        salary.productionDate || new Date().toISOString().split('T')[0];
    }

    // const dateStr = firstEventDate.toISOString().split('T')[0]; // YYYY-MM-DD

    //TODO: Uncomment with full calendar implementation
    this.calendarOptions.events = this.activityTimelineEvents;
    this.calendarOptions.dateClick = (arg: DateClickArg) =>
      this.onCalendarAddSalaryLine(arg, worker.id, salary.productionDate);
    this.calendarOptions.initialDate = initialDate;

    // Scroll to the salary line
    if (scrollToView) {
      this.scrollToSalaryLine(salaryLineId);
    }
  }

  sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9-_]/g, '_');
  }

  transformDateTimeToTime(datetime: string | null): string {
    return this.datePipe.transform(datetime, 'HH:mm:ss') || '';
  }

  getSalaryAreaName(area: any) {
    return area.organizationUnit.parentAreaName;
  }

  getSubSalaryAreaName(area: any) {
    return area.organizationUnit.displayName;
  }

  getRouteValueWrtLineType(val: any) {
    if (SalaryLineTypeEnums.Job == val) {
      return '1';
    } else {
      return '';
    }
  }

  filterPanelToggler(event: any) {
    this.filterPanelCollapsed = event;
  }

  addSalaryLine(
    serviceWorker: GetServiceWorkerAgainstSalariesResponse,
    fromHeader = false,
    isRegionalScope = false
  ) {
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
      isRegionalScope: scope,
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

    ref?.onClose?.subscribe(async (result: AddSalaryLineDialogResponse) => {
      if (fromHeader) {
        this.focusAddGlobalSalaryLineButton();
      } else {
        this.addSalaryLineBtn.nativeElement.focus();
      }

      if (!result?.success) return;

      if (result.salaryLines.length > 0 && !result.isEdit) {
        this.newlyAddedSalaryLineIds.push(
          ...result.salaryLines.map((line) => line.id)
        );

        if (result?.salaryLines.length === 1) {
          this.handleNewSalaryLineAdded(
            result.salaryLines[0].serviceWorkerId,
            new Date(result.salaryLines[0].productionDate),
            result.salaryLines[0].id,
            fromHeader
          );
        } else {
          this.active = -1;
          await this.loadServiceWorkers(this.salaryCaptureFilterRequest);
        }
      } else {
        // For edits, preserve expansion context (same as action methods)
        if (
          this.selectedWorker !== null &&
          this.selectedWorker >= 0 &&
          this.selectedWorker < this.serviceWorkers.length
        ) {
          this.expandAfterAction.serviceWorkerId =
            this.serviceWorkers[this.selectedWorker].id;
          // Store the currently expanded p-table row (production date)
          const expandedKeys = Object.keys(this.expandedRows).filter(
            (key) => this.expandedRows[key]
          );
          this.expandAfterAction.productionDate =
            expandedKeys.length > 0 ? expandedKeys[0] : null;
        }

        // Refresh and restore expansion
        await this.loadServiceWorkers(this.filterData);
        await this.expandBasedOnStoredIds();
      }
    });
  }

  canEdit(status: number): boolean {
    if (this.currentUserRole === 'DailyUser' && status === 3) {
      return false;
    } else {
      return true;
    }
  }

  hasAnyExternalWorker(
    workers: GetServiceWorkerAgainstSalariesResponse[]
  ): boolean {
    return workers.some((worker) => worker.isExternal);
  }

  addSalaryLineGlobal(event: any) {
    const checkedWorkers = this.allServiceWorkers.filter((worker) =>
      this.selectedState.workers.has(worker.id)
    );

    const hasExternalWorkers = this.hasAnyExternalWorker(checkedWorkers);
    const appropriateWorkers = this.getAddPopupWorkers(
      checkedWorkers,
      hasExternalWorkers
    );

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
      isRegionalScope: hasExternalWorkers,
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

    ref?.onClose?.subscribe(async (result: AddSalaryLineDialogResponse) => {
      this.focusAddGlobalSalaryLineButton();
      if (!result?.success) return;

      if (result.salaryLines.length > 0 && !result.isEdit) {
        this.newlyAddedSalaryLineIds.push(
          ...result.salaryLines.map((line) => line.id)
        );

        if (result?.salaryLines.length === 1) {
          this.handleNewSalaryLineAdded(
            result.salaryLines[0].serviceWorkerId,
            new Date(result.salaryLines[0].productionDate),
            result.salaryLines[0].id,
            true
          );
        } else {
          this.active = -1;
          await this.loadServiceWorkers(this.salaryCaptureFilterRequest);
        }
      } else {
        // For edits, preserve expansion context (same as action methods)
        if (
          this.selectedWorker !== null &&
          this.selectedWorker >= 0 &&
          this.selectedWorker < this.serviceWorkers.length
        ) {
          this.expandAfterAction.serviceWorkerId =
            this.serviceWorkers[this.selectedWorker].id;
          const expandedKeys = Object.keys(this.expandedRows).filter(
            (key) => this.expandedRows[key]
          );
          this.expandAfterAction.productionDate =
            expandedKeys.length > 0 ? expandedKeys[0] : null;
        }
        this.selectedState.workers.clear();
        // Refresh and restore expansion
        await this.loadServiceWorkers(this.filterData);
        await this.expandBasedOnStoredIds();
      }
    });
  }

  convertTimeToDate(timeString: string, date: any) {
    const currentDate = new Date(date); // Get the Prod Date
    const seletedMonth =
      currentDate.getMonth() + 1 >= 10
        ? currentDate.getMonth() + 1
        : '0' + (currentDate.getMonth() + 1);
    const seletedDay =
      currentDate.getDate() >= 10
        ? currentDate.getDate()
        : '0' + currentDate.getDate();
    const dateFormated = `${currentDate.getFullYear()}-${seletedMonth}-${seletedDay}T${
      timeString.split(':')[0]
    }:${timeString.split(':')[1]}:00`;

    return DateTime.fromISO(dateFormated).toUTC().toString();
  }

  async editSalaryLineTime(
    salaryLine: SalaryLine,
    worker: ServiceWorkersByFilterResponse,
    index: number,
    startDate: string,
    endDate: string,
    eventInfo: any
  ): Promise<void> {
    // Convert dates
    const productionDate = salaryLine.productionDate.toString();
    const selectedDate = new Date(productionDate);
    const startDateTime = this.convertTimeToDate(startDate, selectedDate);
    const endDateTime = this.convertTimeToDate(endDate, selectedDate);

    // Prepare request object
    const request = {
      ...this.editSalaryLineRequestObject,
      id: salaryLine.id,
      salaryId: salaryLine.salaryCodeId,
      description: salaryLine?.originalDescription || '',
      salaryAmount: salaryLine.salaryAmount,
      startTime: startDateTime,
      endTime: endDateTime,
    };

    // Prepare dialog data
    const salaryLinesText = `(${salaryLine?.line})`;
    const workerName = worker?.firstName || '';

    // Show confirmation dialog
    const ref = this.dialogService.open(ConfirmationDialogComponent, {
      header: 'Edit Salary Line',
      styleClass: 'p-dialog-sm  p-dialog-draggable dialog-accent',
      dismissableMask: true,
      closable: true,
      modal: true,
      draggable: true,
      data: {
        messages: [
          `The selected salary line for the following worker on date: ${salaryLine.productionDate} will be updated.`,
          'Worker:',
          workerName,
          worker?.userName,
          '',
          'Salary lines:',
          salaryLinesText,
        ],
      },
    });

    const confirmed = await lastValueFrom(ref.onClose.pipe(take(1)));

    if (!confirmed) {
      eventInfo.revert();
      return;
    }

    try {
      this.loading = true;

      // Show success message
      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('SALARY_LINE_TITLE'),
        detail: this.translate.instant('SALARY_LINE_UPDATED_SUCCESS'),
        life: 3000,
      });

      // Refresh data
      await this.loadServiceWorkers(this.filterData);
      await this.getSalary(this.selectedWorker);
    } catch (e: any) {
      eventInfo.revert();
      this.handleError(e);
    } finally {
      this.loading = false;
    }
  }

  focusWorkerAutoComplete() {
    if (this.workerAutoCompleteRef?.inputEL) {
      this.workerAutoCompleteRef.inputEL.nativeElement.focus();
    }
  }

  getSalaryFilterData(data: any) {
    setTimeout(() => {
      this.focusWorkerAutoComplete();
    }, 300);

    this.newlyAddedSalaryLineIds = [];
    this.clearSelectedState();
    this.clearPreservedStates();
    this.setGlobalSearchTerm.emit('');

    const {
      area,
      region,
      duration,
      fromDate,
      toDate,
      salaryLines,
      salaryStatus,
    } = data;
    this.salaryCaptureFilterRequest = {
      organizationUnitId: area?.areaId || null,
      regionId: area?.parentId || null,
      durationId: duration?.id || null,
      startDate: fromDate ? formatDateForBackend(new Date(fromDate)) : null,
      endDate: toDate ? formatDateForBackend(new Date(toDate)) : null,
      salaryCodeId: salaryLines?.map((x: any) => x.salaryCodeId) || null,
      statusId: salaryStatus || null,
    };

    this.salaries = [];
    this.active = -1;

    this.isgetSalaryCalled = false;
    this.isgetSalaryLinesCalled = false;

    data.startDate = this.startDate;
    data.endDate = this.endDate;

    this.loadServiceWorkers(this.salaryCaptureFilterRequest);
    this.selectedWorker = 0;
    this.selectedSalary = '';

    const regionId = region?.areaId;

    if (data.region != null) {
      this.getCurrentUserSelectedRegionAccess(regionId);
    } else {
      this.hasAccess = true;
    }

    this.setGlobalSearchTerm.emit('');
  }

  getSalaryCode(data: any) {
    this.selectedSalaryCode = data?.salaryLines?.salaryCodeId;
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

  unfocusTableItems() {
    setTimeout(() => {
      const pdatatablewrapper = document.querySelector('.p-datatable-wrapper');
      if (pdatatablewrapper) {
        this.renderer?.setAttribute(pdatatablewrapper, 'tabindex', '-1');
      }

      const breadcrumbItemLinks = document.querySelectorAll('.p-menuitem-link');
      if (breadcrumbItemLinks) {
        breadcrumbItemLinks.forEach((link: Element) => {
          this.renderer.setAttribute(link, 'tabindex', '-1');
        });
      }
    });
  }

  unFocusCalendarEvents(info: any) {
    const eventEl = info.el;

      eventEl.tabIndex = -1;

    }
    
    unfocusAccordionContent() {
      setTimeout(() => {
        const paccordioncontent = document.querySelector('.p-accordion-content');
        if (paccordioncontent) {
          this.renderer.setAttribute(paccordioncontent, 'tabindex', '-1');
        }
      });
    }
  
    stopPropagation(e: any) {
      e.stopPropagation();
      e.preventDefault();
    }
  
    onScroll(event: any) {
      const scrollPosition = event.target.scrollTop;
      if (scrollPosition > 0) {
        this.isScrolling = true;
      } else {
        this.isScrolling = false;
      }
    }
  
    headerConfirmationDialog(index: number | null, statusId: number) {
      const salaryLinesData = this.getSelectedDataToSubmit('all');
      const ref = this.dialogService.open(ApproveConflictConfirmationDialogComponent, {
        header: statusId === 2 ? 'Reject All' : 'Approve All',
        dismissableMask: true,
        closable: true,
        modal: true,
        focusOnShow:false,
        draggable: true,
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
          salaryLinesData: salaryLinesData,
          action: statusId,
          salaryCaptureFilterRequest: this.salaryCaptureFilterRequest,
          hideDetails: true,
        },
      });
  
      ref.onClose.subscribe(async (result: any) => {

     

        if (result?.confirmed) {
          // Global action - no specific production date target
          await this.restoreExpansionAfterApproveAction(
            salaryLinesData,
            statusId,
            index,
            undefined
          );
          this.focusAddGlobalSalaryLineButton();
        } 
        else{

          if(statusId === 2){
            this.focusGlobalRejectButton();

          } else{
            this.focusGlobalApproveButton();
          }
        }
      });
    }
  
    serviceWorkerStatusChange(
      index: number,
      selectedWorker: GetServiceWorkerAgainstSalariesResponse,
      statusId: number
    ) {
      const salaryLinesData = this.getSelectedDataToSubmit('worker', {
        workerId: selectedWorker.id,
      });
  
      let popupData: any = {};
  
      if (salaryLinesData.length === 0) {
        salaryLinesData.push({
          ServiceWorkerID: selectedWorker.id,
          SalaryLineIDs: [],
        });
        popupData = {
          messages: [
            statusId === 2
              ? 'All salary lines for the following service worker will be rejected.'
              : 'All salary lines for the following service worker will be approved.',
            'Service Worker:',
            selectedWorker.firstName || '',
            selectedWorker.userName,
          ],
          salaryLinesData: salaryLinesData,
          action: statusId,
          salaryCaptureFilterRequest: this.salaryCaptureFilterRequest,
        };
      } else {
        popupData = {
          messages: [
            statusId === 2
              ? 'Selected salary lines for the following service worker will be rejected.'
              : 'Selected salary lines for the following service worker will be approved.',
            'Service Worker:',
            selectedWorker.firstName || '',
            selectedWorker.userName,
          ],
          salaryLinesData: salaryLinesData,
          action: statusId,
          salaryCaptureFilterRequest: this.salaryCaptureFilterRequest,
        };
      }
  
      const ref = this.dialogService.open(ApproveConflictConfirmationDialogComponent, {
        header: statusId === 2 ? 'Reject' : 'Approve',
        dismissableMask: true,
        closable: true,
        modal: true,
        draggable: true,
        focusOnShow:false,
        styleClass:
          statusId === 2
            ? 'p-dialog-danger p-dialog-draggable dialog-accent service-worker-reject-dialog'
            : 'p-dialog-draggable dialog-accent service-worker-approve-dialog',
        data: popupData,
      });
  
      ref.onClose.subscribe(async (result: any) => {
        this.addSalaryLineBtn.nativeElement.focus();
        if (result?.confirmed) {
          // Worker-level action - no specific production date target
          await this.restoreExpansionAfterApproveAction(
            salaryLinesData,
            statusId,
            index,
            undefined
          );
        } else{

statusId === 2 ? this.accRejectBtn.nativeElement.focus() : this.accApproveBtn.nativeElement.focus();

}
      });
    }
  
    salaryLinesStatusChange(
      index: number,
      worker: GetServiceWorkerAgainstSalariesResponse,
      salaryLines: SalaryLine[],
      date: string,
      statusId: number
    ) {
      const salaryLinesData = this.getSelectedDataToSubmit('salaryGroup', {
        workerId: worker.id,
        productionDate: date,
      });
  
      let modalData: any = {};
      if (salaryLinesData.length === 0) {
        salaryLinesData.push({
          ServiceWorkerID: worker.id,
          SalaryLineIDs: salaryLines.map((x) => x.id),
        });
        modalData = {
          messages: [
            statusId === 2
              ? `All salary lines for the following service worker on date: ${this.formateProductionDate(
                  date
                )} will be rejected.`
              : `All salary lines for the following service worker on date: ${this.formateProductionDate(
                  date
                )} will be approved.`,
            'Service Worker:',
            worker.firstName || '',
            worker.userName,
            // 'Salary lines:',
            // ...salaryLines,
          ],
          salaryLinesData: salaryLinesData,
          action: statusId,
          salaryCaptureFilterRequest: this.salaryCaptureFilterRequest,
        };
      } else {
        modalData = {
          messages: [
            statusId === 2
              ? `Selected salary lines for the following service worker on date: ${this.formateProductionDate(
                  date
                )} will be rejected.`
              : `Selected salary lines for the following service worker on date: ${this.formateProductionDate(
                  date
                )} will be approved.`,
            'Service Worker:',
            worker.firstName || '',
            worker.userName,
            // 'Salary lines:',
            // ...salaryLines,
          ],
          salaryLinesData: salaryLinesData,
          action: statusId,
          salaryCaptureFilterRequest: this.salaryCaptureFilterRequest,
        };
      }

      
this.lastLineActionBtn = date;

this.lastAccMenuBtn = date;
  
      const ref = this.dialogService.open(ApproveConflictConfirmationDialogComponent, {
        header: statusId === 2 ? 'Reject' : 'Approve',
        dismissableMask: true,
        closable: true,
        modal: true,
        focusOnShow: false,
        styleClass:
          statusId === 2
            ? 'p-dialog-danger p-dialog-draggable dialog-accent salary-lines-reject-dialog'
            : 'p-dialog-draggable dialog-accent salary-lines-approve-dialog',
        data: modalData,
        draggable: true,
      });
  
      ref.onClose.subscribe(async (result: any) => {
        if (result?.confirmed) {
          await this.restoreExpansionAfterApproveAction(
            salaryLinesData,
            statusId,
            index,
            date
          );

        setTimeout(() => {
          const button = this.accordionMenuBtns
            .toArray()
            .find(
              (btn) =>
                btn.nativeElement.getAttribute('focus-id') ===
                this.lastAccMenuBtn
            );

          button?.nativeElement?.focus();
        }, 2500);
      } else {
        const btnList =
          statusId === 2
            ? this.salaryLineRejectBtns
            : this.salaryLineApproveBtns;

        const button = btnList
          .toArray()
          .find(
            (btn) =>
              btn.nativeElement.getAttribute('focus-id') ===
              this.lastLineActionBtn
          );

        button?.nativeElement?.focus();
      }
    });
  }

  salaryLineInlineActions(
    index: number,
    worker: GetServiceWorkerAgainstSalariesResponse,
    salaryLine: SalaryLine,
    statusId: number
  ) {
    const salaryLinesData = this.getSelectedDataToSubmit('salaryLine', {
      workerId: worker.id,
      salaryLineId: salaryLine.id,
    });

    this.lastSubLineActionBtn = salaryLine.id;

this.lastSubAccMenuBtn = salaryLine.id;
  
      const ref = this.dialogService.open(ApproveConflictConfirmationDialogComponent, {
        header: statusId === 2 ? 'Reject' : 'Approve',
        dismissableMask: true,
        closable: true,
        modal: true,
        draggable: true,
        focusOnShow:false,
        styleClass:
          statusId === 2
            ? 'p-dialog-danger p-dialog-draggable dialog-accent manual-line-reject-dialog'
            : 'p-dialog-draggable dialog-accent manual-line-approve-dialog',
        data: {
          messages: [
            statusId === SalaryStatus.Rejected
              ? `The following salary line for the service worker on date: ${this.formateProductionDate(
                  salaryLine.productionDate
                )} will be reset to pending.`
              : `The following salary line for the service worker on date: ${this.formateProductionDate(
                  salaryLine.productionDate
                )} will be approved.`,
            'Service Worker:',
            worker.firstName || '',
            worker.userName,
            'Salary line:',
            salaryLine.salaryCode,
          ],
          salaryLinesData: salaryLinesData,
          action: statusId,
          salaryCaptureFilterRequest: this.salaryCaptureFilterRequest,
        },
      });
  
      ref.onClose.subscribe(async (result: any) => {
        if (result?.confirmed) {
          await this.restoreExpansionAfterApproveAction(
            salaryLinesData,
            statusId,
            index,
            salaryLine.productionDate
          );

        setTimeout(() => {
          const button = this.subAccordionMenuBtns

            .toArray()

            .find(
              (btn) =>
                btn.nativeElement.getAttribute('focus-id') ===
                this.lastSubAccMenuBtn
            );

          button?.nativeElement?.focus();
        }, 2500);
      } else {
        const btnList =
          statusId === 2 ? this.subLineRejectBtns : this.subLineApproveBtns;

        const button = btnList

          .toArray()

          .find(
            (btn) =>
              btn.nativeElement.getAttribute('focus-id') ===
              this.lastSubLineActionBtn
          );

        button?.nativeElement?.focus();
      }
    });
  }

  salaryLineReset(
    index: number,
    salaryLines: GetSalaryLineDto[],
    worker?: GetServiceWorkerAgainstSalariesResponse,
    statusId?: number,
    isBulk?: boolean
  ) {
    const linesMessage = salaryLines.map((line) => line.salaryCode);
    const salaryLineMessage =
      salaryLines?.length > 1 ? 'salary lines' : 'salary line';
    let salaryLinesData: SalaryLineIdsForAction[] = []; // [{ ServiceWorkerID: worker?.id ?? '', SalaryLineIDs: salaryLines.filter(x => x.isManual === true).map(x => x.id) }];
    let modelData = {};
    if (salaryLines.length === 1) {
      salaryLinesData = this.getSelectedDataToSubmit('salaryLine', {
        workerId: worker?.id,
        salaryLineId: salaryLines[0].id,
      });
      modelData = {
        messages: [
          `The following ${salaryLineMessage} for the service worker on date: ${
            salaryLines[0]?.productionDate
              ? this.formateProductionDate(salaryLines[0]?.productionDate)
              : ''
          } will be reset to pending.`,
          'Service Worker:',
          worker?.firstName || '',
          worker?.userName,
          `${salaryLineMessage}:`,
          ...linesMessage,
        ],
      };
    } else {
      salaryLinesData = this.getSelectedDataToSubmit('salaryGroup', {
        workerId: worker?.id,
        productionDate: salaryLines[0].productionDate,
      });
      modelData = {
        messages: [
          `Selected ${salaryLineMessage} for the service worker on date: ${
            salaryLines[0]?.productionDate
              ? this.formateProductionDate(salaryLines[0]?.productionDate)
              : ''
          } will be reset to pending.`,
          'Service Worker:',
          worker?.firstName || '',
          worker?.userName,
          `${salaryLineMessage}:`,
          ...linesMessage,
        ],
      };
      if (salaryLinesData.length === 0) {
        salaryLinesData.push({
          ServiceWorkerID: worker?.id ?? '',
          SalaryLineIDs: salaryLines
            .filter((x) => x.isManual === true)
            .map((x) => x.id),
        });
        modelData = {
          messages: [
            `All ${salaryLineMessage} for the service worker on date: ${
              salaryLines[0]?.productionDate
                ? this.formateProductionDate(salaryLines[0]?.productionDate)
                : ''
            } will be reset to pending.`,
            'Service Worker:',
            worker?.firstName || '',
            worker?.userName,
            `${salaryLineMessage}:`,
            ...linesMessage,
          ],
        };
      }
    }

    const ref = this.dialogService.open(ConfirmationDialogComponent, {
      header: isBulk ? 'Reset Statuses' : 'Reset Status',
      styleClass: isBulk
        ? 'p-dialog-sm p-dialog-draggable dialog-accent reset-statuses-dialog p-dialog-warning'
        : 'p-dialog-sm p-dialog-draggable dialog-accent reset-status-dialog p-dialog-warning',
      closable: true,
      modal: true,
      data: modelData,
      draggable: true,
      focusOnShow: false,
    });

    ref.onClose.subscribe(async (result: any) => {
      if (isBulk) {
        setTimeout(() => {
          const button = this.accordionMenuBtns
            .toArray()
            .find(
              (btn) =>
                btn.nativeElement.getAttribute('focus-id') ===
                this.lastAccMenuBtn
            );

          button?.nativeElement?.focus();
        }, 2500);
      } else {
        setTimeout(() => {
          const button = this.subAccordionMenuBtns
            .toArray()
            .find(
              (btn) =>
                btn.nativeElement.getAttribute('focus-id') ===
                this.lastSubAccMenuBtn
            );

          button?.nativeElement?.focus();
        }, 2500);
      }
      if (result?.confirmed) {
        await this.handleSalaryLineActions(
          salaryLinesData,
          6,
          index,
          salaryLines[0]?.productionDate
        );
      }
    });
  }

  salaryLinesRemove(
    index: number,
    salaryLines: GetSalaryLineDto[],
    worker?: GetServiceWorkerAgainstSalariesResponse,
    isBulk?: boolean
  ) {
    const linesMessage = salaryLines.map((line) => line.salaryCode);
    const salaryLineMessage =
      salaryLines?.length > 1 ? 'salary lines' : 'salary line';

    let salaryLinesData: SalaryLineIdsForAction[] = [];
    let modelData = {};

    if (salaryLines.length === 1) {
      salaryLinesData = this.getSelectedDataToSubmit('salaryLine', {
        workerId: worker?.id,
        salaryLineId: salaryLines[0].id,
      });
      modelData = {
        messages: [
          `The following ${salaryLineMessage} for the service worker on date: ${
            salaryLines[0]?.productionDate
              ? this.formateProductionDate(salaryLines[0]?.productionDate)
              : ''
          } will be permanently removed.`,
          'Service Worker:',
          worker?.firstName || '',
          worker?.userName,
          `${salaryLineMessage}:`,
          ...linesMessage,
        ],
      };
    } else {
      salaryLinesData = this.getSelectedDataToSubmit('salaryGroup', {
        workerId: worker?.id,
        productionDate: salaryLines[0].productionDate,
      });
      modelData = {
        messages: [
          `Selected ${salaryLineMessage} for the service worker on date: ${
            salaryLines[0]?.productionDate
              ? this.formateProductionDate(salaryLines[0]?.productionDate)
              : ''
          } will be permanently removed.`,
          'Service Worker:',
          worker?.firstName || '',
          worker?.userName,
          `${salaryLineMessage}:`,
          ...linesMessage,
        ],
      };

      if (salaryLinesData.length === 0) {
        salaryLinesData.push({
          ServiceWorkerID: worker?.id ?? '',
          SalaryLineIDs: salaryLines
            .filter((x) => x.isManual === true)
            .map((x) => x.id),
        });
        modelData = {
          messages: [
            `All ${salaryLineMessage} for the service worker on date: ${
              salaryLines[0]?.productionDate
                ? this.formateProductionDate(salaryLines[0]?.productionDate)
                : ''
            } will be permanently removed.`,
            'Service Worker:',
            worker?.firstName || '',
            worker?.userName,
            `${salaryLineMessage}:`,
            ...linesMessage,
          ],
        };
      }
    }

    const ref = this.dialogService.open(ConfirmationDialogComponent, {
      header: isBulk ? 'Remove Entries' : 'Remove Entry',
      styleClass: isBulk
        ? 'p-dialog-danger p-dialog-draggable dialog-accent remove-entries-dialog'
        : 'p-dialog-danger p-dialog-draggable dialog-accent remove-entries-dialog',
      closable: true,
      modal: true,
      data: modelData,
      draggable: true,
      focusOnShow: false,
    });

    ref.onClose.subscribe(async (result: any) => {
      if (result?.confirmed) {
        await this.handleSalaryLineActions(
          salaryLinesData,
          7,
          index,
          salaryLines[0]?.productionDate,
          worker
        );

        if (result?.key === "Enter" || result?.key === " ") {
            const isParent = isBulk;
            const buttons = isParent
              ? this.accordionMenuBtns.toArray()
              : this.subAccordionMenuBtns.toArray();

            const lastFocusId = isParent ? this.lastAccMenuBtn : this.lastSubAccMenuBtn;
            const currentIndex = buttons.findIndex(
              btn => btn.nativeElement.getAttribute("focus-id") === lastFocusId
            );

            const nextFocusId =
              buttons[currentIndex + 1]?.nativeElement.getAttribute("focus-id") ||
              buttons[currentIndex - 1]?.nativeElement.getAttribute("focus-id");

            setTimeout(() => {
              const newButtons = isParent
                ? this.accordionMenuBtns.toArray()
                : this.subAccordionMenuBtns.toArray();

              const nextButton = nextFocusId
                ? newButtons.find(
                    btn => btn.nativeElement.getAttribute("focus-id") === nextFocusId
                  )
                : null;

              if (nextButton) {
                nextButton.nativeElement.focus();
                return;
              }

              if (!isParent) {
                const parentButtons = this.accordionMenuBtns.toArray();
                const parentIndex = parentButtons.findIndex(
                  btn =>
                    btn.nativeElement.getAttribute("focus-id") === this.lastAccMenuBtn
                );

                const parentNextFocusId =
                  parentButtons[parentIndex + 1]?.nativeElement.getAttribute("focus-id") ||
                  parentButtons[parentIndex - 1]?.nativeElement.getAttribute("focus-id");

                const parentNextButton = parentNextFocusId
                  ? parentButtons.find(
                      btn =>
                        btn.nativeElement.getAttribute("focus-id") === parentNextFocusId
                    )
                  : null;

                if (parentNextButton) {
                  parentNextButton.nativeElement.focus();
                  return;
                }
              }

              const lastAccordion = document.querySelector(
                "p-accordion-panel:first-of-type .p-accordionheader"
              ) as HTMLElement;

              if (lastAccordion) {
                lastAccordion.classList.add("p-focus");
                lastAccordion.focus();
              } else {
                this.focusWorkerAutoComplete();
              }
            }, 2500);
        }
      } 

       else{
         if((result == undefined || result.key === 'Enter' || result.key === ' ')){
              if (isBulk) {
                const button = this.accordionMenuBtns
                .toArray()
                .find(btn => btn.nativeElement.getAttribute('focus-id') === this.lastAccMenuBtn);
                
                button?.nativeElement?.focus();
              }
              else{
                const button = this.subAccordionMenuBtns
                .toArray()
                .find(btn => btn.nativeElement.getAttribute('focus-id') === this.lastSubAccMenuBtn);
                button?.nativeElement?.focus();
              }
          }
      }
    });
  }

  openSalaryLineMenu(
    event: MouseEvent,
    menu: Menu,
    accordionIndex: number,
    worker: GetServiceWorkerAgainstSalariesResponse,
    salaryLine: GetSalaryLineDto
  ) {
    const isReadOnly = this.isSalaryLineReadOnly(salaryLine);
    this.lastSubAccMenuBtn = salaryLine.id;

    this.salaryListMenuItems = [
      {
        label: 'Edit Entry',
        styleClass: 'list-default fs-14',
        command: () => this.editSalaryLine(salaryLine, [worker]),
        disabled: !this.canEditSalaryLine(salaryLine.statusId) || isReadOnly,
        visible: this.accessService.hasPermission(
          Permissions.SALARY_CAPTURE_EDIT_BUTTON
        ),
      },
      {
        label: 'Reset Status',

        styleClass: 'list-warning fs-14',
        command: () =>
          this.salaryLineReset(
            accordionIndex,
            [salaryLine],
            worker,
            SalaryStatus.Pending
          ),
        disabled:
          salaryLine.statusId === 1 ||
          !salaryLine.isManual ||
          !this.canResetSalaryLine() ||
          isReadOnly,
        visible: this.accessService.hasPermission(
          Permissions.SALARY_CAPTURE_RESET_BUTTON
        ),
      },
      {
        label: 'Remove Entry',
        styleClass: 'list-danger fs-14',
        command: () =>
          this.salaryLinesRemove(accordionIndex, [salaryLine], worker),
        disabled: !this.canRemoveSalaryLines(salaryLine),
        visible:
          this.accessService.hasPermission(
            Permissions.SALARY_CAPTURE_REMOVEENTRY_SALARY_BUTTON
          ) || isReadOnly,
      },
    ];

    menu.toggle(event);
    event.stopPropagation();
    event.preventDefault();
  }

  onMenuClick(
    event: MouseEvent,
    accordionIndex: number,
    salary: any,
    serviceWorker: GetServiceWorkerAgainstSalariesResponse,
    menu: Menu,
    focusId: any
  ) {
    this.salaryMenuItems = this.gridMenus(
      accordionIndex,
      salary,
      serviceWorker
    );
    menu.toggle(event);
    this.lastAccMenuBtn = focusId;
  }

  hasManualSalary(salaries: SalaryLine[]) {
    return salaries.some((x) => x.isManual === true);
  }

  hasAllReadOnlySalaryLines(salaries: any[]) {
    return salaries.every((x) => this.isSalaryLineReadOnly(x));
  }

  gridMenus(
    accordionIndex: number,
    salary: any,
    serviceWorker: GetServiceWorkerAgainstSalariesResponse
  ) {
    return [
      {
        label: 'Reset Statuses',
        styleClass: 'list-warning fs-14',
        command: () =>
          this.salaryLineReset(
            accordionIndex,
            salary.salaryLines,
            serviceWorker,
            SalaryStatus.Pending,
            true
          ),
        disabled:
          !this.hasManualSalary(salary.salaryLines) ||
          salary.statusId === 1 ||
          !this.canResetSalaryLine(),
        visible: this.accessService.hasPermission(
          Permissions.SALARY_CAPTURE_RESET_BUTTON
        ),
      },
      {
        label: 'Remove Entries',
        styleClass: 'list-danger fs-14',
        command: () =>
          this.salaryLinesRemove(
            accordionIndex,
            salary.salaryLines,
            serviceWorker,
            true
          ),
        disabled: !this.canRemoveSalaryGroup(salary),
        visible: this.accessService.hasPermission(
          Permissions.SALARY_CAPTURE_REMOVEENTRY_SALARY_BUTTON
        ),
      },
    ];
  }

  editSalaryLine(
    salaryLine: GetSalaryLineDto,
    serviceWorker: GetServiceWorkerAgainstSalariesResponse[]
  ) {
    const selectedServiceWorkers =
      this.mapToServiceWorkersByFilter(serviceWorker);

    const data: SalaryLineDialogConfig = {
      mode: SALARY_LINE_DIALOG_MODE.EDIT,
      openedFromHeader: false,
      salaryLine: salaryLine,
      serviceWorkers: selectedServiceWorkers,
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
      data: data,
    });

    ref?.onClose?.subscribe(async (result: AddSalaryLineDialogResponse) => {
      setTimeout(() => {
        const button = this.subAccordionMenuBtns
          .toArray()
          .find(
            (btn) =>
              btn.nativeElement.getAttribute('focus-id') ===
              this.lastSubAccMenuBtn
          );
        button?.nativeElement?.focus();
      }, 2500);

      if (result?.success) {
        // Store expansion context for edit operations (same as action methods)
        if (
          this.selectedWorker !== null &&
          this.selectedWorker >= 0 &&
          this.selectedWorker < this.serviceWorkers.length
        ) {
          this.expandAfterAction.serviceWorkerId =
            this.serviceWorkers[this.selectedWorker].id;
          // Store the currently expanded p-table row (production date)
          const openedSalaryGroupDate =
            this.formatProductionDateForExpansion(
              new Date(result.salaryLines[0]?.productionDate)
            ) || '';
          this.expandAfterAction.productionDate = openedSalaryGroupDate;
        }

        // Refresh and restore expansion
        await this.loadServiceWorkers(this.salaryCaptureFilterRequest);
        await this.expandBasedOnStoredIds();
      }
    });
  }

  async onWorkerFilterSelected(event: any) {
    const selectedWorker = event.value; // The selected worker object

    const filteredServiceWorkers = this.allServiceWorkers.filter(
      (sw) => sw.id === selectedWorker.id
    );

    if (filteredServiceWorkers.length === 0 && this.canAddSalaryLine()) {
      this.setGlobalSearchTerm.emit('');
      this.addSalaryLine(selectedWorker, true, true);
    } else {
      this.serviceWorkers = filteredServiceWorkers;
      this.first = 0; // reset to first page
      this.updatePagedServiceWorkers();
      await this.getSalary(0, true);
      this.active = 0;
    }

    // Your logic here, e.g., add to selectedServiceWorkers or show details
  }

  async navigateToSalaryLine(
    serviceWorkerId: string,
    productionDate: string,
    salaryLineId: string
  ): Promise<void> {
    try {
      // Find the worker index in the full serviceWorkers list (not allServiceWorkers)
      const globalIndex = this.serviceWorkers.findIndex(
        (sw) => sw.id === serviceWorkerId
      );

      if (globalIndex === -1) {
        console.error(
          'Worker not found in current filtered list:',
          serviceWorkerId
        );
        return;
      }

      const worker = this.serviceWorkers[globalIndex];

      // Determine and switch to the correct page
      const targetPage = this.getPageForWorkerId(serviceWorkerId);
      this.first = targetPage * this.pageSize;
      this.updatePagedServiceWorkers();

      // Wait for pagination and DOM to update
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Calculate the local index within the current page
      const localIndex = globalIndex % this.pageSize;

      // Activate accordion for this worker
      this.active = localIndex;
      this.selectedWorker = globalIndex;

      // Load salaries for this worker
      await this.getSalary(localIndex, true);

      // Wait for salaries to load, then expand the production date and scroll to salary line
      setTimeout(() => {
        // Try to find the salary by production date (handle different date formats)
        let salary = this.salaries.find(
          (s) => s.productionDate === productionDate
        );

        // If not found, try comparing dates directly
        if (!salary) {
          salary = this.salaries.find((s) => {
            const sDate = new Date(s.productionDate);
            const pDate = new Date(productionDate);
            return sDate.toDateString() === pDate.toDateString();
          });
        }

        // Fallback to first salary if still not found
        if (!salary && this.salaries?.length > 0) {
          console.warn('Exact production date not found, using first salary');
          salary = this.salaries[0];
        }

        if (!salary) {
          console.error('No salary found for production date:', productionDate);
          return;
        }

        // Expand the salary row to show salary lines
        const salaryLines = salary.salaryLines || [];

        // Mark this row as expanded
        this.expandedRows[salary.productionDate] = true;

        // Set the navigated salary line ID for highlighting
        this.navigatedSalaryLineId = salaryLineId;

        // Call getSalaryLinesv2 to populate the timeline and salary lines
        this.getSalaryLinesv2(
          salary,
          salaryLines,
          false,
          worker,
          salary.productionDate,
          salaryLineId,
          true
        );

        // Scroll to the worker accordion after everything is rendered
        setTimeout(() => {
          const accordionId = `salaryCaptureAccPanel${localIndex}`;
          this.scrollToElementById(accordionId);
        }, 300);

        // Clear the highlight after 3 seconds
        setTimeout(() => {
          this.navigatedSalaryLineId = null;
          this.conflictedSalaryLineData = undefined;
        }, 3000);
      }, 500);
    } catch (error) {
      console.error('Error navigating to salary line:', error);
    }
  }

  onWorkerFilterCleared() {
    if (this.serviceWorkers.length !== this.allServiceWorkers.length) {
      this.serviceWorkers = this.allServiceWorkers; // Reset to all workers
      this.active = -1;
      this.first = 0; // reset to first page
      this.updatePagedServiceWorkers();
    }

      this.filteredWorkers = []; // Clear the filtered list
      //this.active = -1;
    }    
    stopEventBubbling(e: any) {
      e.stopPropagation();
      e.preventDefault();
    }
  
    stopProp(e: any) {
      e.stopPropagation();
    }

    private async restoreExpansionAfterApproveAction(
      salaryLinesData: SalaryLineIdsForAction[],
      action: number,
      index: number | null,
      targetProductionDate?: string,
      lastWorker?: GetServiceWorkerAgainstSalariesResponse
    ): Promise<void> {
      // Store which accordion should be expanded after refresh (simple approach)
      const globalIndex = this.getGlobalWorkerIndex(index);
      if (globalIndex >= 0 && globalIndex < this.serviceWorkers.length) {
        this.expandAfterAction.serviceWorkerId = this.serviceWorkers[globalIndex].id;
        // Use the actual target production date from the action context (not what's currently expanded)
        this.expandAfterAction.productionDate = targetProductionDate || null;
      }
  
      this.clearSelectedState();

      const salaryLineActionsRequest: SalaryLineActionsRequest = {
        salariesLines: salaryLinesData,
        actionId: action,
        ...this.salaryCaptureFilterRequest,
      };

      // Simple refresh and expand based on stored IDs
      await this.loadServiceWorkers(this.salaryCaptureFilterRequest, lastWorker);
      await this.expandBasedOnStoredIds();
    }

    private async handleSalaryLineActions(
      salaryLinesData: SalaryLineIdsForAction[],
      action: number,
      index: number | null,
      targetProductionDate?: string,
      lastWorker?: GetServiceWorkerAgainstSalariesResponse
    ): Promise<void> {
      // Store which accordion should be expanded after refresh (simple approach)
      const globalIndex = this.getGlobalWorkerIndex(index);
      if (globalIndex >= 0 && globalIndex < this.serviceWorkers.length) {
        this.expandAfterAction.serviceWorkerId = this.serviceWorkers[globalIndex].id;
        // Use the actual target production date from the action context (not what's currently expanded)
        this.expandAfterAction.productionDate = targetProductionDate || null;
      }
  
      this.clearSelectedState();
  
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
  
              // Simple refresh and expand based on stored IDs
              await this.loadServiceWorkers(this.salaryCaptureFilterRequest, lastWorker);
              await this.expandBasedOnStoredIds();
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
      }
    }

    private getSalaryActionMessageKey(
      action: number,
      salaryLinesData: SalaryLineIdsForAction[],
      isSuccess: boolean
    ): string {
      const getMessageKey = (
        action: number,
        selectionType: string,
        isSuccess: boolean
      ) => {
        // Get action base key
        const baseKey = (() => {
          switch (action) {
            case 2:
              return 'REJECT';
            case 3:
              return 'APPROVE';
            case 6:
              return 'RESET';
            case 7:
              return 'DELETE';
            default:
              return 'GENERIC';
          }
        })();
  
        // Map selection type to message prefix
        const prefix = (() => {
          switch (selectionType) {
            case 'all':
              return 'ALL';
            case 'worker':
              return 'SERVICE_WORKER';
            case 'salaryGroup':
              return 'SALARY_GROUP';
            case 'salaryLine':
              return 'SALARY_LINE';
            default:
              return 'GENERIC';
          }
        })();
  
        const suffix = isSuccess ? '_SUCCESS' : '_FAILED';
        return `SALARYLINE_${prefix}_${baseKey}${suffix}`;
      };
  
      // Get selection type from salaryLinesData length and structure
      const selectionType = (() => {
        if (salaryLinesData.length === 0) return 'all';
        if (salaryLinesData.length === 1) {
          if (
            !salaryLinesData[0].SalaryLineIDs ||
            salaryLinesData[0].SalaryLineIDs.length === 0
          ) {
            return 'worker'; // Single worker, no specific lines
          }
          if (salaryLinesData[0].SalaryLineIDs.length === 1) {
            return 'salaryLine'; // Single salary line
          }
          return 'salaryGroup'; // Multiple lines for one worker
        }
        return 'all'; // Multiple workers
      })();
  
      return getMessageKey(action, selectionType, isSuccess); // Assuming success by default
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
      const focusedHeader = document.querySelector(
        '.p-accordionheader.p-focus'
      );

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
    }, 10);
  }

  focusPaginatorSelectedIfEndReached(): void {
    setTimeout(() => {
      const nextBtn = document.querySelector(
        '.p-paginator-next'
      ) as HTMLElement;

      const lastBtn = document.querySelector(
        '.p-paginator-last'
      ) as HTMLElement;

      const prevtBtn = document.querySelector(
        '.p-paginator-prev'
      ) as HTMLElement;

      const firsttBtn = document.querySelector(
        '.p-paginator-first'
      ) as HTMLElement;

      const bothEndBtnsDisabled =
        nextBtn?.classList.contains('p-disabled') &&
        lastBtn?.classList.contains('p-disabled');

      const bothStartBtnsDisabled =
        prevtBtn?.classList.contains('p-disabled') &&
        firsttBtn?.classList.contains('p-disabled');

      if (bothEndBtnsDisabled || bothStartBtnsDisabled) {
        const selectedPage = document.querySelector(
          '.p-paginator-page-selected'
        ) as HTMLElement;

        if (selectedPage) {
          selectedPage.focus();
        }
      }
    });
  }

  handlePaginatorTabNavigation() {
  const observePaginator = () => {
    const paginator = document.querySelector('.p-paginator');
    if (paginator) {
      this.attachPaginatorListener(paginator);
      return;
    }
    const observer = new MutationObserver(() => {
      const paginator = document.querySelector('.p-paginator');
      if (paginator) {
        this.attachPaginatorListener(paginator);
        observer.disconnect();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  };

  observePaginator();
}

 private attachPaginatorListener(paginator: Element) {
  
  const keyListener = (event: KeyboardEvent) => {
    if (event.key !== 'Tab' || event.shiftKey) return;

    const nextBtn = document.querySelector('.p-paginator-next') as HTMLElement;
    const lastBtn = document.querySelector('.p-paginator-last') as HTMLElement;
    const pageButtons = Array.from(
      document.querySelectorAll('.p-paginator-pages .p-paginator-page')
    ) as HTMLElement[];

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
      const element = document.getElementById('gridView') as HTMLElement;
      element?.focus();
    }

    if (bothEnabled && isFocusedOnLastBtn) {
       const element = document.getElementById('gridView') as HTMLElement;
       element?.focus();
    }
  };

  paginator.addEventListener('keydown', keyListener as EventListener);
}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Helper: unique key for a salary group (workerId + productionDate)
  public salaryKey(workerId: string, productionDate: string): string {
    return `${workerId}__${productionDate}`;
  }

  // Return all salaryLine ids for a salary object
  private getAllSalaryLineIdsForSalary(salary: any): string[] {
    return (salary.salaryLines || []).map((l: any) => l.id);
  }

  // ===== UI helpers used by template for checked / indeterminate states =====
  public isWorkerChecked(workerId: string): boolean {
    return this.selectedState.workers.has(workerId);
  }

  public isWorkerIndeterminate(worker: any): boolean | undefined {
    if (!worker) return false;
    const workerId = worker.id;
    if (this.isWorkerChecked(workerId)) return false;

    // If salaries aren't loaded yet, any recorded partials imply indeterminate
    if (!this.salaryCache.has(workerId)) {
      const s = this.selectedState.salaries.get(workerId);
      const l = this.selectedState.salaryLines.get(workerId);
      return (s && s.size > 0) || (l && l.size > 0);
    }

    // Compute totals and selected counts
    const salaries = this.salaryCache.get(workerId) || [];
    if (!salaries || salaries.length === 0) {
      // fallback to any recorded partial state
      const s = this.selectedState.salaries.get(workerId);
      const l = this.selectedState.salaryLines.get(workerId);
      return (s && s.size > 0) || (l && l.size > 0);
    }

    // total salary groups
    const totalSalaryGroups = salaries.length;

    // selected salary groups
    const selSalarySet = new Set<string>(
      this.selectedState.salaries.get(workerId)
        ? Array.from(this.selectedState.salaries.get(workerId)!)
        : []
    );

    // selected lines
    const lineSet =
      this.selectedState.salaryLines.get(workerId) || new Set<string>();
    const totalLines = salaries.reduce(
      (acc: number, s: any) => acc + (s.salaryLines || []).length,
      0
    );
    const selectedLinesCount = lineSet.size;

    // If some but not all salary groups selected -> indeterminate
    if (selSalarySet.size > 0 && selSalarySet.size < totalSalaryGroups)
      return true;

    // If some but not all lines selected -> indeterminate
    if (selectedLinesCount > 0 && selectedLinesCount < totalLines) return true;

    return false;
  }

  public isSalaryChecked(
    workerId: string,
    salaryProductionDate: string
  ): boolean {
    // If worker fully selected -> salary checked
    if (this.selectedState.workers.has(workerId)) return true;

    const key = this.salaryKey(workerId, salaryProductionDate);
    const set = this.selectedState.salaries.get(workerId);
    return !!(set && set.has(key));
  }

  public isSalaryIndeterminate(worker: any, salary: any): boolean {
    // If salary is fully selected, it's not indeterminate
    if (this.isSalaryChecked(worker.id, salary.productionDate)) return false;

    const lineSet =
      this.selectedState.salaryLines.get(worker.id) || new Set<string>();
    const allLineIds = this.getAllSalaryLineIdsForSalary(salary);
    if (!allLineIds || allLineIds.length === 0) return false;

    const selectedCount = allLineIds.filter((id) => lineSet.has(id)).length;
    return selectedCount > 0 && selectedCount < allLineIds.length;
  }

  public isSalaryLineChecked(workerId: string, salaryLineId: string): boolean {
    // Fully selected worker implies every line is selected
    if (this.selectedState.workers.has(workerId)) return true;
    const set = this.selectedState.salaryLines.get(workerId);
    return !!(set && set.has(salaryLineId));
  }

  // ===== Handlers =====

  // Worker-level checkbox toggled
  public onWorkerCheckboxChange(worker: any, checked: boolean) {
    const workerId = worker.id;
    if (checked) {
      // Mark worker fully selected
      this.selectedState.workers.add(workerId);

      // Clear partial selections for this worker (we consider fully selected now)
      this.selectedState.salaries.delete(workerId);

      // If we have salary data cached for this worker, populate salaryLines set
      const cached = this.salaryCache.get(workerId);
      if (cached && cached.length > 0) {
        const allLineIds = cached.flatMap((s: any) =>
          (s.salaryLines || []).map((l: any) => l.id)
        );
        if (allLineIds.length > 0) {
          this.selectedState.salaryLines.set(workerId, new Set(allLineIds));
        }
      } else {
        // salaries not loaded -> keep as fully selected, will populate on load
      }
    } else {
      // Unselect fully and remove any partials
      this.selectedState.workers.delete(workerId);
      this.selectedState.salaries.delete(workerId);
      this.selectedState.salaryLines.delete(workerId);
    }

    // If this worker's salaries are currently displayed in the view (this.salaries),
    // rebuild the checked arrays so p-table / nested table selection reflect the state.
    if (this.serviceWorkers[this.selectedWorker ?? 0]?.id === workerId) {
      this.rebuildCheckedSalariesForView(workerId);
      // If a nested salary is expanded and salaryLine[] is set, rebuild nested selection
      if (this.salaryLine?.length) {
        this.checkedSalaryLines = this.salaryLine.filter((l: any) =>
          this.isSalaryLineChecked(workerId, l.id)
        );
      }
    }
  }

  // Salary-row checkbox toggled: select/deselect all salary lines under that salary
  public onSalaryCheckboxChange(worker: any, salary: any, checked: boolean) {
    const workerId = worker.id;
    const key = this.salaryKey(workerId, salary.productionDate);

    // Ensure sets exist
    if (!this.selectedState.salaries.has(workerId))
      this.selectedState.salaries.set(workerId, new Set<string>());
    if (!this.selectedState.salaryLines.has(workerId))
      this.selectedState.salaryLines.set(workerId, new Set<string>());

    const salarySet = this.selectedState.salaries.get(workerId)!;
    const lineSet = this.selectedState.salaryLines.get(workerId)!;

    const allLineIds = this.getAllSalaryLineIdsForSalary(salary);

    if (checked) {
      // Mark this salary selected
      salarySet.add(key);
      // add all its lines
      allLineIds.forEach((id) => lineSet.add(id));
    } else {
      // Remove salary selected flag
      salarySet.delete(key);
      // remove its lines
      allLineIds.forEach((id) => lineSet.delete(id));
      // Unset fully-selected worker if it was set
      this.selectedState.workers.delete(workerId);

      // If no more selections exist for this worker, clean up the maps
      if (salarySet.size === 0 && lineSet.size === 0) {
        this.selectedState.salaries.delete(workerId);
        this.selectedState.salaryLines.delete(workerId);
      }
    }

    // Recompute worker promotion (if all salaries lines/groups selected -> worker fully selected)
    this.recomputeWorkerPromotion(workerId);

    // Update UI tables if viewing this worker
    if (this.serviceWorkers[this.selectedWorker ?? 0]?.id === workerId) {
      this.rebuildCheckedSalariesForView(workerId);

      // if this salary is the currently expanded one, update nested selection too
      if (this.salaryLine?.length && this.salaryLine === salary.salaryLines) {
        this.checkedSalaryLines = this.salaryLine.filter((l: any) =>
          this.isSalaryLineChecked(workerId, l.id)
        );
      }
    }
  }

  // Salary-line checkbox toggled
  public onSalaryLineCheckboxChange(
    worker: GetServiceWorkerAgainstSalariesResponse,
    salary: SalaryResponseDto,
    salaryLine: SalaryLine,
    checked: boolean
  ) {
    const workerId = worker.id;
    const salaryKeyLocal = this.salaryKey(workerId, salary.productionDate);

    if (!this.selectedState.salaryLines.has(workerId)) {
      this.selectedState.salaryLines.set(workerId, new Set<string>());
    }
    const lineSet =
      this.selectedState.salaryLines.get(workerId) || new Set<string>();

    if (checked) {
      lineSet.add(salaryLine.id);
      this.selectedState.salaryLines.set(workerId, lineSet);
    } else {
      lineSet.delete(salaryLine.id);
      // if this line was contributing to a salary being fully selected, ensure salarySet reflects it
    }

    // If all lines in this salary are selected now, ensure salarySet includes the salaryKey
    const allLineIds = this.getAllSalaryLineIdsForSalary(salary);
    const allLinesSelected =
      allLineIds.length > 0 && allLineIds.every((id) => lineSet.has(id));

    if (allLinesSelected) {
      if (!this.selectedState.salaries.has(workerId)) {
        this.selectedState.salaries.set(workerId, new Set<string>());
      }
      const salarySet =
        this.selectedState.salaries.get(workerId) || new Set<string>();
      salarySet.add(salaryKeyLocal);
      this.selectedState.salaries.set(workerId, salarySet);
    } else {
      // remove salary-key if it exists
      const salarySet = this.selectedState.salaries.get(workerId);
      if (salarySet) {
        salarySet.delete(salaryKeyLocal);
        if (salarySet.size === 0) {
          this.selectedState.salaries.delete(workerId);
        }
      }
    }

    // If user unchecked a line under a fully selected worker -> downgrade worker
    if (!lineSet.has(salaryLine.id)) {
      this.selectedState.workers.delete(workerId);
    }

    // Clean up empty maps
    if (lineSet.size === 0) {
      this.selectedState.salaryLines.delete(workerId);
    }

    // After line change, recompute worker promotion/demotion
    this.recomputeWorkerPromotion(workerId);

    // Update UI arrays for currently viewed worker/salary
    if (this.serviceWorkers[this.selectedWorker ?? 0]?.id === workerId) {
      this.rebuildCheckedSalariesForView(workerId);
      // if current nested salary shown, update checkedSalaryLines
      this.checkedSalaryLines = this.salaryLine
        ? this.salaryLine.filter((l: any) =>
            this.isSalaryLineChecked(workerId, l.id)
          )
        : [];
    }
  }

  // Recompute worker promotion: if all salary groups (or all lines across salaries) are selected => mark worker fully selected.
  private recomputeWorkerPromotion(workerId: string) {
    const cachedSalaries = this.salaryCache.get(workerId) || [];
    if (!cachedSalaries || cachedSalaries.length === 0) {
      // no way to determine yet (salaries not loaded) — keep whatever user marked
      return;
    }

    // Build selectedSalaryKeys: include explicit ones and ones implied by all-lines-selected
    const explicitSalarySet = this.selectedState.salaries.get(workerId)
      ? new Set(this.selectedState.salaries.get(workerId))
      : new Set<string>();
    const lineSet =
      this.selectedState.salaryLines.get(workerId) || new Set<string>();

    const computedSalarySet = new Set<string>(explicitSalarySet);

    for (const s of cachedSalaries) {
      const sk = this.salaryKey(workerId, s.productionDate);
      const allLineIds = this.getAllSalaryLineIdsForSalary(s);
      if (allLineIds.length > 0 && allLineIds.every((id) => lineSet.has(id))) {
        computedSalarySet.add(sk);
      }
    }

    const allSalaryKeys = cachedSalaries.map((s: any) =>
      this.salaryKey(workerId, s.productionDate)
    );

    // If every salary for this worker is present in computedSalarySet -> worker is fully selected
    const allSelected =
      allSalaryKeys.length > 0 &&
      allSalaryKeys.every((k) => computedSalarySet.has(k));

    if (allSelected) {
      // promote to fully selected worker
      this.selectedState.workers.add(workerId);
      // keep salaryLines populated (helps UI), but clear salaries map
      this.selectedState.salaries.delete(workerId);
    } else {
      this.selectedState.workers.delete(workerId);
      // update selectedState.salaries to the computed set (so UI accurately represents selected salary groups)
      this.selectedState.salaries.set(workerId, computedSalarySet);
    }
  }

  // Rebuild the checkedSalaries array used by PrimeNG top table for the current view
  private rebuildCheckedSalariesForView(workerId: string) {
    // this.salaries is the current worker salaries (populated by getSalary)
    if (!this.salaries || !Array.isArray(this.salaries)) {
      this.checkedSalaries = [];
      return;
    }
    // top table expects objects, so select those salaries where salaryKey is selected or worker is fully selected
    this.checkedSalaries = this.salaries.filter((s: any) =>
      this.isSalaryChecked(workerId, s.productionDate)
    );
  }

  // (de)select all lines under the current worker's salaries
  public onSalariesHeaderChange(checked: boolean) {
    const workerId = this.serviceWorkers[this.selectedWorker ?? 0]?.id;
    if (!workerId || !this.salaries) return;

    // Ensure line set for worker exists
    if (!this.selectedState.salaryLines.has(workerId))
      this.selectedState.salaryLines.set(workerId, new Set<string>());
    const lineSet = this.selectedState.salaryLines.get(workerId)!;

    if (checked) {
      // Select all lines across all salaries in current view
      for (const s of this.salaries) {
        const ids = this.getAllSalaryLineIdsForSalary(s);
        ids.forEach((id) => lineSet.add(id));
      }
    } else {
      // Unselect all lines for this worker
      lineSet.clear();
    }

    // Recompute promotion/demotion after toggling
    this.recomputeWorkerPromotion(workerId);

    // Update UI selections for top table + nested
    this.rebuildCheckedSalariesForView(workerId);
    if (this.salaryLine?.length) {
      this.checkedSalaryLines = this.salaryLine.filter((l: any) =>
        this.isSalaryLineChecked(workerId, l.id)
      );
    }

    // Trigger change detection for select all checkbox state
    this.cdr.detectChanges();
  }

  //  check if all salary lines for this salary are selected
  areAllSalaryLinesChecked(workerId: string, salaryLines: any[]): boolean {
    if (!salaryLines || !salaryLines.length) return false;
    return salaryLines.every((l) => this.isSalaryLineChecked(workerId, l.id));
  }

  // check if some but not all salary lines are selected (for indeterminate state)
  areSomeSalaryLinesChecked(workerId: string, salaryLines: any[]): boolean {
    if (!salaryLines || !salaryLines.length) return false;
    const someChecked = salaryLines.some((l) =>
      this.isSalaryLineChecked(workerId, l.id)
    );
    return someChecked && !this.areAllSalaryLinesChecked(workerId, salaryLines);
  }

  // ===== END: Selection state & helpers =====

  // Build payload for API submission based on action level
  public getSelectedDataToSubmit(
    level: 'all' | 'worker' | 'salaryGroup' | 'salaryLine' = 'all',
    options?: {
      workerId?: string;
      productionDate?: string;
      salaryLineId?: string;
    }
  ): SalaryLineIdsForAction[] {
    const salariesLineData: SalaryLineIdsForAction[] = [];

    switch (level) {
      case 'salaryLine': {
        // Handle single salary line selection
        if (!options?.workerId || !options?.salaryLineId) {
          throw new Error(
            'Worker ID and Salary Line ID are required for salary line level actions'
          );
        }
        salariesLineData.push({
          ServiceWorkerID: options.workerId,
          SalaryLineIDs: [options.salaryLineId],
        });
        break;
      }

      case 'salaryGroup': {
        // Handle salary group selection (all lines for a specific date)
        if (!options?.workerId || !options?.productionDate) {
          throw new Error(
            'Worker ID and Production Date are required for salary group level actions'
          );
        }

        // Only include lines if the worker is fully selected or this specific salary group is selected
        if (this.selectedState.workers.has(options.workerId)) {
          const salary = this.salaryCache
            .get(options.workerId)
            ?.find((s) => s.productionDate === options.productionDate);
          if (salary) {
            const groupLines = this.getAllSalaryLineIdsForSalary(salary);
            salariesLineData.push({
              ServiceWorkerID: options.workerId,
              SalaryLineIDs: groupLines,
            });
          }
        } else {
          const salarySet = this.selectedState.salaries.get(options.workerId);
          const lineSet = this.selectedState.salaryLines.get(options.workerId);
          const key = this.salaryKey(options.workerId, options.productionDate);

          if (salarySet?.has(key)) {
            // The entire salary group is selected
            const salary = this.salaryCache
              .get(options.workerId)
              ?.find((s) => s.productionDate === options.productionDate);
            if (salary) {
              const groupLines = this.getAllSalaryLineIdsForSalary(salary);
              salariesLineData.push({
                ServiceWorkerID: options.workerId,
                SalaryLineIDs: groupLines,
              });
            }
          } else if (lineSet) {
            // Check for individually selected lines in this group
            const salary = this.salaryCache
              .get(options.workerId)
              ?.find((s) => s.productionDate === options.productionDate);
            if (salary) {
              const selectedLines = this.getAllSalaryLineIdsForSalary(
                salary
              ).filter((id) => lineSet.has(id));
              if (selectedLines.length > 0) {
                salariesLineData.push({
                  ServiceWorkerID: options.workerId,
                  SalaryLineIDs: selectedLines,
                });
              }
            }
          }
        }
        break;
      }

      case 'worker': {
        // Handle single worker selection (all lines for one worker)
        if (!options?.workerId) {
          throw new Error('Worker ID is required for worker level actions');
        }

        // If worker is fully selected, only send worker ID with empty lines array
        if (this.selectedState.workers.has(options.workerId)) {
          salariesLineData.push({
            ServiceWorkerID: options.workerId,
            SalaryLineIDs: [], // Empty array for fully selected worker
          });
        }
        // For partial selections, send only selected lines
        else if (this.selectedState.salaryLines.has(options.workerId)) {
          const selectedLines = Array.from(
            this.selectedState.salaryLines.get(options.workerId) || []
          );
          if (selectedLines.length > 0) {
            salariesLineData.push({
              ServiceWorkerID: options.workerId,
              SalaryLineIDs: selectedLines,
            });
          }
        }
        break;
      }
      case 'all':
      default:
        // Handle fully selected workers
        for (const workerId of this.selectedState.workers) {
          salariesLineData.push({
            ServiceWorkerID: workerId,
            SalaryLineIDs: [], // Empty array indicates full worker selection
          });
        }
        // Handle partially selected workers
        for (const [
          workerId,
          lineSet,
        ] of this.selectedState.salaryLines.entries()) {
          if (!this.selectedState.workers.has(workerId) && lineSet.size > 0) {
            salariesLineData.push({
              ServiceWorkerID: workerId,
              SalaryLineIDs: Array.from(lineSet),
            });
          }
        }
        break;
    }

    return salariesLineData;
  }

  clearSelectedState(): void {
    this.selectedState.workers.clear();
    this.selectedState.salaries.clear();
    this.selectedState.salaryLines.clear();
    this.salaryCache.clear();

    // If you want Angular to update checkboxes immediately
    try {
      this.cdr.detectChanges();
    } catch (error) {
      /* Ignore change detection errors */
    }
  }

  // ============ SELECT ALL WORKERS FUNCTIONALITY ============

  isAllWorkersChecked(): boolean {
    if (!this.serviceWorkers || this.serviceWorkers.length === 0) return false;
    return this.serviceWorkers.every((worker) =>
      this.selectedState.workers.has(worker.id)
    );
  }

  isAllWorkersIndeterminate(): boolean {
    if (!this.serviceWorkers || this.serviceWorkers.length === 0) return false;

    // If all workers are selected, not indeterminate
    if (this.isAllWorkersChecked()) return false;

    // Check if any worker has any selection (full, partial salary, or partial lines)
    return this.serviceWorkers.some((worker) => {
      const workerId = worker.id;

      // Worker fully selected
      if (this.selectedState.workers.has(workerId)) return true;

      // Worker has some salaries selected
      const salarySet = this.selectedState.salaries.get(workerId);
      if (salarySet && salarySet.size > 0) return true;

      // Worker has some salary lines selected
      const lineSet = this.selectedState.salaryLines.get(workerId);
      if (lineSet && lineSet.size > 0) return true;

      return false;
    });
  }

  onSelectAllWorkersChange(checked: boolean): void {
    if (!this.serviceWorkers || this.serviceWorkers.length === 0) return;

    if (checked) {
      // Select all workers
      this.serviceWorkers.forEach((worker) => {
        this.selectedState.workers.add(worker.id);

        // Clear any partial selections for this worker since they're now fully selected
        this.selectedState.salaries.delete(worker.id);

        // If salaries are cached for this worker, populate salary lines for UI consistency
        const cached = this.salaryCache.get(worker.id);

        if (cached && cached.length > 0) {
          const allLineIds = cached.flatMap((s: any) =>
            (s.salaryLines || []).map((l: any) => l.id)
          );

          if (allLineIds.length > 0) {
            this.selectedState.salaryLines.set(worker.id, new Set(allLineIds));
          }
        }
      });
    } else {
      // Deselect all workers
      this.serviceWorkers.forEach((worker) => {
        this.selectedState.workers.delete(worker.id);
        this.selectedState.salaries.delete(worker.id);
        this.selectedState.salaryLines.delete(worker.id);
      });
    }

    // Update UI for currently viewed worker if any
    const currentWorkerId = this.serviceWorkers[this.selectedWorker ?? 0]?.id;

    if (currentWorkerId) {
      this.rebuildCheckedSalariesForView(currentWorkerId);

      // If nested salary is expanded and salaryLine[] is set, rebuild nested selection
      if (this.salaryLine?.length) {
        this.checkedSalaryLines = this.salaryLine.filter((l: any) =>
          this.isSalaryLineChecked(currentWorkerId, l.id)
        );
      }
    }
  }

  // ============ ACCORDION STATE PRESERVATION METHODS ============

  /**
   * Handles the auto-expand requirement when a new salary line is added
   * Expands the specific worker accordion and the production date table row
   */
  /**
   * Handles the auto-expand requirement when a new salary line is added
   * Works with client-side pagination (p-paginator)
   */
  private async handleNewSalaryLineAdded(
    serviceWorkerId: string,
    productionDate: Date,
    salaryLineId = '',
    scrollToView = false
  ): Promise<void> {
    try {
      // Refresh data so the new line is included
      await this.loadServiceWorkers(this.salaryCaptureFilterRequest);

      // Determine and switch to the correct page first
      const targetPage = this.getPageForWorkerId(serviceWorkerId);
      this.first = targetPage * this.pageSize;
      this.updatePagedServiceWorkers();

      // Wait for paginator & DOM to render current page
      await new Promise((r) => setTimeout(r, 200));

      // Find the worker index in the full list
      const globalIndex = this.serviceWorkers.findIndex(
        (w) => w.id === serviceWorkerId
      );
      if (globalIndex === -1) {
        console.warn(
          'Worker not found after adding salary line, fallback refresh'
        );
        await this.loadServiceWorkers(this.salaryCaptureFilterRequest);
        await this.getSalary(this.selectedWorker, true);
        return;
      }

      // Calculate visible index for current page
      const localIndex = globalIndex % this.pageSize;

      // Activate accordion for this worker
      this.active = localIndex;

      this.selectedWorker = globalIndex;

      // Load salaries for this worker
      await this.getSalary(localIndex, true);

      setTimeout(() => {
        const inputDateString =
          this.formatProductionDateForExpansion(productionDate);

        // Try to find salary by date
        let salaryForDate = this.salaries.find(
          (s) => s.productionDate === inputDateString
        );
        if (!salaryForDate) {
          salaryForDate = this.salaries.find((s) => {
            const sDate = new Date(s.productionDate);
            const pDate = new Date(productionDate);
            return sDate.toDateString() === pDate.toDateString();
          });
        }
        if (!salaryForDate && this.salaries?.length > 0) {
          salaryForDate = this.salaries[0];
        }

        if (!salaryForDate) {
          console.warn('No salary record found to expand');
          return;
        }

        const expansionKey = salaryForDate.productionDate;
        this.expandedRows[expansionKey] = true;

        if (salaryForDate.salaryLines?.length) {
          const worker = this.serviceWorkers[globalIndex];
          this.getSalaryLinesv2(
            salaryForDate,
            salaryForDate.salaryLines,
            false,
            worker,
            salaryForDate.productionDate,
            salaryLineId,
            scrollToView
          );
        } else {
          console.warn('No salary lines found for the expanded date');
        }
      }, 500);
    } catch (error) {
      console.error('Error handling new salary line addition:', error);
    }
  }

  /**
   * Simple method to expand accordion and p-table based on stored service worker ID and production date
   */
  expandBasedOnStoredIds = async (): Promise<void> => {
    const expandInfo = this.expandAfterAction;
    if (!expandInfo?.serviceWorkerId) return;

    try {
      // Ensure correct page is displayed first
      const targetPage = this.getPageForWorkerId(expandInfo.serviceWorkerId);
      this.first = targetPage * this.pageSize;
      this.updatePagedServiceWorkers();

      // Wait for DOM to update
      await new Promise((r) => setTimeout(r, 200));

      // Find the worker index in full list
      const globalIndex = this.serviceWorkers.findIndex(
        (w) => w.id === expandInfo.serviceWorkerId
      );
      if (globalIndex < 0) return;

      const localIndex = globalIndex % this.pageSize;

      // Expand the accordion for this worker
      this.active = localIndex;

      this.selectedWorker = globalIndex;

      await this.getSalary(localIndex, true);

      if (!this.salaries.length) {
        this.active = -1;
        this.selectedWorker = null;
        return;
      }

      if (expandInfo.productionDate && this.salaries.length > 0) {
        const salary = this.salaries.find(
          (s) => s.productionDate === expandInfo.productionDate
        );
        if (!salary) return;

        // Reset expanded rows and update timeline data
        this.expandedRows = {};
        this.expandedRows[salary.productionDate] = true;

        this.salaryLine = salary.salaryLines.filter((x) => x.isManual);
        this.checkedSalaryLines = [];

        const filteredTimelineSalaryLines = salary.salaryLines.filter(
          (x) =>
            isValidDateTimeString(x.startTime) &&
            isValidDateTimeString(x.endTime)
        );

        this.activityTimelineJobEvents = salary.jobEvents;
        this.activityTimelineEvents = [
          ...this.maptimeLineIcons(),
          ...this.mapSalaryLinesToTimelineSalaryEvents(
            filteredTimelineSalaryLines.filter((x) => x.isManual)
          ),
          ...this.mapEventsToTimelineJobEvents(salary.jobSwipeInterval),
        ];

        this.activityTimelineEcgEvents = salary.salaryLinesEcgGraph || [];
        this.calendarOptions.events = [];

        if (this.activityTimelineEvents.length > 0) {
          const firstEventDate =
            this.activityTimelineEvents[0].start.split('T')[0];
          this.calendarOptions.events = this.activityTimelineEvents;
          this.calendarOptions.dateClick = (arg: any) =>
            this.onCalendarAddSalaryLine(
              arg,
              this.serviceWorkers[globalIndex].id,
              salary.productionDate
            );
          this.calendarOptions.initialDate = firstEventDate;
        }

        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Error expanding based on stored IDs:', error);
    } finally {
      this.expandAfterAction.serviceWorkerId = null;
      this.expandAfterAction.productionDate = null;
    }
  };

  /**
   * Formats the production date for table expansion key
   */
  private formatProductionDateForExpansion(date: Date): string {
    if (!date) return '';

    // Convert Date object to YYYY-MM-DD format to match the dataKey format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  /**
   * Clears all preserved states (used when filter changes)
   */
  private clearPreservedStates(): void {
    this.preservedAccordionState = -1;
    this.preservedExpandedRows = {};
    this.shouldPreserveState = false;
  }

  /**
   * Scrolls to a specific salary line element in the view
   * @param salaryLineId The ID of the salary line to scroll to
   */
  private scrollToSalaryLine(salaryLineId: string): void {
    try {
      const salaryLineIndex = this.salaryLine.findIndex(
        (line) => line.id === salaryLineId
      );

      if (salaryLineIndex !== -1) {
        setTimeout(() => {
          const element = document.getElementById(salaryLineId);

          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 200);
      }
    } catch (error) {
      console.error('Error scrolling to service worker:', error);
    }
  }

  // For checkboxes of multiple workers
  canShowCheckboxesForMultipleWorkers(): boolean {
    return (
      this.canPerformSalaryAction(
        Permissions.SALARY_CAPTURE_ADD_SALARYLINE_BUTTON
      ) ||
      this.canPerformSalaryAction(Permissions.SALARY_CAPTURE_REJECT_BUTTON) ||
      this.canPerformSalaryAction(Permissions.SALARY_CAPTURE_APPROVE_BUTTON)
    );
  }

  // For checkboxes of salary group
  canShowCheckboxesForSalaryGroup(): boolean {
    return (
      this.canPerformSalaryAction(Permissions.SALARY_CAPTURE_REJECT_BUTTON) ||
      this.canPerformSalaryAction(Permissions.SALARY_CAPTURE_APPROVE_BUTTON) ||
      this.canPerformSalaryAction(Permissions.SALARY_CAPTURE_RESET_BUTTON) ||
      this.canPerformSalaryAction(
        Permissions.SALARY_CAPTURE_REMOVEENTRY_SALARY_BUTTON
      )
    );
  }

  // For checkboxes of single salary line
  canShowCheckboxesForSalaryLine(): boolean {
    return (
      this.canPerformSalaryAction(Permissions.SALARY_CAPTURE_REJECT_BUTTON) ||
      this.canPerformSalaryAction(Permissions.SALARY_CAPTURE_APPROVE_BUTTON) ||
      this.canPerformSalaryAction(Permissions.SALARY_CAPTURE_RESET_BUTTON) ||
      this.canPerformSalaryAction(
        Permissions.SALARY_CAPTURE_REMOVEENTRY_SALARY_BUTTON
      ) ||
      this.canPerformSalaryAction(Permissions.SALARY_CAPTURE_EDIT_BUTTON)
    );
  }

  // For Multiple Workers Approve/Reject buttons
  private hasSelectedMultipleWorkers(): boolean {
    return (
      this.serviceWorkers.length > 0 &&
      (this.selectedState.workers.size > 0 ||
        this.selectedState.salaryLines.size > 0)
    );
  }

  canApproveMultipleWorkers(): boolean {
    return (
      this.canPerformSalaryAction(Permissions.SALARY_CAPTURE_APPROVE_BUTTON) &&
      this.hasSelectedMultipleWorkers()
    );
  }

  canRejectMultipleWorkers(): boolean {
    return (
      this.canPerformSalaryAction(Permissions.SALARY_CAPTURE_REJECT_BUTTON) &&
      this.hasSelectedMultipleWorkers()
    );
  }

  // For Single Worker Approve/Reject buttons
  canApproveSingleWorker(): boolean {
    return (
      this.canPerformSalaryAction(Permissions.SALARY_CAPTURE_APPROVE_BUTTON) &&
      this.isWorkerActionAllowed
    );
  }

  canRejectSingleWorker(): boolean {
    return (
      this.canPerformSalaryAction(Permissions.SALARY_CAPTURE_REJECT_BUTTON) &&
      this.isWorkerActionAllowed
    );
  }

  // For Salary Group Approve/Reject buttons
  private hasValidSalaryGroup(salary: any): boolean {
    return (
      salary.statusId === SalaryStatus.Pending &&
      salary.salaryLines?.length > 0 &&
      this.hasManualSalary(salary.salaryLines)
    );
  }

  canApproveSalaryGroup(salary: any): boolean {
    return (
      this.canPerformSalaryAction(Permissions.SALARY_CAPTURE_APPROVE_BUTTON) &&
      this.hasValidSalaryGroup(salary)
    );
  }

  canRejectSalaryGroup(salary: any): boolean {
    return (
      this.canPerformSalaryAction(Permissions.SALARY_CAPTURE_REJECT_BUTTON) &&
      this.hasValidSalaryGroup(salary)
    );
  }

  canRemoveSalaryGroup(salary: any): boolean {
    return (
      this.canPerformSalaryAction(
        Permissions.SALARY_CAPTURE_REMOVEENTRY_SALARY_BUTTON
      ) && this.hasValidSalaryGroup(salary)
    );
  }

  // For Salary Line Approve/Reject buttons
  private isValidSalaryLine(salaryLine: GetSalaryLineDto): boolean {
    return (
      salaryLine.statusId === SalaryStatus.Pending &&
      salaryLine.isManual === true
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
  minusOneSecond(dateTime: string): string {
    // Parse manually
    const [datePart, timePart] = dateTime.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute, second] = timePart.split(':').map(Number);

    // Use UTC Date so no local shift
    const d = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    d.setUTCSeconds(d.getUTCSeconds() - 1);

    // Rebuild in same format
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(
      d.getUTCDate()
    )}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(
      d.getUTCSeconds()
    )}`;
  }
  activityLineSvg(info: any) {
    if (info.event.extendedProps.timelineType !== 'activity') return;

    if (!document.querySelector('.activity-line-svg')) {
      // It takes all the activityFrequencies arrays from every event inside activityTimelineEvents
      // and flattens them into one big array.
      const combinedActivityFrequencies =
        this.activityTimelineEcgEvents.flatMap(
          (e: any) => e.activityFrequencies
        );

      // These define the full time window the SVG should cover.
      const firstFreqStart = combinedActivityFrequencies[0].start;
      const lastFreqEnd = this.minusOneSecond(
        combinedActivityFrequencies[combinedActivityFrequencies.length - 1].end
      );

      const firstFreqDate = new Date(firstFreqStart);

      // This calculates how many pixels from the left the SVG should be positioned to align with the timeline.
      const leftOffset =
        firstFreqDate.getHours() * this.pixelsPerHour +
        (firstFreqDate.getMinutes() / 60) * this.pixelsPerHour;

      const durationMs =
        new Date(lastFreqEnd).getTime() - firstFreqDate.getTime();

      // 1000*60*60 (ms → hours)
      const activityTotalWidth =
        (durationMs / (1000 * 60 * 60)) * this.pixelsPerHour;

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', activityTotalWidth.toString());
      svg.setAttribute('height', '50');
      svg.style.position = 'absolute';
      svg.style.top = '8px';
      svg.style.left = `${leftOffset}px`;
      svg.classList.add('activity-line-svg', 'z-index-5');

      // --- Gradient definition ---
      const defs = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'defs'
      );
      const gradient = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'linearGradient'
      );

      // Direction of the gradient from left to right
      gradient.setAttribute('id', 'waveGradient');
      gradient.setAttribute('x1', '0%');
      gradient.setAttribute('y1', '0%');
      gradient.setAttribute('x2', '100%');
      gradient.setAttribute('y2', '0%');

      // Build gradient stops per event
      this.activityTimelineEcgEvents.forEach((event: any) => {
        const eventStart = new Date(event.start).getTime();
        const eventEnd = new Date(event.end).getTime();

        const startPercent =
          ((eventStart - new Date(firstFreqStart).getTime()) / durationMs) *
          100;
        const endPercent =
          ((eventEnd - new Date(firstFreqStart).getTime()) / durationMs) * 100;

        let color = '#4285f4';
        if (event.type === 'terminal') color = '#9a811d';
        if (event.type === 'active') color = '#1f845a';

        // Add two stops (start + end) with same color so segment is flat
        const stop1 = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'stop'
        );
        stop1.setAttribute('offset', `${startPercent}%`);
        stop1.setAttribute('stop-color', color);

        const stop2 = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'stop'
        );
        stop2.setAttribute('offset', `${endPercent}%`);
        stop2.setAttribute('stop-color', color);

        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
      });

      defs.appendChild(gradient);
      svg.appendChild(defs);

      // Path that draw your /\/\ wave across the whole width.
      const path = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path'
      );
      path.setAttribute(
        'd',
        this.buildSmoothLineChart(
          combinedActivityFrequencies,
          firstFreqStart,
          lastFreqEnd,
          activityTotalWidth,
          50
        )
      );

      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'url(#waveGradient)');
      path.setAttribute('stroke-width', '1');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');

      svg.appendChild(path);

      const laneFrame = info.el.closest('.fc-timeline-lane-frame');
      laneFrame?.appendChild(svg);
    }
  }

  buildSmoothLineChart(
    frequencies: { start: string; end: string; value: number }[],
    eventStart: string,
    eventEnd: string,
    width: number,
    height: number
  ): string {
    if (!frequencies?.length) return '';
    const firstFreqStartTime = new Date(eventStart).getTime();
    const lastFreqEndTime = new Date(eventEnd).getTime();
    const totalMs = lastFreqEndTime - firstFreqStartTime;
    const topPad = 2;
    const bottomPad = 2;
    const availableHeight = height - topPad - bottomPad;

    let d = '';
    frequencies.forEach((freq, i) => {
      const freqStart = new Date(freq.start).getTime();
      const freqEnd = new Date(freq.end).getTime();
      const xStart = ((freqStart - firstFreqStartTime) / totalMs) * width;
      const xEnd = ((freqEnd - firstFreqStartTime) / totalMs) * width;
      const currentY = height - bottomPad - freq.value * availableHeight;
      if (i === 0) d += `M ${xStart} ${currentY}`;
      d += ` L ${xEnd} ${currentY}`;
    });
    return d;
  }

  activityTimelineIcons(info: any) {
    if (info.event.extendedProps.timelineType !== 'activity') return;

    const laneFrame = info.el.closest('.fc-timeline-lane-frame');
    // Remove previously added icons to avoid duplicates on re-render
    laneFrame
      .querySelectorAll('.activity-icon')
      .forEach((el: any) => el.remove());

    // Flatten all activityFrequencies from all events
    // const allFrequencies = this.activityTimelineEventsDummy.flatMap(
    //   (e:any) => e.activityFrequencies
    // );

    this.activityTimelineJobEvents.forEach((event: any) => {
      // Paused
      const isPaused = event.eventId == 2;
      // Resumed

      const isResumed = event.eventId == 3;

      // Switched
      const isSwitched = event.eventId == 4;

      if (!isPaused && !isResumed && !isSwitched) return;

      const date = new Date(event.eventTime);
      const leftOffset =
        date.getHours() * this.pixelsPerHour +
        (date.getMinutes() / 60) * this.pixelsPerHour;

      // create icon element
      const icon = document.createElement('span');
      icon.classList.add(
        'activity-icon',
        'position-absolute',
        'z-index-4',
        'top-1',
        'cursor-pointer',
        'fa'
      );

      if (isPaused) {
        icon.classList.add('fa-pause-circle', 'fs-16');
        // icon.textContent = 'fa-pause-circle';
        icon.style.color = '#d97706'; // orange
        icon.title = `Paused • ${date.toLocaleTimeString()}`;
      } else if (isResumed) {
        icon.classList.add('fa-play-circle', 'fs-16');
        // icon.textContent = 'fa-play-circle';
        icon.style.color = '#15803d'; // green
        icon.title = `Resumed • ${date.toLocaleTimeString()}`;
      } else if (isSwitched) {
        icon.classList.add(
          'fs-8',
          'width-px-16',
          'height-px-16',
          'bg-primary',
          'rounded-circle',
          'text-white',
          'd-flex',
          'justify-content-center',
          'align-items-center',
          'fa-arrow-right-arrow-left'
        ); // job switch
        // icon.textContent = 'change_circle';
        // icon.style.color = '#3d70b2'; // blue
        icon.title = `Job Switched • ${date.toLocaleTimeString()}`;
      }

      icon.style.left = `${leftOffset - 9}px`;
      icon.style.top = '0';

      laneFrame.appendChild(icon);
    });

    // this.eventStartEndIcon(laneFrame);
  }

  eventStartEndIcon(info: any) {
    if (info.event.extendedProps.timelineType !== 'job') return;
    const laneFrame = info.el.closest('.fc-timeline-lane-frame');
    laneFrame
      .querySelectorAll('.activity-icon')
      .forEach((el: any) => el.remove());
    this.activityTimelineJobEvents.forEach((event: any) => {
      const eventStart = event.eventId == 1;
      const eventEnd = event.eventId == 5;

      if (eventStart) {
        const startDate = new Date(event.eventTime);
        const leftOffsetStart =
          startDate.getHours() * this.pixelsPerHour +
          (startDate.getMinutes() / 60) * this.pixelsPerHour;

        const startIcon = document.createElement('span');
        startIcon.classList.add(
          'activity-icon',
          'position-absolute',
          'z-index-4',
          'fs-16',
          'cursor-pointer',
          'fa'
        );
        startIcon.style.color = '#15803d'; // blue
        // startIcon.textContent = 'fa-clock';
        startIcon.classList.add('fa-clock');
        startIcon.style.left = `${leftOffsetStart - 9}px`;
        startIcon.style.top = '0';
        startIcon.title = `Activity Start • ${startDate.toLocaleTimeString()}`;
        laneFrame.appendChild(startIcon);
      }

      if (eventEnd) {
        const endDate = new Date(event.eventTime);
        const leftOffsetEnd =
          endDate.getHours() * this.pixelsPerHour +
          (endDate.getMinutes() / 60) * this.pixelsPerHour;

        const endIcon = document.createElement('span');
        endIcon.classList.add(
          'activity-icon',
          'position-absolute',
          'z-index-4',
          'fs-16',
          'cursor-pointer',
          'fs-16',
          'cursor-pointer',
          'fa'
        );
        endIcon.style.color = '#CF282A'; // red
        // endIcon.textContent = 'schedule';
        endIcon.classList.add('fa-clock');
        endIcon.style.left = `${leftOffsetEnd - 9}px`;
        endIcon.style.top = '0';
        endIcon.title = `Activity End • ${endDate.toLocaleTimeString()}`;
        laneFrame.appendChild(endIcon);
      }
    });
  }

  canAddSalaryLine(): boolean {
    return this.canPerformSalaryAction(
      Permissions.SALARY_CAPTURE_ADD_SALARYLINE_BUTTON
    );
  }
  private canRemoveSalaryLines(salaryLine: any): boolean {
    if (
      (salaryLine.statusId === SalaryStatus.Approved ||
        salaryLine.statusId === SalaryStatus.Rejected) &&
      !this.accessService.hasPermission(
        Permissions.SALARYCAPTURE_AFTERAPPROVE_REMOVE_SALARY_LINE
      )
    ) {
      return false;
    }
    return this.canRemoveSalaryLine();
  }

  canRemoveSalaryLine(): boolean {
    return this.canPerformSalaryAction(
      Permissions.SALARY_CAPTURE_REMOVEENTRY_SALARY_BUTTON
    );
  }

  canEditSalaryLine(statusId: any): boolean {
    if (
      (statusId === SalaryStatus.Approved ||
        statusId === SalaryStatus.Rejected) &&
      !this.accessService.hasPermission(
        Permissions.SALARY_CAPTURE_AFTERAPPROVE_EDIT_SALARY_LINE
      )
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
    // 1. Common filters
    if (!this.isFilterApplied || !this.hasAccess || !this.hasDeadline)
      return false;

    // 2. Backdate restriction
    if (
      this.selectedDurationId === DEADLINE_DURATION.Last_Salary_Period &&
      !this.accessService.hasPermission(
        Permissions.SALARY_CAPTURE_BACKDATE_SALARY_APPROVAL
      )
    ) {
      return false;
    }

    // 3. Permission check for specific action
    return this.accessService.hasPermission(requiredPermission);
  }

  isEventAtMinWidth(arg: any): boolean {
    const start = new Date(arg.event.start);
    const end = new Date(arg.event.end);
    const durationInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return durationInMinutes <= this.eventMinWidth;
  }

  getTimelineIconColor(typeId: number): string {
    switch (typeId) {
      case 1:
        return '#15803d';
      case 5:
        return '#CF282A';
      default:
        return '';
    }
  }

  getIconClass(typeId: number): string {
    switch (typeId) {
      case 1:
        return 'fa fa-clock fs-15';
      case 5:
        return 'fa fa-clock fs-15';
      default:
        return '';
    }
  }

  getIconTitle(time: any, typeId: number) {
    switch (typeId) {
      case 1:
        return `Activity Start • ${time.toLocaleTimeString()}`;
      case 5:
        return `Activity End • ${time.toLocaleTimeString()}`;
      default:
        return '';
    }
  }
  filterRegionalWorkers(event: AutoCompleteCompleteEvent): void {
    const query = event.query?.toLowerCase() ?? '';

    this.filteredGroups = this.allRegionalWorkersForAutocomplete
      .map((area) => {
        const filteredWorkers = area.items.filter(
          (item) =>
            includesIgnoreCase(item.firstName, query) ||
            includesIgnoreCase(item.lastName, query) ||
            includesIgnoreCase(item.userName, query)
        );

        return filteredWorkers.length > 0
          ? { ...area, items: filteredWorkers }
          : null;
      })
      .filter((area): area is RegionalWorkerResponse => area !== null);
  }

  private mapToServiceWorkersByFilter(
    workers: GetServiceWorkerAgainstSalariesResponse[] | undefined
  ): ServiceWorkersByFilterResponse[] {
    if (!workers || workers.length === 0) {
      return [];
    }

    return workers.map((w) => ({
      id: w.id,
      firstName: w.firstName,
      lastName: w.lastName ?? null,
      userName: w.userName,
      profilePicture: null,
      displayName: w.firstName,
    }));
  }

  private getAddPopupWorkers(
    workers: GetServiceWorkerAgainstSalariesResponse[],
    regionalScope: boolean
  ): ServiceWorkersByFilterResponse[] {
    if (regionalScope) {
      return this.areaWorkersWithRegion;
    } else {
      return this.areaWorkersWithoutRegion;
    }
  }

  isSalaryLineReadOnly(salaryLine: GetSalaryLineDto): boolean {
    return salaryLine.isReadOnly === true;
  }

  /**
   * Calculates which page a given worker belongs to
   */
  private getPageForWorkerId(workerId: string): number {
    const index = this.serviceWorkers.findIndex((w) => w.id === workerId);
    return index === -1 ? 0 : Math.floor(index / this.pageSize);
  }

  /**
   * Gets actual index within full array (not just current page)
   */
  private getGlobalWorkerIndex(localIndex: number | null): number {
    return this.first + (localIndex ?? 0);
  }

  formatDateToDDMMYYYY(
    date: Date | null | undefined
  ): string | undefined | null {
    if (!isValidDateTimeString(date)) return null;
    return formatDateToDDMMYYYY(date);
  }

  getHHMMFromTime(date: string | null | undefined): string | null | undefined {
    if (!isValidDateTimeString(date)) return null;
    return getHHMMFromISOString(date);
  }

  focusAddGlobalSalaryLineButton(): void {
    if (
      this.addSalaryLineGlobalBtn &&
      this.addSalaryLineGlobalBtn.nativeElement
    ) {
      this.addSalaryLineGlobalBtn.nativeElement.focus();
    }
  }

  focusGlobalApproveButton(): void {
    if (this.approveGlobalBtn && this.approveGlobalBtn.nativeElement) {
      this.approveGlobalBtn.nativeElement.focus();
    }
  }

  focusGlobalRejectButton(): void {
    if (this.rejectGlobalBtn && this.rejectGlobalBtn.nativeElement) {
      this.rejectGlobalBtn.nativeElement.focus();
    }
  }

  get currentWorker() {
    if (!this.serviceWorkers?.length || this.selectedWorker == null)
      return null;
    return this.serviceWorkers[this.selectedWorker];
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
}
