import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddEditSalaryLineDto } from '../../../../core/domain/requests';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConflictDialogData } from '../../../../core/domain/models/SalaryLine/conflict-dialog-data';
import { WarningBannerComponent } from '../../../shared/warning-banner';
import { SalaryLineService } from '../../../../data/repositories/salary-line/salary-line.service';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { ProgressLoadingComponent } from '../../../shared/progress-loading/progress-loading.component';

@Component({
  selector: 'lib-conflict-confirmation-dialog',
  imports: [CommonModule, WarningBannerComponent, ProgressLoadingComponent],
  templateUrl: './conflict-confirmation-dialog.component.html'
})

export class ConflictConfirmationDialogComponent implements AfterViewInit{

  showConflictWarning = false;
  conflictWarningMessage = '';

  showConflictError = false;
  conflictErrorMessage = '';

  request: AddEditSalaryLineDto | null = null;
  data: ConflictDialogData;
  @ViewChild('confirmBtn') confirmBtn: any;
  

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public salaryLineService: SalaryLineService,
    public messageService: MessageService,
    public translateService: TranslateService
  ) {
      const { request, conflictDialogData } = this.config.data;
      this.request = request;
      this.data = conflictDialogData;
      this.conflictWarningMessage = this.translateService.instant('TIMELINE_CONFLICT_WARNING');
      this.conflictErrorMessage = this.translateService.instant('TIMELINE_CONFLICT_ERROR');
  }

  ngAfterViewInit(): void {
    this.confirmBtn.nativeElement.focus();
  }

  close({revert, openUpdateSalaryLineDialog}: {revert: boolean, openUpdateSalaryLineDialog: boolean}): void {
    this.ref.close({revert, openUpdateSalaryLineDialog});
  }

  confirm(): void {

    if(!this.request) return;

    if(this.showConflictError) {
      this.close({revert: true, openUpdateSalaryLineDialog: true});
      return;
    }
    
    this.request.forceSaveJobEventConflict = this.showConflictWarning ? true : false;

    this.salaryLineService.updateSalaryLine(this.request).subscribe({

      next: (response) => {

        if(response?.success) {

          this.messageService.add({
            severity: 'success',
            summary: this.translateService.instant('SALARY_LINE_TITLE'),
            detail: this.translateService.instant('SALARY_LINE_UPDATED_SUCCESS'),
            life: 3000,
          });

          this.close({revert: false, openUpdateSalaryLineDialog: false});

        } else {
          
          if(response?.message?.startsWith('CONFIRM:')) {
            this.showConflictWarning = true;
          }

          else {
            this.showConflictError = true;
          }

        }


      },

      error: (error) => {}
    
    })

  }

}
