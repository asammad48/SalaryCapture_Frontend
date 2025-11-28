import { Component, Injector, OnDestroy, ViewChild } from '@angular/core';
import { BasePlanListComponent } from './base-plan-list/base-plan-list.component';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { CommonModule } from '@angular/common';
import { NewBasePlanDialogComponent } from './new-base-plan-dialog/new-base-plan-dialog.component';
import { DailyPlanningPortalBase } from '../../base/daily-planning-base/daily-planning.base';
// Removed: import { Client, FileParameter } from '../../../data/api-clients/daily-planning-api.client';
import { takeUntil } from 'rxjs';
import { DateHelper } from '../../../core/utils/date.helper';
import { DialogMode } from '../../../core/domain/constants/dialog-mode.enum';
import { withLoaderService } from '../../../core/utils/with-loader.operator';
import { FileParameter } from '../../../data/api-clients';

@Component({
  standalone: true,
  selector: 'app-base-plan',
  templateUrl: './base-plan.component.html',
  styleUrls: ['./base-plan.component.scss'],
  imports: [BasePlanListComponent, BreadcrumbModule, CommonModule],
})
export class BasePlanComponent extends DailyPlanningPortalBase implements OnDestroy {

  items: { label: string } = { label: 'Base Plans' };

  @ViewChild(BasePlanListComponent) basePlanListComponent!: BasePlanListComponent;

  constructor(injector: Injector) {
    super(injector);
  }

  newBasePlan(): void {

    const ref = this.dialogService.open(NewBasePlanDialogComponent, {
      header: 'New Base Plan',
      styleClass: 'p-dialog-draggable dialog-accent',
      closable: true,
      modal: true,
      focusOnShow: false,
      draggable: true,
      data: {
        mode: DialogMode.Add
      }
    });

    ref.onClose.pipe(takeUntil(this.destroyer$)).subscribe((result: any) => {
      if (result?.success && result?.data) {
        if (result.data.mode === DialogMode.Add) {
          this.createBasePlan(result.data);
        } else if (result.data.mode === DialogMode.Edit) {
          this.editBasePlan(result.data);
        }
      }
    });

  }


  editBasePlan(basePlan: any): void {

    const ref = this.dialogService.open(NewBasePlanDialogComponent, {
      header: this.translate.instant('BASE_PLAN_UPDATE_TITLE'),
      styleClass: 'p-dialog-draggable dialog-accent',
      closable: true,
      modal: true,
      focusOnShow: false,
      draggable: true,
      data: {
        mode: DialogMode.Edit,
        basePlanId: basePlan.id,
        basePlan: basePlan
      }
    });

    ref.onClose.pipe(takeUntil(this.destroyer$)).subscribe((result: { success: boolean; data?: any }) => {

      if (result?.success && result?.data) {

        if (result.data.mode === DialogMode.Add) {
          this.createBasePlan(result.data);

        } else if (result.data.mode === DialogMode.Edit) {
          this.updateBasePlan(result.data);
        }
      }
    });

  }

  private createBasePlan(formData: any): void {

    const fileParameter: FileParameter = {
      data: formData.file,
      fileName: formData.file?.name || ''
    };

    const startDate = DateHelper.toDateOnly(formData.startDate) || undefined;
    const endDate = DateHelper.toDateOnly(formData.endDate) || undefined;

    this.apiClient.addBasePlan(formData.name, startDate, endDate, fileParameter)
      .pipe(withLoaderService(this.loaderService, 'BasePlan_Add_Edit'), takeUntil(this.destroyer$))
      .subscribe({

        next: (response) => {

          if(response.success) {

            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('BASE_PLAN_CREATE_TITLE'),
              detail: this.translate.instant('BASE_PLAN_CREATED_SUCCESS')
            });

          } else {

            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('BASE_PLAN_CREATE_TITLE'),
              detail: this.translate.instant('BASE_PLAN_CREATED_ERROR')
            });

          }

          if (this.basePlanListComponent) {
            this.basePlanListComponent.getBasePlans();
          }

        },

        error: (error: any) => {

          console.error('Error creating base plan:', error);

          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('BASE_PLAN_CREATE_TITLE'),
            detail: this.translate.instant('BASE_PLAN_CREATED_ERROR')
          });

        }

      });

  }

  private updateBasePlan(basePlan: any): void {

    const fileParameter: FileParameter = basePlan.file ? {
      data: basePlan.file,
      fileName: basePlan.file?.name || ''
    } : {
      data: new Blob([]),
      fileName: ''
    };

    const startDate = DateHelper.toDateOnly(basePlan.startDate) || undefined;
    const endDate = DateHelper.toDateOnly(basePlan.endDate) || undefined;

    this.apiClient.editBasePlan(basePlan.id, basePlan.name, startDate, endDate, fileParameter)
      .pipe(withLoaderService(this.loaderService, 'BasePlan_Add_Edit'), takeUntil(this.destroyer$))
      .subscribe({

        next: (response) => {

          if(response.success) {

            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('BASE_PLAN_UPDATE_TITLE'),
              detail: this.translate.instant('BASE_PLAN_UPDATED_SUCCESS')
            });

          } else {

            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('BASE_PLAN_UPDATE_TITLE'),
              detail: this.translate.instant('BASE_PLAN_UPDATED_ERROR')
            });

          }

          if (this.basePlanListComponent) {
            this.basePlanListComponent.getBasePlans();
          }

        },

        error: (error: any) => {

          console.error('Error updating base plan:', error);

          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('BASE_PLAN_UPDATE_TITLE'),
            detail: this.translate.instant('BASE_PLAN_UPDATED_ERROR')
          });

        }

      });

  }

  deleteBasePlan(basePlan: any): void {

    this.apiClient.deleteBasePlan(basePlan.id)
      .pipe(withLoaderService(this.loaderService, 'BasePlan_List'), takeUntil(this.destroyer$))
      .subscribe({

        next: (response) => {

          if(response.success) {

            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('BASE_PLAN_DELETE_TITLE'),
              detail: this.translate.instant('BASE_PLAN_DELETED_SUCCESS')
            });

          } else {

            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('BASE_PLAN_DELETE_TITLE'),
              detail: this.translate.instant('BASE_PLAN_DELETED_ERROR')
            });

          }

          if (this.basePlanListComponent) {
            this.basePlanListComponent.getBasePlans();
          }

        },

        error: (error: any) => {

          console.error('Error deleting base plan:', error);

          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('BASE_PLAN_DELETE_TITLE'),
            detail: this.translate.instant('BASE_PLAN_DELETED_ERROR')
          });

        }

      });

  }

  ngOnDestroy(): void {
    this.destroyer$.next(true);
    this.destroyer$.complete();
  }


}
