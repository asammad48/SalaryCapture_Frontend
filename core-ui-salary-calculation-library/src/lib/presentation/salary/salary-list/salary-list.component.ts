import { SalaryLineGroupedStatuses } from './../../../core/domain/enums/salary-line-grouped-by-status';
import { SalaryCaptureFilterRequest } from './../../../core/domain/models/SalaryLine/salary-capture-filter-request.model';
import {
  Permissions,
  PermissionsType,
} from '../../../core/domain/constants/claims.constants';
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
import { SalaryCalculationPortalBase } from '../../base/salary-calculation-base/salary-calculation.base';
// import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Menu, MenuModule } from 'primeng/menu';
import { CheckboxModule } from 'primeng/checkbox';
import { AccordionModule } from 'primeng/accordion';
import { DropdownModule } from 'primeng/dropdown';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
} from 'primeng/autocomplete';
import {
  FullCalendarComponent,
  FullCalendarModule,
} from '@fullcalendar/angular';
import { PerformServiceWorkerSalariesAndSalaryLinesRequest } from '../../../core/domain/models/ServiceWorker/ServiceWorker.model';
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
} from '../../../core/domain/models/Salary/salary.model';
import {
  EditSalaryLineRequest,
  PerformSingleSalaryLineRequest,
  SalaryLine,
} from '../../../core/domain/models/Salary/salaryline.model';
import { SalaryListFiltersComponent } from './salary-list-filters/salary-list-filters.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Area } from '../../../core/domain/models/area.model';
import { ReactiveFormsModule } from '@angular/forms';
import { SalaryLineTypeEnums } from '../../../data/repositories/salary-line/salary-line-type-enums';
import { FormsModule } from '@angular/forms';
import { DEADLINE_DURATION, MenuActionKey } from '../../../core/domain/constants/application-constants';
import { AmountFormatPipe } from '../../base/utils/pipes/amount-format.pipe';
import { AccessService } from '../../../data/repositories/access/access.service';
import { Deadline, DeadlineRequest } from '../../../core/domain/models';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { SalaryService } from '../../../data/repositories/salary/salary-web-repository.ts/salary.service';
import { OrganizationUnitsDeadLineRepository } from '../../../core/repositories';
import { ServiceWorkerService } from '../../../data/repositories/service-worker/service-worker-web.repository/serviceworker.service';
import { AccessRepository } from '../../../core/repositories/access.repository';
import { SalaryLineService } from '../../../data/repositories/salary-line/salary-line.service';
import {
  formatDateForBackend,
  formatDateToDDMMYYYY,
  formatDateWithTime,
  includesIgnoreCase,
  toIsoDateOnly,
} from '../../../data/shared/helper.function';
import { SalaryCode } from '../../../core/domain/models/SalaryLine/salary-code.model';
import { HttpErrorResponse } from '@angular/common/module.d-CnjH8Dlt';
import { ProgressLoadingComponent } from '../../shared/progress-loading/progress-loading.component';
import { jobEventsSwappedDummy } from './activity-timeline';
import { ServiceWorkersByFilterResponse, RegionalWorkerResponse } from '../../../core/domain/models/ServiceWorker/service-worker-by-filter-response.model';
import { GetServiceWorkerAgainstSalariesResponse } from '../../../core/domain/models/ServiceWorker/service-worker-against-salaries-response.model';
import { FilterService, MenuItem } from 'primeng/api';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SalaryCaptureHeaderComponent } from './salary-capture-header/salary-capture-header.component';
import { WorkerAccordionViewComponent } from './worker-accordion-view/worker-accordion-view.component';
import { WorkerSalaryViewComponent } from './worker-salary-view/worker-salary-view.component';
import { SalaryCaptureViewType } from '../../../core/domain/enums/salary-capture-view-type.enum';
import { ConflictedSalaryLineData } from 'core-ui-salary-calculation-library/src/lib/core/domain/models/Salary/conflicted-salary-line-data';

@Component({
  selector: 'lib-salary-list',
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
    SalaryListFiltersComponent,
    ReactiveFormsModule,
    TooltipModule,
    SkeletonModule,
    PaginatorModule,
    SalaryCaptureHeaderComponent,
    WorkerAccordionViewComponent,
    WorkerSalaryViewComponent
  ],
  providers: [DatePipe, AmountFormatPipe],
  templateUrl: './salary-list.component.html',
})

export class SalaryListComponent extends SalaryCalculationPortalBase implements OnInit {

