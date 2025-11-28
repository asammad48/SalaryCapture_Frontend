import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Injector,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, lastValueFrom, takeUntil } from 'rxjs';
import { Permissions } from '../../../../core/domain/constants/claims.constants';
import { SalaryCalculationPortalBase } from '../../../base/salary-calculation-base/salary-calculation.base';
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import {SelectModule } from 'primeng/select';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Area } from '../../../../core/domain/models/area.model';
import {
  Deadline,
  SalaryLineDuration,
  ServiceWorkerRole,
} from '../../../../core/domain/models';
import { MultiSelectModule } from 'primeng/multiselect';
import { AccessService } from '../../../../data/repositories/access/access.service';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { UsersRepository } from '../../../../core/repositories/users.repository';
import { SalaryLineService } from '../../../../data/repositories/salary-line/salary-line.service';
import { SalaryCode } from '../../../../core/domain/models/SalaryLine/salary-code.model';
import { DatePicker } from "primeng/datepicker";
import { SalaryStatus } from '../../../../core/domain/enums/SalaryLineActions';
import { DEADLINE_DURATION } from 'core-ui-salary-calculation-library/src/lib/core/domain/constants/application-constants';
import { CustomValidators } from '../../../shared/validators/custom-validators';

@Component({
    selector: 'lib-salary-filters-list',
    imports: [CommonModule, ReactiveFormsModule,
    DropdownModule,
    MultiSelectModule,
    ButtonModule,
    CalendarModule, FormsModule, SelectModule, DatePicker],
    templateUrl: './salary-list-filters.component.html'
})
export class SalaryListFiltersComponent
  extends SalaryCalculationPortalBase
  implements OnInit, AfterViewInit, OnDestroy
{
  Permissions = Permissions;
  @Output() dataEvent = new EventEmitter<any>();
  @Output() filterPanelState = new EventEmitter<any>();
  @Output() getDeadLinePeriod = new EventEmitter<any>();
  @Output() getSalaryCode = new EventEmitter<any>();
  @Output() subAreaChange = new EventEmitter<string>();
  @Output() salaryCodeChange = new EventEmitter<SalaryCode>();
  @Output() allSalaryCodes = new EventEmitter<SalaryCode[]>();

  @ViewChild('regionDropdown') regionDropdown!: Dropdown;
  @ViewChild('rolesMultiSelect') rolesMultiSelect: any;
  @ViewChild('filterToggler') filterToggler: any;
  @ViewChild('paymentMultiSelect') paymentMultiSelect: any;

  private destroy$ = new Subject<void>();
  rolesInputElement: any;
  paymentInputElement: any;
  filterPanelCollapsed = true;
  UsersFilters!: FormGroup;
  subAreasOptions: Area[] = [];
  canCheckBackDates = true;
  salaryLineDurations: SalaryLineDuration[] = [];
  rangeDates: Date[] | undefined;
  minDate: Date = new Date();
  maxDate: Date = new Date();
  startDate = '';
  endDate = '';
  deadline: Deadline | undefined;
  showDeadLine = false;
  selectedOptions: any[] = [];
  paymentStatuses: string[] = [];
  serviceWorkerRoles: ServiceWorkerRole[] = [];
  durations: SalaryLineDuration[] = [];
  salaryCodes: SalaryCode[] = [];

  isLoadingRegions = false;
  isLoadingDurations = false;
  isSalaryCodesLoading = false;
  isSmallScreen = false;


  statusesOptions: any[] = [
    { id: SalaryStatus.Approved, name: 'Approved' },
    { id: SalaryStatus.Pending, name: 'Pending' },
    { id: SalaryStatus.Rejected, name: 'Rejected' }
  ];

  customDuration: boolean = false;

  constructor(
    inject: Injector,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private userRepository: UsersRepository,
    private renderer: Renderer2,
    private salaryLineService: SalaryLineService
  ) {
    super(inject);
  }

  ngOnInit() {
    this.initializeForm();
    this.loadInitialData();
    this.checkScreenSize();
    this.windowResizerListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.UsersFilters = this.fb.group({
      area: [null, [Validators.required]],
      region: [null, [Validators.required]],
      duration: [null, [Validators.required]],
      fromDate: [null, []],
      toDate: [null, []],
      salaryLines: [null, []],
      salaryStatus: [null, []],
    }, { validators: CustomValidators.dateRange() });
  }

  private async loadInitialData(): Promise<void> {
    const tenantId = this.accessService.GetTenantId();
    if(tenantId) {
    await Promise.all([
      this.loadAreas(),
      this.getDurations(),
      this.getSalaryCodes(tenantId)
    ]);
  }
  
    if (!this.isApplyFiltersButtonDisabled()) {
      this.applyFilters(true);
    }

    this.cdRef.detectChanges();
  }

  // Data loading methods
  private async loadAreas(): Promise<void> {
    this.isLoadingRegions = true;
    try {
      const response = await lastValueFrom(
        this.accessService.getUserRegions().pipe(
          takeUntil(this.destroy$)
        )
      );
      this.regions = response;
      this.cdRef.detectChanges();
      
      this.setDefaultRegionAndArea();
      
      this.isLoadingRegions = false;
    } catch (error) {
      this.isLoadingRegions = false;
      this.handleErrors(error);
    }
  }

  private async getDurations(): Promise<void> {
    this.isLoadingDurations = true;
    try {
      const response = await lastValueFrom(
        this.salaryLineService.getDurations().pipe(
          takeUntil(this.destroy$)
        )
      );
      this.durations = response;
      this.salaryLineDurations = JSON.parse(JSON.stringify(this.durations));
      const customDuration = this.salaryLineDurations.find(x => x.id === DEADLINE_DURATION.Custom);
      if(customDuration) {
        this.UsersFilters.get('duration')?.setValue(customDuration);
        this.onDurationChange({ value: customDuration });
      }
      this.isLoadingDurations = false;
      this.cdRef.detectChanges();
    } catch (error) {
      this.isLoadingDurations = false;
      this.handleErrors(error);
    }
  }

  private async getSalaryCodes(tenantId: string): Promise<void> {
    this.isSalaryCodesLoading = true;
    try {
      const response = await lastValueFrom(
        this.salaryLineService.getSalaryCodes(tenantId).pipe(
          takeUntil(this.destroy$)
        )
      );
      this.salaryCodes = response.data;
      this.isSalaryCodesLoading = false;
      this.allSalaryCodes.emit(this.salaryCodes);
      this.cdRef.detectChanges();
    } catch (error) {
      this.isSalaryCodesLoading = false;
      this.handleErrors(error);
    }
  }

  private handleErrors(error: any): void {
    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('SALARY_LINES_TITLE'),
      detail: error.message || this.translate.instant('SOMETHING_WENT_WRONG_TRY_AGAIN'),
      life: 5000
    });
  }

  private setDefaultRegionAndArea(): void {

    this.UsersFilters.get('region')?.setValue(null);
    this.UsersFilters.get('area')?.setValue(null);
    this.subAreasOptions = [];

    if (!this.regions || this.regions.length === 0) return;
    
    const selectedRegion = this.regions[0];
    this.UsersFilters.get('region')?.setValue(selectedRegion);

    const selectedRegionId = selectedRegion.areaId;
    const allAreasForRegion = this.regions.find(x => x.areaId === selectedRegionId)?.subAreas || [];
    const availableAreas = allAreasForRegion.filter(area => area.parentId === selectedRegionId);
    
    this.subAreasOptions = [...availableAreas];
    this.subAreas = allAreasForRegion;
    
    if (availableAreas.length > 0) {
      this.UsersFilters.get('area')?.setValue(availableAreas[0]);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.regionDropdown.focus();
    });
   
    this.focusSelectAppendTo();
  }

  onDateSelect(event: any) {
    const dateValues = this.UsersFilters.get('date');
    if(dateValues?.value != null && dateValues?.value?.filter((d:any) => d !== null)?.length == 1){
      dateValues?.patchValue(null);
    }
  }

  patchFilters(filters: any) {
    const subAreas = filters?.area?.subAreas || [];
    this.subAreasOptions = [...subAreas];

    this.UsersFilters.patchValue(filters);
    filters.date && this.UsersFilters.get('date')?.patchValue([new Date(filters.date[0]), new Date(filters.date[1])])
    this.applyFilters();
    const isEmpty = this.checkFormEmpty();
    !isEmpty && this.getDeadLinePeriod.emit(this.UsersFilters.value)
  }

  filterPanelToggler() {
    this.filterPanelCollapsed = !this.filterPanelCollapsed;
    this.filterPanelState.emit(this.filterPanelCollapsed);
  }

  onRegionChange(event: any) {
    const selectedArea = event.value?.areaId;
    this.subAreas = this.regions.find(x => x.areaId === selectedArea)?.subAreas || [];
    const filteredSubAreas = this.subAreas.filter((x) => x.parentId === selectedArea);
    this.subAreasOptions = [...filteredSubAreas];
    this.cdRef.detectChanges();
    this.UsersFilters.get('area')?.enable();
    this.UsersFilters.get('area')?.setValue(null);
    this.UsersFilters.get('area')?.setValue(filteredSubAreas[0]);
  }

  checkFormEmpty(){
    const values = this.UsersFilters.value;
    let isEmpty = Object.values(values).every((value) => value === null);
    if (!isEmpty) {
      const keys = Object.keys(values);
      let checkValues = true;
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = values[key];
        if (checkValues) {
          if (key === 'area' || key === 'region ') {
            checkValues = value?.areaId === null || value?.areaId === 'null';
          } else if (key === 'duration') {
            checkValues = value?.id === null || value?.id === 'null';
          }
        }
      }
      isEmpty = checkValues;
    }
    return isEmpty;
  }

  onSubAreaChange(event: any) {
    const selectedSubArea = event.value?.areaId;
    this.subAreaChange.emit(selectedSubArea);
  }

  onDurationChange(event: any) {

    const durationId = event.value.id;
    const fromDateControl = this.UsersFilters.get('fromDate');
    const toDateControl = this.UsersFilters.get('toDate');

    if(durationId == 9){

      fromDateControl?.setValidators([Validators.required]);
      toDateControl?.setValidators([Validators.required]);

      this.customDuration = true;
      
      this.setTodayDateForDuration();
    }
    else{

      this.UsersFilters.get('fromDate')?.patchValue(null);
      this.UsersFilters.get('toDate')?.patchValue(null);

      fromDateControl?.clearValidators();
      toDateControl?.clearValidators();
      this.customDuration = false;
    }

    fromDateControl?.updateValueAndValidity();
    toDateControl?.updateValueAndValidity();
  }

  onSalaryCodeChange(event: any) {
    const selectedSalaryCode = event.value as SalaryCode;
    this.salaryCodeChange.emit(selectedSalaryCode);
    const salaryCode = this.UsersFilters.get('salaryLines')?.value
    if(salaryCode){
      const isEmpty = this.checkFormEmpty();
      !isEmpty && this.getSalaryCode.emit(this.UsersFilters.value)
    }
  }
  onSalaryCodeClear(event: any) {
    this.salaryCodeChange.emit({} as SalaryCode);
  }

  applyFilters(filter = false) {
    const values = this.UsersFilters.value;
    let isEmpty = Object.values(values).every((value) => value === null);
    if (!isEmpty) {
      const keys = Object.keys(values);
      let checkValues = true;
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = values[key];
        if (checkValues) {
          if (key === 'area' || key === 'region ') {
            checkValues = value?.areaId === null || value?.areaId === 'null';
          } else if (key === 'duration' || key === 'salaryLines') {
            checkValues = value?.id === null || value?.id === 'null';
          } else if (key === 'roles ' || key === 'paymentStatus') {
            if (value.length === 1) {
              checkValues = value[0]?.id === null || value[0]?.id === 'null';
            }
          }
        }
      }
      isEmpty = checkValues;
    }

    const item = this.salaryLineDurations.find(x => x.id === 8);
    const data = this.UsersFilters.get('duration')?.value;
    if(!data || data === null || data === 'null'){
      this.UsersFilters.get('duration')?.patchValue(item);
    }

    (!isEmpty || filter) && this.dataEvent.emit(this.UsersFilters.value);
  }
 
