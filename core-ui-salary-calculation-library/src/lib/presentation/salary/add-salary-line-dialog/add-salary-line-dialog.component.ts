import { SALARY_LINE_DIALOG_MODE } from './../../../core/domain/constants/salary-line-dialogue-mode';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  Renderer2,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { SalaryLineTimelineInfoComponent } from './salary-line-timeline-info/salary-line-timeline-info.component';
import { DatePickerModule } from 'primeng/datepicker';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LuxonDatePipe } from '../../base/utils/pipes';
import { AccessService } from './../../../data/repositories/access/access.service';
import { SalaryLineService } from './../../../data/repositories/salary-line/salary-line.service';
import { UsersService } from './../../../data/repositories/usersManagement/users.service';
import {
  DynamicDialogRef,
  DynamicDialogConfig,
  DialogService,
} from 'primeng/dynamicdialog';
import { SalaryLineDialogConfig } from './../../../core/domain/models/SalaryLine/salary-line-dialog-config';
import { SalaryLineDialogMode } from './../../../core/domain/constants/salary-line-dialogue-mode';
import { SalaryCaptureFilterRequest } from './../../../core/domain/models/SalaryLine/salary-capture-filter-request.model';
import { ServiceWorkerService } from './../../../data/repositories/service-worker/service-worker-web.repository/serviceworker.service';
import { Subject, takeUntil } from 'rxjs';
import { SalaryCode } from './../../../core/domain/models/SalaryLine/salary-code.model';
import { HttpErrorResponse } from '@angular/common/module.d-CnjH8Dlt';
import { AddEditSalaryLineDto } from './../../../core/domain/requests';
import {
  calculateMinutesBetweenDates,
  convertStringToDate,
  equalsIgnoreCase,
  formatDateForBackend,
  formatDateTimeForBackend,
  getHHMMFromTimeString,
  handleHttpErrorResponse,
  isValidDateTimeString,
  stripTime,
} from './../../../data/shared/helper.function';
import { SalaryLineAddressInfoComponent } from './salary-line-address-info/salary-line-address-info.component';
import { VehicleTypeOption } from './../../../core/domain/models/SalaryLine/vehicle-type.model';
import { UI_TEMPLATES } from '../../../core/domain/constants/ui-template.constants';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { WarningBannerComponent } from '../../shared/warning-banner/warning-banner.component';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { GetSalaryLineDto } from './../../../core/domain/models';
import { ProgressLoadingComponent } from '../../shared/progress-loading/progress-loading.component';
import { DataNextService } from '../../services/data-next.service';
import { ServiceWorkersByFilterResponse } from './../../../core/domain/models/ServiceWorker/service-worker-by-filter-response.model';
import { GetServiceWorkerAgainstSalariesResponse } from './../../../core/domain/models/ServiceWorker/service-worker-against-salaries-response.model';
import { SalaryLineWorkerDto } from './../../../core/domain/models/SalaryLine/salary-line-worker-dto';
import { AddSalaryLineDialogResponse } from './../../../core/domain/models/SalaryLine/add-salary-line-dialog-response';
import { AddSalaryLineResponse } from './../../../core/domain/models/responses/salary-line-add-response';
import { DEADLINE_DURATION } from 'core-ui-salary-calculation-library/src/lib/core/domain/constants/application-constants';