  @ViewChild(WorkerAccordionViewComponent, { static: false }) workerAccordionViewComponent!: WorkerAccordionViewComponent;
  @ViewChild(WorkerSalaryViewComponent, { static: false }) workerSalaryViewComponent!: WorkerSalaryViewComponent;
  @ViewChild(SalaryListFiltersComponent, { static: false }) salaryListFiltersComponent!: SalaryListFiltersComponent;

  @ViewChild('addSalaryLineGlobalBtn') addSalaryLineGlobalBtn: any;
  @ViewChild('rejectGlobalBtn') rejectGlobalBtn: any;
  @ViewChild('approveGlobalBtn') approveGlobalBtn: any;

  conflictedSalaryLineData: ConflictedSalaryLineData | undefined = undefined;

  Permissions = Permissions;
  SalaryCaptureViewType = SalaryCaptureViewType;
  private destroy$ = new Subject<void>();

  active = this.workerAccordionViewComponent?.active;

  currentView: SalaryCaptureViewType = SalaryCaptureViewType.WORKER_ACCORDION;

  items: MenuItem[] = [];
  home: MenuItem | undefined;

  filterPanelCollapsed = false;

  noAccessRoles = ['No_Access', 'Read_Access'];

  allRegionalWorkersForAutocomplete: RegionalWorkerResponse[] = [];
  allServiceWorkersForAutocomplete: ServiceWorkersByFilterResponse[] = [];

  areaWorkersWithRegion: ServiceWorkersByFilterResponse[] = [];
  areaWorkersWithoutRegion: ServiceWorkersByFilterResponse[] = [];

  filterData: any;
  showHeader = false;
  isFilterApplied = false;
  deadlineRequest!: DeadlineRequest;

  filteredGroups: RegionalWorkerResponse[] = [];

  deadline: Deadline | undefined;
  startDate = '';
  endDate = '';

  fullDate: string | undefined;
  deadLineText = '';

  showDeadLine = true;
  hideDeadLineIcon = false;

  selectedDuration = '';
  selectedDurationId: number | null = null;

  isScrolling = false;

  organizationUnitId = '';
  selectedSalaryCode = '';
  salaryCodes: SalaryCode[] = [];

  isCurrentDeadlinePeriod = false;
  isLoadingDeadlinePeriod = false;
  isLoadingFilterServiceWorkers = false;

  selectedSalaryCodeForDialog: SalaryCode | undefined = undefined;

  selectedStartDateForDialog: string | undefined = undefined;
  selectedEndDateForDialog: string | undefined = undefined;

  globalSearchTerm: string | undefined = '';

  salaryCaptureFilterRequest!: SalaryCaptureFilterRequest;

  // Common Methods
  totalRecords = 0;
  isLoading = false;

  // Worker Accordin
  currentlyOpenedWorkerIndex: number | null = -1;

  constructor(
    inject: Injector,
    private OrganizationUnitDeadlineRepo: OrganizationUnitsDeadLineRepository,
    private serviceWorkerService: ServiceWorkerService,
    private accessRepository: AccessRepository,
    private cdr: ChangeDetectorRef
  ) {
    super(inject);
    this.deadlineRequest = {
      organizationUnitId: '',
      durationId: 0,
    };
  }

  setCurrentlyOpenedWorker(workerIndex: number | null) {
    this.currentlyOpenedWorkerIndex = workerIndex;
  }

  ngOnInit() {
    this.items = [{ label: 'Salary Capture' }];

    this.home = {
      label: 'Salary Calculation Portal',
      routerLink: '/salary-capture',
    };

    this.checkUserAreaRole();
  }

  // ngAfterViewInit() {
  //   // Ensure components are properly initialized
  //   if (this.filterData && this.workerSalaryViewComponent && this.isWorkerSalaryView) {
  //     this.workerSalaryViewComponent.getFiltersData(this.filterData);
  //   }
  // }

  onPageChange(event: PaginatorState) {
    this.workerAccordionViewComponent?.onPageChange(event);
  }

