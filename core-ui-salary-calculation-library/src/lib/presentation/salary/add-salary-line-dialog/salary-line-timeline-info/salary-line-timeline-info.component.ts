import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule} from '@angular/common';
import { DatePicker } from 'primeng/datepicker';
import { AbstractControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { calculateMinutesBetweenDates, convertStringToDate, isTimeBefore, isValidDateTimeString } from 'core-ui-salary-calculation-library/src/lib/data/shared/helper.function';
import { VALIDATION_ERROR_MESSAGES } from 'core-ui-salary-calculation-library/src/lib/core/domain/constants/application-constants';
import { GetSalaryLineDto } from 'core-ui-salary-calculation-library/src/lib/core/domain/models';
import { TenantConfigurationService } from '../../../services/tenant-configuration.service';
import { SalaryLineDialogConfig } from 'core-ui-salary-calculation-library/src/lib/core/domain/models/SalaryLine/salary-line-dialog-config';

@Component({
  selector: 'lib-salary-line-timeline-info',
  imports: [CommonModule, DatePicker, ReactiveFormsModule],
  templateUrl: './salary-line-timeline-info.component.html',
  standalone: true,
})

export class SalaryLineTimelineInfoComponent implements OnInit, AfterViewInit, OnDestroy {

  private destroy$ = new Subject<void>();

  @Input() addSalaryLineForm!: FormGroup;
  @Input() salaryLine: GetSalaryLineDto | undefined = undefined;
  @Input() isEditMode = false;
  stepMinute = this.tenantConfig.calendarMovementInterval;
 
  @Input() timelineStartTime: Date | undefined = undefined;
  @Input() timelineEndTime: Date | undefined = undefined;

  @Input() salaryLineDialogConfig: SalaryLineDialogConfig | undefined = undefined;

  @Output() onTimelineChange = new EventEmitter<void>();

  timelineError = VALIDATION_ERROR_MESSAGES.TIMELINE_RANGE;

  constructor(private tenantConfig: TenantConfigurationService) {}

  ngOnInit() {
    this.setupUnitFieldCalculation();
    this.setTimelineInformationFieldsValidation();
  }

  ngAfterViewInit(): void {
    this.checkTimelineRange();
    this.focusStartTimeInput();
  }

  private focusStartTimeInput(): void {
    if(this.isEditMode && this.salaryLineDialogConfig?.editFromTimeline) {
      setTimeout(() => {
        const startTimeInput: HTMLInputElement | null = document.querySelector('#calendar-timeonly-start');
        startTimeInput?.focus();
      });
    }
  }

  private setupUnitFieldCalculation(): void {

    const startTimeControl = this.addSalaryLineForm.get('startTime');
    const endTimeControl = this.addSalaryLineForm.get('endTime');

    if (!startTimeControl || !endTimeControl) return;

    startTimeControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.calculateMinutes();
      this.checkTimelineRange();
      this.onTimelineChange.emit();
    });

    endTimeControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.calculateMinutes();
      this.checkTimelineRange();
      this.onTimelineChange.emit();
    });

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

  private checkTimelineRange(): void {

    const startTimeCtrl = this.addSalaryLineForm.get('startTime');
    const endTimeCtrl = this.addSalaryLineForm.get('endTime');

    if (!startTimeCtrl || !endTimeCtrl) return;

    this.clearTimelineError(startTimeCtrl);
    this.clearTimelineError(endTimeCtrl);

    const startTime = startTimeCtrl.value;
    const endTime = endTimeCtrl.value;

    if (!startTime || !endTime) return;

    if (startTimeCtrl.errors?.['required'] || endTimeCtrl.errors?.['required']) return;

    const isBefore = isTimeBefore(startTime, endTime);

    if (!isBefore) {
      this.addTimelineError(startTimeCtrl);
      this.addTimelineError(endTimeCtrl);
    }

  }

  private clearTimelineError(ctrl: AbstractControl) {
    if (!ctrl) return;
    const errors = ctrl.errors;
    if (errors && errors['timelineRange']) {
      const newErrors = { ...errors };
      delete newErrors['timelineRange'];
      ctrl.setErrors(Object.keys(newErrors).length ? newErrors : null);
    }
  }

  private addTimelineError(ctrl: AbstractControl) {
    const errors = ctrl.errors ? { ...ctrl.errors } : {};
    errors['timelineRange'] = true;
    ctrl.setErrors(errors);
    ctrl.markAsTouched();
  }

  private setTimelineInformationFieldsValidation(): void {

    const fields = ['startTime', 'endTime'];

    fields.forEach(field => {
      this.addSalaryLineForm.get(field)?.setValidators([Validators.required]);
    });

  }

  get showTimelineError(): boolean {

    const startCtrl = this.addSalaryLineForm.get('startTime');
    const endCtrl = this.addSalaryLineForm.get('endTime');

    if (!startCtrl || !endCtrl) return false;

    const hasTimelineError = startCtrl.hasError('timelineRange') && endCtrl.hasError('timelineRange');
    const noRequiredErrors = !startCtrl.hasError('required') && !endCtrl.hasError('required');
    const touched = startCtrl.touched || endCtrl.touched;

    return hasTimelineError && noRequiredErrors && touched;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
