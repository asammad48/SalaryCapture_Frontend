import { AfterViewInit, Component, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { WarningBannerComponent } from '../../../shared/warning-banner';
import { MessageService } from 'primeng/api';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ProgressLoadingComponent } from '../../../shared/progress-loading/progress-loading.component';
import { SalaryLineIdsForAction, SalaryLineActionsRequest } from '../../../../core/domain/models/SalaryLine/SalaryLineRequest.model';
import { SalaryLineService } from '../../../../data/repositories/salary-line/salary-line.service';
import { SalaryCaptureFilterRequest } from '../../../../core/domain/models/SalaryLine/salary-capture-filter-request.model';
import { getSalaryLineActionWord, getSalaryLineActionTranslationKey, getSalaryLineActionStatuses } from 'core-ui-salary-calculation-library/src/lib/data/shared/helper.function'

export interface ApproveConflictDialogData {
  messages: string[];
  salaryLinesData: SalaryLineIdsForAction[];
  action: number;
  confirmation?: string;
  salaryCaptureFilterRequest: SalaryCaptureFilterRequest;
  handleExternally?: boolean; // New flag: if true, don't make API call in dialog
  onConfirm?: (forceSaveConflicts: boolean) => void; // Callback for external handling
  hideDetails?: boolean; // New flag: if true, hide worker/salary line details section
}

@Component({
  selector: 'lib-approve-conflict-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, WarningBannerComponent, ProgressLoadingComponent, TranslateModule],
  templateUrl: './approve-conflict-confirmation-dialog.component.html'
})

export class ApproveConflictConfirmationDialogComponent implements AfterViewInit {

  showConflictNoError = false;
  conflictNoErrorMessage = '';
  
  showConflictYesWarning = false;
  conflictYesWarningMessage = '';
  
  confirmation!: string;

  data: ApproveConflictDialogData;
  @ViewChild('confirmBtn') confirmBtn: any;
  private keyPressed: string | null = null;
  private forceSaveConflicts = false;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public messageService: MessageService,
    public translateService: TranslateService,
    private salaryLineService: SalaryLineService
  ) {
    this.data = this.config.data;
    this.confirmation = this.config.data?.confirmation || '';
    this.conflictNoErrorMessage = this.translateService.instant('SALARY_LINE_ACTION_CONFLICTS_CANNOT_PROCEED');
    this.conflictYesWarningMessage = this.translateService.instant('SALARY_LINE_ACTION_CONFLICTS_CONTINUE_CONFIRMATION');
  }

  ngAfterViewInit(): void {
    this.confirmBtn.nativeElement.focus();
  }

  private getSalaryLineActionMessage(action: number, isSuccess: boolean): string {
    const translationKey = getSalaryLineActionTranslationKey(isSuccess);
    
    if (isSuccess) {
      const actionWord = getSalaryLineActionWord(action, isSuccess);
      return this.translateService.instant(translationKey, { value: actionWord });
      
    } else {
      const statuses = getSalaryLineActionStatuses(action);
      return this.translateService.instant(translationKey, { from: statuses.from, to: statuses.to });
    }
  }

  @HostListener('keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.keyPressed = event.key;
    }
  }

  closeModal(isConfirm: boolean): void {
    this.ref.close({
      confirmed: isConfirm,
      key: this.keyPressed
    });
  }

  confirm(): void {

    // If already showing conflict yes warning, set force flag and retry
    if (this.showConflictYesWarning) {
      this.forceSaveConflicts = true;
    }

    // Make the API call
    const salaryLineActionsRequest: SalaryLineActionsRequest = {
      salariesLines: this.data.salaryLinesData,
      actionId: this.data.action,
      ...this.data.salaryCaptureFilterRequest,
      forceSaveConflicts: this.forceSaveConflicts,
    };

    this.salaryLineService
      .SalaryLineActions(salaryLineActionsRequest)
      .subscribe({
        next: (response) => {
          if (response.success) {

            // Success - close dialog and let parent handle refresh
            this.messageService.add({
              severity: 'success',
              summary: this.translateService.instant('SALARY_LINE_TITLE'),
              detail: this.getSalaryLineActionMessage(this.data.action, true),
              life: 3000,
            });

            this.closeModal(true);

          } else {
            // Handle conflicts
            this.handleConflictResponse(response.data);
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'warn',
            summary: this.translateService.instant('SALARY_LINE_TITLE'),
            detail: this.translateService.instant('SOMETHING_WENT_WRONG_TRY_AGAIN'),
            life: 3000,
          });
        }
      });
  }

  private handleConflictResponse(responseData: any): void {

    if (!responseData) {

      this.messageService.add({
        severity: 'warn',
        summary: this.translateService.instant('SALARY_LINE_TITLE'),
        detail: this.getSalaryLineActionMessage(this.data.action, false),
        life: 3000,
      });

      this.closeModal(true);
      return;
    }

    const { allowConflictNo, allowConflictYes, requiresConfirmation, processedCount } = responseData;

    // High priority: allowConflictNo - cannot proceed, show error in dialog
    if (allowConflictNo && allowConflictNo.length > 0) {
      this.showConflictNoError = true;
      return;
    }

    // Low priority: Show warning if requiresConfirmation is true OR allowConflictYes has items
    if (requiresConfirmation || (allowConflictYes && allowConflictYes.length > 0)) {
      this.showConflictYesWarning = true;
      return;
    }

    // No conflicts but processed count available - close only if processedCount > 0
    if (processedCount !== undefined && processedCount > 0) {

      this.messageService.add({
        severity: 'success',
        summary: this.translateService.instant('SALARY_LINE_TITLE'),
        detail: this.getSalaryLineActionMessage(this.data.action, true),
        life: 3000,
      });

      this.closeModal(true);

    } else {
      // No items processed
      this.messageService.add({
        severity: 'warn',
        summary: this.translateService.instant('SALARY_LINE_TITLE'),
        detail: this.getSalaryLineActionMessage(this.data.action, false),
        life: 3000,
      });
    }
  }

  private getSuccessMessageKey(): string {
    switch (this.data.action) {
      case 2: return 'SALARY_LINE_REJECTED_SUCCESS';
      case 3: return 'SALARY_LINE_APPROVED_SUCCESS';
      default: return 'SALARY_LINE_ACTION_SUCCESS';
    }
  }

  private getFailureMessageKey(): string {
    switch (this.data.action) {
      case 2: return 'SALARY_LINE_REJECTED_FAILED';
      case 3: return 'SALARY_LINE_APPROVED_FAILED';
      default: return 'SALARY_LINE_ACTION_FAILED';
    }
  }
}
