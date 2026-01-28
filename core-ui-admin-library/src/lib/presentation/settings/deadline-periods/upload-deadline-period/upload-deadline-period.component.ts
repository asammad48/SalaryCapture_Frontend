import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'lib-upload-deadline-period',
  standalone: true,
  imports: [CommonModule, FileUploadModule, ButtonModule],
  templateUrl: './upload-deadline-period.component.html',
})
export class UploadDeadlinePeriodComponent {
  constructor(public ref: DynamicDialogRef) {}

  onUpload(event: any): void {
    this.ref.close({ success: true, count: 1 });
  }

  onCancel(): void {
    this.ref.close({ success: false, count: 0 });
  }
}