  scrollToElementById(elementId: string) {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  onSubAreaChange(organizationUnitId: string) {
    this.organizationUnitId = organizationUnitId || '';
  }

  onSalaryCodeChange(selectedSalaryCode: any) {
    this.selectedSalaryCodeForDialog = selectedSalaryCode[0];
  }

  checkUserAreaRole() {
    this.checkUserAreaAccess();
  }

  checkUserAreaRolAccess(salary: any): boolean {
    const areaName = this.getSubSalaryAreaName(salary);
    const area = this.userAreasRoles!.filter((x) => x.areaName == areaName);
    if (area.length > 0) {
      return !this.noAccessRoles.includes(area[0].areaRoleName);
    }
    return false;
  }

  onSalaryCodesChange(salaryCodes: SalaryCode[]): void {
    this.salaryCodes = salaryCodes;
  }

  async getOrganizationUnitDeadlines(
    areaId: string,
    durationId: number
  ): Promise<void> {
    this.deadlineRequest.organizationUnitId = areaId;
    this.deadlineRequest.durationId = durationId;

    try {
      const response = await lastValueFrom(
        this.OrganizationUnitDeadlineRepo.getOrganizationUnitsDeadlines(
          this.deadlineRequest
        ).pipe(
          takeUntil(this.destroyer$),
          catchError((err) => {
            this.handleError(err);
            return EMPTY;
          })
        )
      );

      this.processDeadlineResponse(response);
    } catch (e) {
      this.showErrors(e);
    } finally {
      this.isLoadingDeadlinePeriod = false;
    }
  }

  private processDeadlineResponse(data: any): void {
    this.isCurrentDeadlinePeriod = data?.isCurrent || false;
    (this.selectedStartDateForDialog = data?.startDate),
      (this.selectedEndDateForDialog = data?.endDate),
      (this.deadline = data?.remainingTime);
    this.startDate = data?.startDate ? this.convertDate(data?.startDate) : '';
    this.endDate = data?.endDate ? this.convertDate(data?.endDate) : '';
    this.organizationUnitId = data?.organizationUnitId || '';
    this.fullDate =
      data == null
        ? 'No deadline uploaded!'
        : `${formatDateToDDMMYYYY(
            new Date(this.startDate)
          )} - ${formatDateToDDMMYYYY(new Date(this.endDate))}`;

    this.deadLineText =
      (this.deadline?.days || 0) > 1
        ? `${this.deadline?.days || 0} days`
        : `${this.deadline?.days || 0} days : ${
            this.deadline?.hours || 0
          } hours : ${this.deadline?.minutes || 0} mins`;
  }

  getAllRegionalWorkersForAutocomplete() {
    this.isLoadingFilterServiceWorkers = true;
    this.serviceWorkerService
      .getRegionalWorkers(this.salaryCaptureFilterRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {

          this.allRegionalWorkersForAutocomplete = response?.data || [];

          this.allServiceWorkersForAutocomplete = this.allRegionalWorkersForAutocomplete.flatMap(area => area.items || []);

          this.isLoadingFilterServiceWorkers = false;
        },

        error: (error: HttpErrorResponse) => {
          this.allRegionalWorkersForAutocomplete = [];
          this.allServiceWorkersForAutocomplete = [];
          this.isLoadingFilterServiceWorkers = false;
          console.error('Error fetching regional workers for search:', error);
        },
      });
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

  getSubSalaryAreaName(area: any) {
    return area.organizationUnit.displayName;
  }

  filterPanelToggler(event: any) {
    this.filterPanelCollapsed = event;
  }

  onAddSalaryLineButtonRefReceived(buttonRef: any): void {
    this.addSalaryLineGlobalBtn = buttonRef;
  }

  onRejectGlobalButtonRefReceived(buttonRef: any): void {
    this.rejectGlobalBtn = buttonRef;
  }

  onApproveGlobalButtonRefReceived(buttonRef: any): void {
    this.approveGlobalBtn = buttonRef;
  }

  addSalaryLineGlobal($event: any) {

    if(this.isWorkerAccordionView) {
      this.workerAccordionViewComponent?.addSalaryLineGlobal($event);

    } else if(this.isWorkerSalaryView) {
      this.workerSalaryViewComponent?.addSalaryLineGlobal($event);
    }
    
  }  
  
  getSalaryFilterData(data: any) {
    this.isFilterApplied = true;
    this.cdr.detectChanges();
    this.globalSearchTerm = '';
    this.isLoadingDeadlinePeriod = true;
    this.isCurrentDeadlinePeriod = data.isCurrent;
    this.showHeader = true;

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

    const areaId = area?.areaId;
    const regionId = region?.areaId;
    const durationId = duration?.id || null;
    this.filterData = data;
    this.selectedDuration = duration?.name || '';
    this.selectedDurationId = duration?.id || null;
    this.hideDeadLineIcon = durationId != 8 ? true : false;
    this.showDeadLine = durationId === 6 ? false : true;
    // this.onAreaDefaultAdded(region);

    if (data.region != null) {
      this.getCurrentUserSelectedRegionAccess(regionId);
    } else {
      this.hasAccess = true;
    }
    data.startDate = this.startDate;
    data.endDate = this.endDate;

    this.loadBothAreaWorkers(this.salaryCaptureFilterRequest);

    if(this.isWorkerAccordionView) {
      this.workerAccordionViewComponent?.getSalaryFilterData(data);

    } else if(this.isWorkerSalaryView) {
      this.workerSalaryViewComponent?.getFiltersData(data);
    }

    if ((areaId || regionId) && durationId && durationId != null) {
      if (durationId != 9) {
        this.getOrganizationUnitDeadlines(
          areaId ? areaId : regionId,
          durationId
        );
      } else {
        const customDeadlinedata = {
          startDate: toIsoDateOnly(fromDate),
          endDate: toIsoDateOnly(toDate),
          isCurrent: false,
          remainingTime: '',
          organizationUnitId: areaId,
        };
        this.processDeadlineResponse(customDeadlinedata);
        this.isLoadingDeadlinePeriod = false;
      }
    } else {
      this.isLoadingDeadlinePeriod = false;
    }

    this.globalSearchTerm = '';
    this.getAllRegionalWorkersForAutocomplete();
  }

  getDeadLineDates(data: any) {
    const { area, region, duration, salaryLines } = data;
    const areaId = area?.areaId;
    const regionId = region?.areaId;
    const durationId = duration?.id || null;
    this.hideDeadLineIcon = durationId != 8 ? true : false;
    this.showDeadLine = durationId === 6 ? false : true;
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

  onScroll(event: any) {
    const scrollPosition = event.target.scrollTop;
    if (scrollPosition > 0) {
      this.isScrolling = true;
    } else {
      this.isScrolling = false;
    }
  }

  headerConfirmationDialog(statusId: number) {

    if(this.isWorkerAccordionView) {
      this.workerAccordionViewComponent?.headerConfirmationDialog(this.currentlyOpenedWorkerIndex, statusId);

    } else {
      this.workerSalaryViewComponent?.headerConfirmationDialog(statusId);
    }

  }

  async onWorkerFilterSelected(event: any) {

    if(this.workerAccordionViewComponent) {
      this?.workerAccordionViewComponent?.onWorkerFilterSelected(event);

    } else if(this.workerSalaryViewComponent) {
      this?.workerSalaryViewComponent?.onWorkerFilterSelected(event);
    }

  }

  onWorkerFilterCleared() {
    this?.workerAccordionViewComponent?.onWorkerFilterCleared();
  }

  stopProp(e: any) {
    e.stopPropagation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get showCurrentDeadlinePeriod(): boolean {
    return this.isFilterApplied && this.isCurrentDeadlinePeriod;
  }

  get showPastDeadlinePeriod(): boolean {
    return this.isFilterApplied && !this.isCurrentDeadlinePeriod;
  }

  get hasDeadline(): boolean {
    return !!this.startDate && !!this.endDate;
  }

  isAllChecked(): boolean {

    if(this.isWorkerAccordionView) {
      return this.workerAccordionViewComponent?.isAllWorkersChecked() || false;

    } else if(this.isWorkerSalaryView) {
      return this.workerSalaryViewComponent?.areAllSalaryLinesChecked() || false;
    }

    return false;
  }

  isAllIndeterminate(): boolean {

    if(this.isWorkerAccordionView) {
      return this.workerAccordionViewComponent?.isAllWorkersIndeterminate() || false;

    } else if(this.isWorkerSalaryView) {
      return this.workerSalaryViewComponent?.areSomeSalaryLinesChecked() || false;
    }

    return false;
  }

  onSelectAllWorkersChange(checked: boolean): void {

    if(this.isWorkerAccordionView) {
      this.workerAccordionViewComponent?.onSelectAllWorkersChange(checked);

    } else {
      this.workerSalaryViewComponent?.onSelectAllSalaryLinesChange(checked);
    }

  }

  filterRegionalWorkers(event: AutoCompleteCompleteEvent): void {

    const query = event.query?.toLowerCase() ?? '';

    this.filteredGroups = this.allRegionalWorkersForAutocomplete
      .map(area => {
        const filteredWorkers = area.items.filter(item =>
          includesIgnoreCase(item.firstName, query) ||
          includesIgnoreCase(item.lastName, query) ||
          includesIgnoreCase(item.userName, query)
        );

        return filteredWorkers.length > 0 ? { ...area, items: filteredWorkers } : null;
      })
      .filter((area): area is RegionalWorkerResponse => area !== null);
  }

  loadBothAreaWorkers(filter: SalaryCaptureFilterRequest): void {

    const filterWithRegion = { ...filter, isRegionalScope: true };

    this.serviceWorkerService.getAreaWorkers(filterWithRegion)
      .pipe(takeUntil(this.destroy$))
      .subscribe({

        next: (response) => {

          if (response?.success && response?.data) {
            this.areaWorkersWithRegion = response.data;

          } else {
            this.areaWorkersWithRegion = [];
          }

        },

        error: (error) => {
          this.areaWorkersWithRegion = [];
          console.error('Error fetching area workers with region:', error);
        }

      });

      const filterWithoutRegion = { ...filter, isRegionalScope: false };
      this.serviceWorkerService.getAreaWorkers(filterWithoutRegion)
        .pipe(takeUntil(this.destroy$))
        .subscribe({

          next: (response) => {

            if (response?.success && response?.data) {
              this.areaWorkersWithoutRegion = response.data;

            } else {
              this.areaWorkersWithoutRegion = [];
            }
          },

          error: (error) => {
            this.areaWorkersWithoutRegion = [];
            console.error('Error fetching area workers without region:', error);
          }

        });
  }

  setGlobalSearchTerm(term: string): void {
    this.globalSearchTerm = term;
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

  onViewToggle(viewType: SalaryCaptureViewType, viewConflictedSalaryLine = false): void {

    this.currentView = viewType;

    this.totalRecords = 0;

    if(!viewConflictedSalaryLine) {
      this.conflictedSalaryLineData = undefined;
    }

    this.cdr.detectChanges();

    if(this.workerAccordionViewComponent) {
      this.workerAccordionViewComponent.getSalaryFilterData(this.filterData);

    } else if(this.workerSalaryViewComponent) {
      this.workerSalaryViewComponent.getFiltersData(this.filterData);
    }

  }

  get isWorkerAccordionView(): boolean {
    return this.currentView === SalaryCaptureViewType.WORKER_ACCORDION;
  }

  get isWorkerSalaryView(): boolean {
    return this.currentView === SalaryCaptureViewType.WORKER_SALARY;
  }

  setTotalRecords(count: number): void {
    this.totalRecords = count;
  }

  setLoadingState(isLoading: boolean): void {
    this.isLoading = isLoading;
  }

  private canPerformBulkAction(permission: PermissionsType): boolean {

    const hasPermission = this.accessService.hasPermission(permission);

    const hasRecords = this.totalRecords > 0;

    if (!hasPermission || !hasRecords) {
      return false;
    }

    if (this.isWorkerAccordionView) {
      return (
        this.workerAccordionViewComponent?.isAllWorkersChecked() ||
        this.workerAccordionViewComponent?.isAllWorkersIndeterminate() ||
        false
      );
    }

    if (this.isWorkerSalaryView) {
      return (
        this.workerSalaryViewComponent?.areAllSalaryLinesChecked() ||
        this.workerSalaryViewComponent?.areSomeSalaryLinesChecked() ||
        false
      );
    }

    return false;
  }

  canApproveAll(): boolean {
    return this.canPerformBulkAction(Permissions.SALARY_CAPTURE_APPROVE_BUTTON);
  }

  canRejectAll(): boolean {
    return this.canPerformBulkAction(Permissions.SALARY_CAPTURE_REJECT_BUTTON);
  }

  canShowBulkMenu(): boolean {
    
    if (this.isWorkerSalaryView) {
      return this.workerSalaryViewComponent?.canShowBulkMenu() || false;
    }

    return false;
  }

  async onSeeConflictClicked(event: { serviceWorkerId: string; productionDate: string; salaryLineId: string }): Promise<void> {
    // Switch to Worker Accordion view
    this.conflictedSalaryLineData = event;
    this.onViewToggle(SalaryCaptureViewType.WORKER_ACCORDION, true);
  }

  onBulkMenuActionClicked(action: MenuActionKey): void {
    
    if (this.isWorkerSalaryView) {
      this.workerSalaryViewComponent?.onBulkMenuActionClicked(action);
    }

  }

}
