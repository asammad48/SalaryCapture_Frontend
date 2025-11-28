import { allowedDeadlineFileTypes } from './../../../../core/domain/constants/application-constants';
import { Component, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { SalaryCalculationPortalBase } from '../../../base/salary-calculation-base/salary-calculation.base';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { UploadDeadlineRequest } from '../../../../core/domain/requests/upload-deadlineCSV.request';
import { ProgressBarModule } from 'primeng/progressbar';
import { ImportService } from '../../../../data/repositories/imports/imports-web.repository/imports.service';
import { AccessService } from '../../../../data/repositories/access/access.service';
import { UsersService } from '../../../../data/repositories/usersManagement/users.service';
import { DataNextService } from '../../../services/data-next.service';
import { allowedDeadlineFileExtensions } from 'core-ui-salary-calculation-library/src/lib/core/domain/constants/application-constants';
import { equalsIgnoreCase } from 'core-ui-salary-calculation-library/src/lib/data/shared/helper.function';

@Component({
  selector: 'lib-upload-deadline-period',
  imports: [CommonModule, FileUploadModule, FormsModule, ProgressBarModule],
  providers: [ImportService, AccessService, UsersService],
  templateUrl: './upload-deadline-period.component.html'
})
export class UploadDeadlinePeriodComponent extends SalaryCalculationPortalBase {

  isFileUploaded = false;
  progressBarValue = 0;
  maxFileSize = 50000000;
  fileURL = "assets/Deadline input.csv";
  fileErrorMessage: string | null = null;

  fileName: string | null = null;

  constructor(public ref: DynamicDialogRef, public config: DynamicDialogConfig, inject: Injector,
    private importService: ImportService,   private dataNextService: DataNextService,
  ) {
    super(inject);
  }

  files: File[] = [];

  onSelect(event: { files: File[] }) {

    this.files = [];
    this.fileErrorMessage = null;
    if (!event.files || event.files.length === 0) return;

    const file = event.files[0];
    const fileExtension = this.getFileExtension(file.name);

    if (this.isValidFile(file, fileExtension)) {
      this.files.push(file);
      this.isFileUploaded = true;
      this.progressBarValue = 100;

    } else {
      this.fileErrorMessage = this.translate.instant('UPLOAD_DEADLINE_INCORRECT_FILE');
    }
  }

  private isValidFile(file: File, extension: string): boolean {

    // Check file extension first (more reliable across browsers)
    const hasValidExtension = allowedDeadlineFileExtensions.some(ext => equalsIgnoreCase(extension, ext));

    if (!hasValidExtension) {
      return false;
    }

    // Firefox may use 'application/octet-stream' for CSV and Excel files, so if extension is valid, we can be more lenient with MIME type
    if (file.type === 'application/octet-stream') {
      return true;
    }

    // For other browsers, check the MIME type
    return allowedDeadlineFileTypes.includes(file.type);
  }

  private getFileExtension(filename: string): string {

    const lastDotIndex = filename.lastIndexOf('.');

    if (lastDotIndex === -1) return '';

    return filename.substring(lastDotIndex);
  }

  closeModal(result: { success: boolean; count: number }) {
    this.ref.close(result);
  }

  cancelFile(event: File) {
    this.files.splice(this.files.indexOf(event), 1);
    this.isFileUploaded = false;
    this.progressBarValue = 0;
    this.fileName = null;
    this.fileErrorMessage = null;
  }

  cancel() {
    this.files = [];
    this.isFileUploaded = false;
    this.progressBarValue = 0;
    this.fileErrorMessage = null;

    this.closeModal({ success: false, count: 0 });
  }

  upload() {

    const request: UploadDeadlineRequest = {
      file: this.files[0],
      fileName: this.fileName != null ? this.fileName : ''
    }

    this.importService.UploadDeadlineCsv(request)
      .pipe(takeUntil(this.destroyer$))
      .subscribe({
        next: (data: { data?: { countDeadlineAdded: number } }) => {
          const count = data.data?.countDeadlineAdded;
          this.messageService.clear();

          if (count && count > 0) {
            this.files = [];
            this.isFileUploaded = false;
            this.progressBarValue = 0;
            this.closeModal({ success: true, count: count });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('DEADLINE_TITLE'),
              detail: this.translate.instant('UPLOAD_DEADLINE_DATA_ERROR'),
            });

            this.files = [];
            this.isFileUploaded = false;
            this.progressBarValue = 0;
            this.closeModal({ success: false, count: 0 });
          }
        },
        error: (err) => {
          this.messageService.clear();
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('DEADLINE_TITLE'),
            detail: err.error?.message
          });

          this.files = [];
          this.isFileUploaded = false;
          this.progressBarValue = 0;
          this.closeModal({ success: false, count: 0 });
        }
      });

  }

  choose(event: Event, callback: () => void) {
    callback();
  }
}
