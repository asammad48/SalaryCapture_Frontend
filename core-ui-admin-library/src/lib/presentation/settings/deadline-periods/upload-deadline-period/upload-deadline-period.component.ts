import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'lib-upload-deadline-period',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="upload-deadline-period-container p-4">
    <p>Upload Deadline Period</p>
    <div class="mt-3">
      <button type="button" class="btn btn-secondary" (click)="close()">Cancel</button>
    </div>
  </div>`,
})
export class UploadDeadlinePeriodComponent {
  constructor(private dialogRef: DynamicDialogRef) {}

  close(): void {
    this.dialogRef.close({ success: false, count: 0 });
  }
}