@Component({
  selector: 'lib-add-salary-line-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarModule,
    InputNumberModule,
    SelectModule,
    MultiSelectModule,
    DatePickerModule,
    SalaryLineTimelineInfoComponent,
    SalaryLineAddressInfoComponent,
    WarningBannerComponent,
    ProgressLoadingComponent,
  ],
  providers: [
    LuxonDatePipe,
    AccessService,
    SalaryLineService,
    UsersService,
    ServiceWorkerService,
    SalaryLineService
  ],
  templateUrl: './add-salary-line-dialog.component.html',
})
export class AddSalaryLineDialogComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  private readonly destroy$ = new Subject<void>();
  addSalaryLineForm!: FormGroup;

  apiWorkers: ServiceWorkersByFilterResponse[] = [];
  isLoadingServiceWorkers = false;

  salaryCodes: SalaryCode[] = [];
  isLoadingSalaryCodes = false;

  private readonly serviceProviderId: string =
    this.accessService.GetServiceProviderId();
  private readonly tenantId: string = this.accessService.GetTenantId();

  readonly salaryLineDialogConfig: SalaryLineDialogConfig;
  private readonly editFromTimeline: boolean = false;
  private readonly mode: SalaryLineDialogMode = SALARY_LINE_DIALOG_MODE.ADD;
  private readonly openedFromHeader: boolean = true;
  private readonly isRegionalScope: boolean = false;
  public readonly salaryLine: GetSalaryLineDto | undefined = undefined;
  private readonly selectedServiceWorkers: ServiceWorkersByFilterResponse[] = [];
  private readonly salaryCode: SalaryCode | undefined = undefined;
  private readonly organizationUnitId: string | undefined = undefined;
  private readonly salaryCaptureFilterRequest: SalaryCaptureFilterRequest | undefined = undefined;
  private readonly allServiceWorkers: ServiceWorkersByFilterResponse[] = [];

  readonly timelineStartTime: Date | undefined = undefined;
  readonly timelineEndTime: Date | undefined = undefined;

  private deadlineStartDate: Date | undefined = undefined;
  private deadlineEndDate: Date | undefined = undefined;

  private productionDate: Date | undefined = undefined;

  showConflictWarning = false;
  conflictWarningMessage = '';

  showConflictError = false;
  conflictErrorMessage = '';

  showDatePikcerOnFocus = true;
  lastKeyWasTab = false;

  private readonly DEFAULT_DESCRIPTION =
    'Awarded of employees have had to wait.';
  readonly currencyMaxValue = Number.MAX_SAFE_INTEGER;
  readonly currencyMinValue = Number.MIN_SAFE_INTEGER;

  private readonly uiTemplates = Object.values(UI_TEMPLATES);
  @ViewChild('salaryLinedatePicker') salaryLinedatePicker!: any;
  private datePickerKeyListener?: (event: KeyboardEvent) => void;

  constructor(
    private readonly translateService: TranslateService,
    private readonly messageService: MessageService,
    private readonly serviceWorkersService: ServiceWorkerService,
    private readonly salaryLineService: SalaryLineService,
    private readonly dialogService: DialogService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public accessService: AccessService,
    private fb: FormBuilder,
    private renderer: Renderer2,
    private dataNextService: DataNextService
  ) {
    this.salaryLineDialogConfig = config.data;
    this.mode = this.salaryLineDialogConfig.mode;
    this.editFromTimeline = this.salaryLineDialogConfig.editFromTimeline === true;
    this.openedFromHeader =
      this.salaryLineDialogConfig.openedFromHeader || false;
    this.isRegionalScope = this.salaryLineDialogConfig.isRegionalScope === true;
    this.salaryLine = this.salaryLineDialogConfig.salaryLine || undefined;
    this.allServiceWorkers =
      this.salaryLineDialogConfig.allServiceWorkers || [];
    this.selectedServiceWorkers =
      this.salaryLineDialogConfig.serviceWorkers || [];
    this.salaryCode = this.salaryLineDialogConfig.salaryCode || undefined;
    this.organizationUnitId =
      this.salaryLineDialogConfig.organizationUnitId || undefined;
    this.salaryCaptureFilterRequest =
      this.salaryLineDialogConfig.salaryCaptureFilterRequest || undefined;
    this.salaryCodes = this.salaryLineDialogConfig.allSalaryCodes || [];
    this.productionDate =
      stripTime(
        convertStringToDate(this.salaryLineDialogConfig.productionDate)
      ) || undefined;
    this.timelineStartTime = convertStringToDate(
      this.salaryLineDialogConfig.timelineStartTime
    );
    this.timelineEndTime = convertStringToDate(
      this.salaryLineDialogConfig.timelineEndTime
    );
    this.initializeProductionDateConstraints(
      this.salaryLineDialogConfig.deadlineStartDate,
      this.salaryLineDialogConfig.deadlineEndDate
    );
  }

  ngOnInit(): void {
    this.initializeForm();
    this.setupSalaryCodeChangeListener();
    this.initializeProductionDate();
    this.initializeServiceWorkers();
    this.initializeSalaryCodes();
    this.salaryCodeSubscriber();
    this.trackLastTabKey();
  }

  ngAfterViewInit(): void {
    
    if (this.editFromTimeline) {
      this.blurDatePicker();

    } else {
      this.focusDatePicker();
      this.focusSelectAppendTo();
    }
  }


  private initializeProductionDate(): void {
    if (this.isEditMode) return;
    this.initializeProductionDateForAdd();
  }

  private initializeProductionDateForAdd(): void {
    if (this.isEditMode) return;

    const productionDateControl = this.addSalaryLineForm.get('productionDate');

    if (this.productionDate) {
      productionDateControl?.setValue(this.productionDate);
    } else {
      this.setProductionDateToTodayIfInRange();
    }
  }

  private setProductionDateToTodayIfInRange(): void {
    if (this.isEditMode) return;

    const today = stripTime(new Date());

    if (!today) return;

    if (
      this.deadlineStartDate &&
      this.deadlineEndDate &&
      today >= this.deadlineStartDate &&
      today <= this.deadlineEndDate
    ) {
      const productionDateControl =
        this.addSalaryLineForm.get('productionDate');

      if (productionDateControl) {
        productionDateControl.setValue(today);
      }
    }
  }

  private initializeServiceWorkers(): void {
    if (this.isAddMode) {
      if (!this.openedFromHeader) {
        this.addSalaryLineForm.get('serviceWorkers')?.disable();
      }

      if (!this.allServiceWorkers || this.allServiceWorkers.length === 0) {
        this.loadServiceWorkers();
      } else {
        this.isLoadingServiceWorkers = true;
        this.apiWorkers = this.allServiceWorkers;
        this.isLoadingServiceWorkers = false;
        this.setPreSelectedWorkers();
      }
    } else {
      this.disableFieldsForEdit();
      this.setPreSelectedWorkersForEdit();
    }
  }

  private initializeSalaryCodes(): void {
    if (this.isEditMode) {
      this.setSalaryCodeForEdit();
    } else {
      this.setSalaryCodeForAdd();
    }
  }

  private loadServiceWorkers(): void {
    if (
      !this.organizationUnitId &&
      !this.salaryCaptureFilterRequest?.organizationUnitId
    ) {
      return;
    }

    this.isLoadingServiceWorkers = true;

    if (this.salaryCaptureFilterRequest) {
      this.salaryCaptureFilterRequest.isRegionalScope = this.isRegionalScope;
    }

    const request: SalaryCaptureFilterRequest = this
      .salaryCaptureFilterRequest || {
      organizationUnitId: this.organizationUnitId || '',
      durationId: DEADLINE_DURATION.Custom,
      isRegionalScope: this.isRegionalScope,
    };

    this.serviceWorkersService
      .getAreaWorkers(request)

      .pipe(takeUntil(this.destroy$))

      .subscribe({
        next: (response) => {
          this.isLoadingServiceWorkers = false;

          if (response?.success && response?.data) {
            this.apiWorkers = response.data;
            this.setPreSelectedWorkers();
          } else {
            this.apiWorkers = [];
          }
        },
        error: (error: HttpErrorResponse) => {
          this.isLoadingServiceWorkers = false;
          this.apiWorkers = [];
          console.error('Error fetching service workers:', error);
        },
      });
  }

  private setPreSelectedWorkers(): void {
    const apiWorkers = this.apiWorkers ?? [];

    if (apiWorkers.length === 0 || this.selectedServiceWorkers.length === 0) {
      return;
    }

    const selectedWorkerIds = new Set(
      this.selectedServiceWorkers.map((w) => w.id)
    );
    const matchedSelectedWorkers = apiWorkers.filter((apiWorker) =>
      selectedWorkerIds.has(apiWorker.id)
    );

    if (matchedSelectedWorkers.length > 0) {
      this.addSalaryLineForm.patchValue({
        serviceWorkers: matchedSelectedWorkers,
      });
    }
  }

  private setPreSelectedWorkersForEdit(): void {
    if (this.selectedServiceWorkers && this.selectedServiceWorkers.length > 0) {
      this.apiWorkers = this.salaryLineDialogConfig?.serviceWorkers || [];
      this.addSalaryLineForm.patchValue({
        serviceWorkers: this.selectedServiceWorkers,
      });
    }
  }

  private setSalaryCodeForAdd(): void {
    if (!this.salaryCode) return;
    this.addSalaryLineForm.patchValue({ salaryCode: this.salaryCode });
  }

  private initializeForm(): void {
    this.addSalaryLineForm = this.fb.group({
      productionDate: [null, [Validators.required]],
      serviceWorkers: [[], [Validators.required, Validators.minLength(1)]],
      jobNumber: [null],
      salaryCode: [null, [Validators.required]],
      quarter: [
        null,
        [
          Validators.required,
          Validators.max(this.currencyMaxValue),
          Validators.min(this.currencyMinValue),
        ],
      ],
      vehicleType: [null],
      startTime: [null],
      endTime: [null],
      startLocation: [null],
      endLocation: [null],
      kilometers: [null],
      totalTime: [null],
    });

    if (this.isEditMode) {
      this.populateFormForEdit();
      this.disableFieldsForEdit();
    }
  }

  private disableFieldsForEdit(): void {
    const fieldsToDisable = ['serviceWorkers'];

    fieldsToDisable.forEach((fieldName) => {
      this.addSalaryLineForm.get(fieldName)?.disable();
    });
  }

  get isEditMode(): boolean {
    return this.mode === SALARY_LINE_DIALOG_MODE.EDIT;
  }

  get isAddMode(): boolean {
    return this.mode === SALARY_LINE_DIALOG_MODE.ADD;
  }

  private populateFormForEdit(): void {
    if (!this.salaryLine) {
      console.warn('No salary line data available for edit mode');
      return;
    }

    const unitValue = this.salaryLine.salaryCodeValue || null;

    this.addSalaryLineForm.patchValue({
      productionDate: new Date(this.salaryLine.productionDate),
      jobNumber: this.salaryLine.jobNumber || '',
      quarter: unitValue,
    });
  }

  closeModal(wasSuccessful: boolean) {
    this.ref.close({ success: wasSuccessful });
  }

  resetForm() {
    this.addSalaryLineForm.reset();
    this.addSalaryLineForm.markAsPristine();
    this.addSalaryLineForm.markAsUntouched();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.addSalaryLineForm.controls).forEach((key) => {
      const control = this.addSalaryLineForm.get(key);
      if (control && !control.disabled) {
        control.markAsTouched();
      }
    });
  }

  submitSalaryLine() {
    this.markFormGroupTouched();

    if (!this.addSalaryLineForm.valid) {
      return;
    }

    if (!this.organizationUnitId) {
      console.error('Organization Unit is required.');
      return;
    }

    const salaryCode: SalaryCode | null =
      this.addSalaryLineForm.get('salaryCode')?.value;
    const selectedServiceWorkers: ServiceWorkersByFilterResponse[] =
      this.addSalaryLineForm.get('serviceWorkers')?.value || [];
    const vehicleType: VehicleTypeOption | null =
      this.addSalaryLineForm.get('vehicleType')?.value;

    if (!selectedServiceWorkers || selectedServiceWorkers.length === 0) {
      console.error('At least one Service Worker is required.');
      return;
    }

    if (!salaryCode || !salaryCode.salaryCodeId) {
      console.error('Salary Code is required but not selected.');
      return;
    }

    if (this.isTimeDistanceControl && !vehicleType) {
      console.error(
        'Vehicle Type is required when time distance control is enabled.'
      );
      return;
    }

    const productionDate = this.addSalaryLineForm.get('productionDate')?.value;
    const jobNumber = this.addSalaryLineForm.get('jobNumber')?.value;
    const salaryCodeId = salaryCode?.salaryCodeId?.toUpperCase();
    const salaryCodeValue = this.addSalaryLineForm.get('quarter')?.value;
    const salaryUITemplate = salaryCode?.uiTemplate || null;

    const startTimeValue = this.addSalaryLineForm.get('startTime')?.value;
    const endTimeValue = this.addSalaryLineForm.get('endTime')?.value;

    const startTime = formatDateTimeForBackend(productionDate, startTimeValue);
    const endTime = formatDateTimeForBackend(productionDate, endTimeValue);

    const startLocation = this.addSalaryLineForm.get('startLocation')?.value;
    const endLocation = this.addSalaryLineForm.get('endLocation')?.value;
    const totalTime = this.addSalaryLineForm.get('totalTime')?.value;
    const kilometers = this.addSalaryLineForm.get('kilometers')?.value;

    // Create single request with array of service worker IDs in comma-separated format
    const request: AddEditSalaryLineDto = {
      tenantId: this.tenantId,
      serviceProviderId: this.serviceProviderId,
      organizationUnitId: this.organizationUnitId,
      productionDate: formatDateForBackend(productionDate),
      serviceWorkerIds: selectedServiceWorkers.map((sw) => sw.id), // Send IDs as comma-separated string
      jobNumber: jobNumber,
      salaryCodeId: salaryCodeId,
      salaryCodeValue: salaryCodeValue,
      vehicleType: vehicleType,
      startTime: startTime,
      endTime: endTime,
      startLocation: startLocation,
      endLocation: endLocation,
      kilometers: kilometers,
      totalTime: totalTime != null ? `${totalTime}:00.000` : undefined,
      id: this.isEditMode ? this.salaryLine?.id : null,
      forceSaveJobEventConflict: false,
    };

    request.forceSaveJobEventConflict = this.showConflictWarning ? true : false;

    this.showConflictWarning = false;
    this.conflictWarningMessage = '';

    if (this.isEditMode) {
      this.updateSalaryLine(request, salaryUITemplate);
    } else {
      this.addSalaryLine(request);
    }
  }

  private handleAddResponse(response: AddSalaryLineResponse) {
    if (
      response.approvedSalaryLines.length > 0 &&
      response.conflictedSalaryLines.length > 0
    ) {
      this.showSuccess(this.translateService.instant('MULTIPLE_TIMELINE_CONFLICT_SUCCESS'));
      this.handleSuccessfulSubmission(response.approvedSalaryLines);
    } else if (
      response.approvedSalaryLines.length === 0 &&
      response.conflictedSalaryLines.length > 0
    ) {
      this.showConflictError = true;
      this.conflictErrorMessage = this.translateService.instant(
        'TIMELINE_CONFLICT_WARNING'
      );
    } else if (
      response.approvedSalaryLines.length > 0 &&
      response.conflictedSalaryLines.length === 0
    ) {

      if(response.approvedSalaryLines.length === 1){
        this.showSuccess(this.translateService.instant('SALARY_LINE_ADDED_SUCCESS'));
        
      } else {
        this.showSuccess(this.translateService.instant('BULK_INSERTION_SALARY_LINES_ADDED_SUCCESS'));
      }

      this.handleSuccessfulSubmission(response.approvedSalaryLines);
    }
  }

  private addSalaryLine(request: AddEditSalaryLineDto) {
    this.conflictErrorMessage = '';
    this.showConflictError = false;

    this.salaryLineService
      .addSalaryLine(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response?.success) {
            this.handleAddResponse(response?.data);
          } else {
            // Confirm again from user if job event conflicts are allowed
            if (response?.message?.startsWith('CONFIRM:')) {
              this.showConflictWarning = true;
              this.conflictWarningMessage = this.translateService.instant(
                'TIMELINE_CONFLICT_WARNING'
              );
            } else {
              this.showConflictError = true;
              this.conflictErrorMessage = this.translateService.instant(
                'TIMELINE_CONFLICT_WARNING'
              );
            }
          }
        },

        error: (error: HttpErrorResponse) => {
          const errorMessage = handleHttpErrorResponse(error);
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant('SALARY_LINE_TITLE'),
            detail: errorMessage,
          });
        },
      });
  }

  private showSuccess(message: string | undefined, severity = 'success'): void {
    if (message) {
      this.messageService.add({
        severity,
        summary: this.translateService.instant('SALARY_LINE_TITLE'),
        detail: message,
      });
    }
  }

  private handleSuccessfulSubmission(
    salaryLines: SalaryLineWorkerDto[] = []
  ): void {
    const response: AddSalaryLineDialogResponse = {
      success: true,
      salaryLines: salaryLines || [],
      isEdit: this.isEditMode,
    };

    this.ref.close(response);
    this.resetForm();
  }

  private updateSalaryLine(
    request: AddEditSalaryLineDto,
    salaryUITemplate: string | null
  ) {
    if (
      !equalsIgnoreCase(
        salaryUITemplate,
        UI_TEMPLATES.TIMELINE_INFORMATION_CONTROL
      )
    ) {
      request.startTime = null;
      request.endTime = null;
    }

    if (
      !equalsIgnoreCase(salaryUITemplate, UI_TEMPLATES.TIME_DISTANCE_CONTROL)
    ) {
      request.startLocation = null;
      request.endLocation = null;
      request.kilometers = null;
      request.totalTime = null;
      request.vehicleType = null;
    }

    this.conflictErrorMessage = '';
    this.showConflictError = false;

    this.salaryLineService
      .updateSalaryLine(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response?.success) {
            this.messageService.add({
              severity: 'success',
              summary: this.translateService.instant('SUCCESS_TITLE'),
              detail: this.translateService.instant(
                'SALARY_LINE_UPDATED_SUCCESS'
              ),
            });
            this.handleSuccessfulSubmission([
              response?.data?.approvedSalaryLine,
            ]);
          } else if (response?.message?.startsWith('CONFIRM:')) {
            this.showConflictWarning = true;
            this.conflictWarningMessage = this.translateService.instant(
              'TIMELINE_CONFLICT_WARNING'
            );
          } else {
            this.showConflictError = true;
            this.conflictErrorMessage = this.translateService.instant(
              'TIMELINE_CONFLICT_ERROR'
            );
          }
        },
        error: (error: HttpErrorResponse) => {
          const errorMessage = handleHttpErrorResponse(error);
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant('SALARY_LINE_TITLE'),
            detail: errorMessage,
          });
        },
      });
  }

  private setSalaryCodeForEdit(): void {
    if (!this.salaryLine) {
      return;
    }

    const matchedSalaryCode = this.salaryCodes.find((code) =>
      equalsIgnoreCase(code.salaryCodeId, this.salaryLine?.salaryCodeId)
    );
    this.addSalaryLineForm.patchValue({ salaryCode: matchedSalaryCode });
  }

  get currentDescription(): string {
    const selectedSalaryCode: SalaryCode | undefined =
      this.addSalaryLineForm.get('salaryCode')?.value;
    return selectedSalaryCode?.salaryDescription || this.DEFAULT_DESCRIPTION;
  }

  get currentQuarterLabel(): string {
    const selectedSalaryCode: SalaryCode | undefined =
      this.addSalaryLineForm.get('salaryCode')?.value;
    return selectedSalaryCode?.salaryCodeUnit || 'Value';
  }

  get currentQuarterPlaceholder(): string {
    const selectedSalaryCode: SalaryCode | undefined =
      this.addSalaryLineForm.get('salaryCode')?.value;
    const fieldName = selectedSalaryCode?.salaryCodeUnit || 'value';
    return `Enter ${fieldName.toLowerCase()}`;
  }

  get isTimeDistanceControl(): boolean {
    const selectedSalaryCode: SalaryCode | undefined =
      this.addSalaryLineForm.get('salaryCode')?.value;
    return equalsIgnoreCase(
      selectedSalaryCode?.uiTemplate,
      UI_TEMPLATES.TIME_DISTANCE_CONTROL
    );
  }

  get isTimelineInformationControl(): boolean {
    const selectedSalaryCode: SalaryCode | undefined =
      this.addSalaryLineForm.get('salaryCode')?.value;
    return equalsIgnoreCase(
      selectedSalaryCode?.uiTemplate,
      UI_TEMPLATES.TIMELINE_INFORMATION_CONTROL
    );
  }

  private setupSalaryCodeChangeListener() {
    this.addSalaryLineForm
      .get('salaryCode')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((selectedSalaryCode) => {
        this.updateDescription(selectedSalaryCode);
        this.resetSalaryCodeUnit();
        this.toggleSalaryUnit(selectedSalaryCode);
        this.populateTimelineValues(selectedSalaryCode);
        this.populateTimeDistanceValues(selectedSalaryCode);
        this.clearTimelineValidation();
        this.clearTimeDistanceValidation();
      });
  }

  private clearTimeDistanceValidation(): void {
    const fields = [
      'startLocation',
      'endLocation',
      'kilometers',
      'totalTime',
      'vehicleType',
    ];

    fields.forEach((field) => {
      this.addSalaryLineForm.get(field)?.clearValidators();
      this.addSalaryLineForm.get(field)?.setErrors(null);
      this.addSalaryLineForm.get(field)?.markAsUntouched();
    });
  }

  private clearTimelineValidation(): void {
    const fields = ['startTime', 'endTime'];

    fields.forEach((field) => {
      this.addSalaryLineForm.get(field)?.clearValidators();
      this.addSalaryLineForm.get(field)?.setErrors(null);
      this.addSalaryLineForm.get(field)?.markAsUntouched();
    });
  }

  private updateDescription(selectedSalaryCode: SalaryCode | undefined): void {
    const description =
      selectedSalaryCode?.salaryDescription || this.DEFAULT_DESCRIPTION;
    this.addSalaryLineForm.patchValue({ description }, { emitEvent: false });
  }

  private resetSalaryCodeUnit(): void {
    this.resetSalaryCodeUnitErrors();
    this.reAddSalaryCodeUnitValidation();
  }

  private resetSalaryCodeUnitErrors(): void {
    const quarterControl = this.addSalaryLineForm.get('quarter');

    if (quarterControl) {
      quarterControl.setErrors(null);
      quarterControl.markAsUntouched();
    }
  }

  private reAddSalaryCodeUnitValidation(): void {
    const quarterControl = this.addSalaryLineForm.get('quarter');

    if (quarterControl) {
      quarterControl.setValidators([
        Validators.required,
        Validators.max(this.currencyMaxValue),
        Validators.min(this.currencyMinValue),
      ]);
      quarterControl.updateValueAndValidity();
    }
  }

  private initializeProductionDateConstraints(
    startDate: string | undefined,
    endDate: string | undefined
  ): void {
    this.deadlineStartDate = convertStringToDate(startDate);
    this.deadlineEndDate = convertStringToDate(endDate);
  }

  getProductionDateMinConstraint(): Date | null {
    if (this.isEditMode) {
      return null;
    }

    return this.deadlineStartDate || null;
  }

  getProductionDateMaxConstraint(): Date | null {
    if (this.isEditMode) {
      return null;
    }

    return this.deadlineEndDate || null;
  }

  isSaveDisabled(): boolean {
    if (this.addSalaryLineForm.invalid) {
      return true;
    }

    return false;
  }

  salaryCodeSubscriber() {
    const salaryCodeControl = this.addSalaryLineForm.get('salaryCode');

    if (!salaryCodeControl) return;

    const initialValue = salaryCodeControl.value;
    this.updateDialogSize(initialValue);

    salaryCodeControl.valueChanges.subscribe((selected) => {
      this.updateDialogSize(selected);
    });
  }

  private updateDialogSize(selected: SalaryCode | undefined) {
    const isTimeDistance = equalsIgnoreCase(
      selected?.uiTemplate,
      UI_TEMPLATES.TIME_DISTANCE_CONTROL
    );
    const isTimelineInfo = equalsIgnoreCase(
      selected?.uiTemplate,
      UI_TEMPLATES.TIMELINE_INFORMATION_CONTROL
    );

    const dialogs = document.querySelectorAll('.p-dialog');
    const salaryDialog = dialogs[dialogs.length - 1] as HTMLElement;

    if (salaryDialog) {
      salaryDialog.classList.remove('p-dialog-sm', 'p-dialog-lg');
      salaryDialog.classList.add(
        isTimeDistance || isTimelineInfo ? 'p-dialog-lg' : 'p-dialog-sm'
      );
    }
  }

  private toggleSalaryUnit(selectedSalaryCode: SalaryCode | undefined): void {
    const isSalaryCodeTemplateOpen = this.uiTemplates.some((template) =>
      equalsIgnoreCase(selectedSalaryCode?.uiTemplate, template)
    );

    if (isSalaryCodeTemplateOpen) {
      this.addSalaryLineForm.get('quarter')?.disable();
    } else {
      this.addSalaryLineForm.get('quarter')?.enable();
    }
  }

  private populateTimelineValues(
    selectedSalaryCode: SalaryCode | undefined
  ): void {
    if (
      equalsIgnoreCase(
        selectedSalaryCode?.uiTemplate,
        UI_TEMPLATES.TIMELINE_INFORMATION_CONTROL
      )
    ) {
      if (this.isEditMode) {
        this.populateTimelineValuesForEdit();
      } else {
        this.populateTimelineValuesForAdd();
      }
    }
  }

  private populateTimelineValuesForAdd(): void {
    const timelineStartTime =
      this.timelineStartTime &&
      isValidDateTimeString(this.timelineStartTime.toISOString())
        ? this.timelineStartTime
        : null;
    const timelineEndTime =
      this.timelineEndTime &&
      isValidDateTimeString(this.timelineEndTime.toISOString())
        ? this.timelineEndTime
        : null;

    if (timelineStartTime && timelineEndTime) {
      this.addSalaryLineForm.patchValue({
        startTime: timelineStartTime,
        endTime: timelineEndTime,
      });

      this.calculateMinutes();
    } else {
      const start = this.addSalaryLineForm.get('startTime')?.value;
      const end = this.addSalaryLineForm.get('endTime')?.value;

      if (start && end) {
        this.calculateMinutes();
      } else {
        this.addSalaryLineForm.get('quarter')?.setValue(null);
      }
    }
  }

  private populateTimelineValuesForEdit(): void {
    if (!this.salaryLine) return;

    if (
      !equalsIgnoreCase(
        this.salaryLine.uiTemplate,
        UI_TEMPLATES.TIMELINE_INFORMATION_CONTROL
      )
    ) {
      this.populateTimelineValuesForAdd();
      return;
    }

    const startTime =
      this.salaryLine.startTime &&
      isValidDateTimeString(this.salaryLine.startTime)
        ? convertStringToDate(this.salaryLine.startTime)
        : null;
    const endTime =
      this.salaryLine.endTime && isValidDateTimeString(this.salaryLine.endTime)
        ? convertStringToDate(this.salaryLine.endTime)
        : null;
    this.addSalaryLineForm.patchValue(
      { startTime, endTime },
      { emitEvent: !this.isEditMode }
    );
    this.calculateMinutes();
  }

  private calculateMinutes(): void {
    const start = this.addSalaryLineForm.get('startTime')?.value;
    const end = this.addSalaryLineForm.get('endTime')?.value;

    if (start && end) {
      const minutes = calculateMinutesBetweenDates(start, end);

      this.addSalaryLineForm.get('quarter')?.setValue(minutes);
    } else {
      this.addSalaryLineForm.get('quarter')?.setValue(null);
    }
  }

  private populateTimeDistanceValues(
    selectedSalaryCode: SalaryCode | undefined
  ): void {
    if (
      equalsIgnoreCase(
        selectedSalaryCode?.uiTemplate,
        UI_TEMPLATES.TIME_DISTANCE_CONTROL
      )
    ) {
      if (this.isEditMode) {
        this.populateTimeDistanceValuesForEdit();
      } else {
        this.populateTimeDistanceValuesForAdd();
      }
    }
  }

  private populateTimeDistanceValuesForAdd(): void {
    const kilometers = this.addSalaryLineForm.get('kilometers')?.value;
    const totalTime = this.addSalaryLineForm.get('totalTime')?.value;
    const startLocation = this.addSalaryLineForm.get('startLocation')?.value;
    const endLocation = this.addSalaryLineForm.get('endLocation')?.value;

    this.addSalaryLineForm.patchValue(
      {
        kilometers: kilometers || null,
        totalTime: totalTime || null,
        startLocation: startLocation || null,
        endLocation: endLocation || null,
      },
      { emitEvent: false }
    );

    if (kilometers) {
      this.addSalaryLineForm.get('quarter')?.setValue(kilometers);
    } else {
      this.addSalaryLineForm.get('quarter')?.setValue(null);
    }
  }

  private populateTimeDistanceValuesForEdit(): void {
    if (!this.salaryLine) {
      return;
    }

    if (
      !equalsIgnoreCase(
        this.salaryLine.uiTemplate,
        UI_TEMPLATES.TIME_DISTANCE_CONTROL
      )
    ) {
      this.populateTimeDistanceValuesForAdd();
      return;
    }

    const formattedKilometers = this.salaryLine.kilometers
      ? Number(this.salaryLine.kilometers).toFixed(2)
      : null;
    const formattedTotalTime = getHHMMFromTimeString(this.salaryLine.totalTime);

    this.addSalaryLineForm.patchValue({
      startLocation: this.salaryLine.startLocation || null,
      endLocation: this.salaryLine.endLocation || null,
      kilometers: formattedKilometers,
      totalTime: formattedTotalTime,
    });
  }

  handlefocusMultiItems() {
    requestAnimationFrame(() => {
      const multiselect = document.querySelector('.p-multiselect');
      if (multiselect?.classList.contains('p-focus')) {
        multiselect?.classList.remove('p-focus');
      }
      const filterInput: HTMLInputElement | null = document.querySelector(
        '.p-multiselect-filter'
      );
      if (filterInput) {
        filterInput.focus();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTimelineChange(): void {
    this.showConflictWarning = false;
    this.showConflictError = false;
  }

  focusDatePicker() {
    setTimeout(() => {
      const hostEl = this.salaryLinedatePicker?.el?.nativeElement;
      const buttonEl = hostEl?.querySelector('.p-datepicker-dropdown');
      if (buttonEl) {
        buttonEl.focus();
      }
    }, 300);
  }

  blurDatePicker() {
    setTimeout(() => {
      const hostEl = this.salaryLinedatePicker?.el?.nativeElement;
      const buttonEl = hostEl?.querySelector('.p-datepicker-dropdown');
      if (buttonEl) {
        buttonEl.blur();
      }
    }, 300);
  }

  onCalendarShow() {
    setTimeout(() => {
      const overlay = document.querySelector(
        '.p-datepicker-panel'
      ) as HTMLElement;
      if (!overlay) return;

      if (this.datePickerKeyListener) {
        overlay.removeEventListener('keydown', this.datePickerKeyListener);
      }

      this.datePickerKeyListener = (event: KeyboardEvent) => {
        if (
          ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(
            event.key
          )
        ) {
          setTimeout(() => {
            const dayCells = overlay.querySelectorAll(
              '.p-datepicker-day-cell span.p-datepicker-day'
            );
            const enabledDays = Array.from(dayCells).filter(
              (day: any) => !day.classList.contains('p-disabled')
            );

            if (enabledDays.length === 0) {
              const targetBtn =
                event.key === 'ArrowRight' || event.key === 'ArrowDown'
                  ? overlay.querySelector('.p-datepicker-next-button')
                  : overlay.querySelector('.p-datepicker-prev-button');

              (targetBtn as HTMLButtonElement)?.focus();
            }
          }, 10);
        }
      };

      overlay.addEventListener('keydown', this.datePickerKeyListener);
    }, 0);
  }
  onCalendarHide() {
    const overlay = document.querySelector(
      '.p-datepicker-panel'
    ) as HTMLElement;
    if (overlay && this.datePickerKeyListener) {
      overlay.removeEventListener('keydown', this.datePickerKeyListener);
      this.datePickerKeyListener = undefined;
    }
  }

  unfocusDropdownItems() {
    setTimeout(() => {
      const dropdownElement = document.querySelector(
        '.p-select-list-container'
      );
      if (dropdownElement) {
        this.renderer.setAttribute(dropdownElement, 'tabindex', '-1');
      }
    });
  }

  focusSelectAppendTo() {
    const selectElements = document.querySelectorAll('p-select');
    selectElements.forEach((select) => {
      (select as HTMLElement).addEventListener(
        'keydown',
        (event: KeyboardEvent) => {
          if (event.key === 'Tab') {
            setTimeout(() => {
              const hasOpenClass = select.classList.contains('p-select-open');
              const hasFocusClass = select.classList.contains('p-focus');

              if (hasOpenClass && !hasFocusClass) {
                const filterInput = document.querySelector(
                  '.p-select-filter'
                ) as HTMLInputElement;
                if (filterInput) {
                  setTimeout(() => {
                    filterInput.focus();
                  }, 10);
                }
              }
            }, 0);
          }
        },
        true
      );
    });
  }

  trackLastTabKey() {
    window.addEventListener('keydown', (e) => {
      this.lastKeyWasTab = e.key === 'Tab';
    });
  }
  onDatepickerFocus(event: any) {
    if (this.lastKeyWasTab) {
      this.showDatePikcerOnFocus = false;
    } else {
      this.showDatePikcerOnFocus = true;
    }
  }
}