unfocusDropdownItems() {
  setTimeout(() => {
    const dropdownElement = document.querySelector('.p-select-list-container');
    if (dropdownElement) {
      this.renderer.setAttribute(dropdownElement, 'tabindex', '-1');
    }
  }); 
}

unfocusMultiItems() {
  setTimeout(() => {
    const dropdownElement = document.querySelector('.p-multiselect-list-container');
    if (dropdownElement) {
      this.renderer.setAttribute(dropdownElement, 'tabindex', '-1');
    }
  });
}

unfocusMultiselectItems() {
    setTimeout(() => {
      const multiselectElement = document.querySelector('.p-multiselect-items-wrapper');
      this.renderer.setAttribute(multiselectElement, 'tabindex', '-1');
    });

    const selectAllCheckbox = document.querySelector('.p-multiselect-header .p-checkbox .p-checkbox-box');
    if (selectAllCheckbox?.classList.contains('p-focus')) {
      selectAllCheckbox?.classList.remove('p-focus');
    }
  }

focusSelectAppendTo() {
  const selectElements = document.querySelectorAll('p-select');
  selectElements.forEach(select => {
    (select as HTMLElement).addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setTimeout(() => {
          const hasOpenClass = select.classList.contains('p-select-open');
          const hasFocusClass = select.classList.contains('p-focus');
          
          if (hasOpenClass && !hasFocusClass) {
            const filterInput = document.querySelector('.p-select-filter') as HTMLInputElement;
            if (filterInput) {
            setTimeout(() => {
                filterInput.focus();
              }, 10);
            }
            }
          }, 0);
        }
      }, true);
    });
}

  handlefocusMultiItems(){
    this.unfocusMultiItems();
    this.autoFocusToFilterInput();
  }

  onRolesPanelHide() {
    setTimeout(() => {
      this.rolesInputElement = this.rolesMultiSelect.el.nativeElement.querySelector('input');
      this.rolesInputElement.focus();
    }, 10);
  }

  onPaymentPanelHide() {
    setTimeout(() => {
      this.paymentInputElement = this.paymentMultiSelect.el.nativeElement.querySelector('input');
      this.paymentInputElement.focus();
    }, 10);
  }

  onPaymentPanelShow() {
    const selectAllCheckbox = document.querySelector('.p-multiselect-header .p-checkbox .p-checkbox-box');
    if (selectAllCheckbox?.classList.contains('p-focus')) {
      selectAllCheckbox?.classList.remove('p-focus');
    }
  }

  onOptionSelected(event: any) {
    this.selectedOptions = event.value;
  }

  isCustomDurationSelected(): boolean {
    const selectedDuration = this.UsersFilters.get('duration')?.value;
    return selectedDuration && selectedDuration.id === DEADLINE_DURATION.Custom;
  }

  setTodayDateForDuration(): void {
    const today = new Date();
    this.UsersFilters.get('fromDate')?.patchValue(today);
    this.UsersFilters.get('toDate')?.patchValue(today);
  }

  onDateChange(): void {
    this.UsersFilters.updateValueAndValidity();
  }

  hasDateRangeError(): boolean {
    return this.UsersFilters.hasError('dateRangeInvalid');
  }

  getDateRangeErrorMessage(): string {

    if (this.hasDateRangeError()) {
      return 'To date must be equal or later than from date';
    }

    return '';
  }

   checkScreenSize() {
    this.isSmallScreen = window.innerHeight  < 740;
  }

  windowResizerListener(){
     window.addEventListener('resize', () => this.checkScreenSize());
  }

  isApplyFiltersButtonDisabled(): boolean {
    return !this.accessService.hasPermission(Permissions.SALARY_CAPTURE_APPLY_FILTERS_BUTTON) || this.UsersFilters.invalid;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent): void {
     if (event.ctrlKey && event.key.toLowerCase() === 'home') {
     this.filterToggler.nativeElement.focus();
    }
  }
}
