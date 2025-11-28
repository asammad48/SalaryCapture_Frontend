import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { allowedBasePlanFileExtensions, allowedBasePlanFileTypes } from '../../../../core/domain/constants/csv-file.constant';
import { DatePicker } from 'primeng/datepicker';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressBar } from 'primeng/progressbar';
import { DialogMode } from '../../../../core/domain/constants/dialog-mode.enum';
import { ProgressLoadingComponent } from "../../../shared/components/progress-loading/progress-loading.component";

@Component({
  standalone: true,
  selector: 'app-new-base-plan-dialog',
  templateUrl: './new-base-plan-dialog.component.html',
  styleUrls: ['./new-base-plan-dialog.component.scss'],
  imports: [DatePicker, CommonModule, FileUploadModule, ProgressBar, ReactiveFormsModule, ProgressLoadingComponent],
})
export class NewBasePlanDialogComponent implements OnInit {
  basePlanForm: FormGroup;
  isFileUploaded = false;
  progressBarValue = 0;
  maxFileSize = 150000000; // 150 MB
  uploadedFile: File | null = null;
  fileErrorMessage: string | null = null;
  minEndDate: Date | null = null;
  maxStartDate: Date | null = null;

  dialogMode: DialogMode = DialogMode.Add;
  basePlanId?: string;
  readonly DialogMode = DialogMode;

  constructor(
    public ref: DynamicDialogRef,
    private readonly config: DynamicDialogConfig,
    private fb: FormBuilder
  ) {
    this.dialogMode = this.config.data?.mode || DialogMode.Add;
    this.basePlanId = this.config.data?.basePlanId;
    this.basePlanForm = this.initializeForm();
    this.setupDateChangeListeners();
  }

  ngOnInit(): void {
    if (this.dialogMode === DialogMode.Edit && this.config.data?.basePlan) {
      this.populateFormWithEditData(this.config.data.basePlan);
    }
  }

  private initializeForm(): FormGroup {

    const fileValidators = this.dialogMode === DialogMode.Edit
      ? []
      : [Validators.required];

    return this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(1), this.noWhitespaceValidator]],
        startDate: [null, [Validators.required]],
        endDate: [null, [Validators.required]],
        file: [null, fileValidators]
      },
      {
        validators: [this.dateRangeValidator]
      }

    );

  }

  private populateFormWithEditData(basePlan: any): void {
    this.basePlanId = basePlan.id;

    this.basePlanForm.patchValue({
      name: basePlan.name,
      startDate: basePlan.startDate ? new Date(basePlan.startDate) : null,
      endDate: basePlan.endDate ? new Date(basePlan.endDate) : null
    });

    if (basePlan.fileName) {
      this.isFileUploaded = true;
      this.progressBarValue = 100;
    }
  }

  private setupDateChangeListeners(): void {
    this.basePlanForm.get('startDate')?.valueChanges.subscribe(startDate => {
      if (startDate) {
        this.minEndDate = new Date(startDate);
      } else {
        this.minEndDate = null;
      }
    });

    this.basePlanForm.get('endDate')?.valueChanges.subscribe(endDate => {
      if (endDate) {
        this.maxStartDate = new Date(endDate);
      } else {
        this.maxStartDate = null;
      }
    });
  }

  noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    const isWhitespace = value.trim().length === 0;
    return isWhitespace ? { whitespace: true } : null;
  }

  // Custom validator to ensure end date is not before start date (can be equal)
  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;

    if (startDate && endDate && endDate < startDate) {
      return { dateRangeInvalid: true };
    }
    return null;
  }

  get isFormValid(): boolean {
    if (this.dialogMode === DialogMode.Edit) {
      return this.basePlanForm.valid;
    }
    return this.basePlanForm.valid && this.isFileUploaded;
  }

  get isEditMode(): boolean {
    return this.dialogMode === DialogMode.Edit;
  }

  get nameControl() {
    return this.basePlanForm.get('name');
  }

  get startDateControl() {
    return this.basePlanForm.get('startDate');
  }

  get endDateControl() {
    return this.basePlanForm.get('endDate');
  }

  get isDateRangeInvalid(): boolean {
    return (this.basePlanForm.hasError('dateRangeInvalid') &&
           (this.startDateControl?.touched ?? false) &&
           (this.endDateControl?.touched ?? false)) ?? false;
  }

  onSelect(event: { files: File[] }) {
    this.fileErrorMessage = null;
    this.uploadedFile = null;

    if (!event.files || event.files.length === 0) return;

    const file = event.files[0];

    // Check file size
    if (file.size > this.maxFileSize) {
      this.fileErrorMessage = `File size exceeds maximum limit of ${this.maxFileSize / 1000000} MB`;
      this.isFileUploaded = false;
      return;
    }

    const fileExtension = this.getFileExtension(file.name);

    if (this.isValidFile(file, fileExtension)) {
      this.uploadedFile = file;
      this.isFileUploaded = true;
      this.progressBarValue = 100;
      this.basePlanForm.patchValue({ file: file });
      this.basePlanForm.get('file')?.markAsTouched();
    } else {
      this.fileErrorMessage = 'Invalid file type. Only CSV files (.csv) are allowed';
      this.isFileUploaded = false;
    }
  }

  private isValidFile(file: File, extension: string): boolean {

    // Check file extension first (more reliable across browsers)
    const hasValidExtension = allowedBasePlanFileExtensions.some(ext =>
      extension.toLowerCase() === ext.toLowerCase()
    );

    if (!hasValidExtension) {
      return false;
    }

    // Firefox may use 'application/octet-stream' for CSV files
    if (file.type === 'application/octet-stream') {
      return true;
    }

    // For other browsers, check the MIME type
    return allowedBasePlanFileTypes.includes(file.type);
  }

  private getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) return '';
    return filename.substring(lastDotIndex);
  }

  cancelFile(file: File) {
    this.uploadedFile = null;
    this.isFileUploaded = false;
    this.progressBarValue = 0;
    this.fileErrorMessage = null;
    this.basePlanForm.patchValue({ file: null });
  }

  choose(event: Event, callback: () => void) {
    callback();
  }

  closeModal(isConfirm: boolean) {

    if (isConfirm) {

      Object.keys(this.basePlanForm.controls).forEach(key => {
        this.basePlanForm.get(key)?.markAsTouched();
      });

      if (!this.isFormValid) {
        return;
      }

      const formData = {
        id: this.basePlanId,
        name: this.basePlanForm.value.name,
        startDate: this.basePlanForm.value.startDate,
        endDate: this.basePlanForm.value.endDate,
        file: this.uploadedFile,
        mode: this.dialogMode
      };

      this.ref.close({ success: true, data: formData });

    } else {
      this.ref.close({ success: false });
    }

  }

  cancel() {
    this.basePlanForm.reset();
    this.uploadedFile = null;
    this.isFileUploaded = false;
    this.progressBarValue = 0;
    this.fileErrorMessage = null;
    this.ref.close({ success: false });
  }
}
