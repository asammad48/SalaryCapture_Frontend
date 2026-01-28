import { Component, Injector, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { Permissions } from '../../../core/domain/constants/claims.constants';
import { TabViewModule } from 'primeng/tabview';
import { AccordionModule } from 'primeng/accordion';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppPortalBase } from '../../base/app-base/app.base';
import { takeUntil } from 'rxjs';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { LastSync } from '../../../core/domain/models';
import { Imports } from '../../../core/domain/enums/Imports';
import { CheckboxModule } from 'primeng/checkbox';
import { FileUploadModule } from 'primeng/fileupload';
import { DeadlinePeriodsComponent } from '../deadline-periods/deadline-periods.component';
import { UploadDeadlinePeriodComponent } from '../deadline-periods/upload-deadline-period/upload-deadline-period.component';
import { DataNextService } from '../../services/data-next.service';
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { ImportService } from 'core-ui-admin-library/src/lib/data/repositories/imports/imports-web.repository/imports.service';
import { formatDateWithTime } from 'core-ui-admin-library/src/lib/data/shared/helper.function';
import { ProgressLoadingComponent } from '../../shared/progress-loading/progress-loading.component';
import { Client as AdminApiClient } from 'core-ui-admin-library/src/lib/data/api-clients/admin-api.client';
import { mapLastSyncDto } from 'core-ui-admin-library/src/lib/core/mappers';

@Component({
  selector: 'lib-syncing',
  standalone: true,
  imports: [
    CommonModule,
    CheckboxModule,
    FileUploadModule,
    BreadcrumbModule,
    TabViewModule,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DeadlinePeriodsComponent,
    TabsModule,
    ButtonModule,
    ProgressLoadingComponent,
  ],
  templateUrl: './syncing.component.html',
})
export class SyncingComponent extends AppPortalBase implements OnInit {
  Permissions = Permissions;

  activeIndex = 0;
  items: MenuItem[] = [];
  home: MenuItem | undefined;
  value: number = 0;
  isDeadlinesSyncing = false;

  serviceWorkerSyncTime!: LastSync | undefined;
  usersSyncing!: LastSync | undefined;
  vehiclesSyncing!: LastSync | undefined;
  activeAccordionIds: Set<string> = new Set('0');
  constructor(
    inject: Injector,
    private dataNextService: DataNextService,
    private importService: ImportService,
    private adminApiClient: AdminApiClient,
  ) {
    super(inject);
  }

  ngOnInit() {
    this.items = [{ label: 'Settings' }];
    this.home = { label: 'Daily Planning Portal', routerLink: '' };
    this.getLastSyncTime();
    this.checkUserAreaRole();
  }
  ngAfterViewInit() {
    this.browseButtonListener();
  }

  checkUserAreaRole() {
    this.checkUserAreaAccess();
  }

  moveIndex(index: number) {
    this.activeIndex = index;
  }

  moveToNextTab(event: any) {
    if (event) {
      switch (this.activeIndex) {
        case 0:
          this.activeIndex = 1;
          break;
        case 1:
          this.activeIndex = 2;
          break;
      }
    }
  }

  syncWorkers() {
    const ref = this.dialogService.open(ConfirmationDialogComponent, {
      header: 'Sync Workers',
      dismissableMask: true,
      closable: true,
      modal: true,
      styleClass: 'p-dialog-draggable dialog-accent',
      draggable: true,
      data: {
        messages: [
          'The workers will be synchronised.',
          'Last synced on:',
          formatDateWithTime(this.serviceWorkerSyncTime?.syncTime),
          `${this.serviceWorkerSyncTime?.count} new records updated`,
        ],
      },
    });

    ref.onClose.subscribe((result: any) => {
      if (result.confirmed) {
        this.adminApiClient
          .syncServiceWorkers()
          .pipe(takeUntil(this.destroyer$))
          .subscribe({
            next: (data: any) => {
              const isSynced = data?.data;
              if (isSynced) {
                this.messageService.clear();
                this.messageService.add({
                  severity: 'success',
                  summary: this.translate.instant('ELIGA_WORKERS_SYNCED_TITLE'),
                  detail: this.translate.instant(
                    'ELIGA_WORKERS_SYNCED_SUCCESSFULLY',
                  ),
                });
                this.getLastSyncTime();
              } else {
                this.messageService.clear();
                this.messageService.add({
                  severity: 'error',
                  summary: this.translate.instant('ELIGA_WORKERS_SYNCED_TITLE'),
                  detail: this.translate.instant('ELIGA_WORKERS_SYNCED_ERROR'),
                });
              }
            },
            error: (err) => {
              this.messageService.clear();
              this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('ELIGA_WORKERS_SYNCED_TITLE'),
                detail: this.translate.instant('ELIGA_USERS_SYNCED_ERROR'),
              });
            },
          });
      }
    });
  }

  formateDateTime(
    date: Date | null | undefined,
    separator: string = '-',
  ): string | undefined {
    return formatDateWithTime(date, separator);
  }

  syncUsers(): void {
    const ref = this.dialogService.open(ConfirmationDialogComponent, {
      header: 'Sync Users',
      dismissableMask: true,
      closable: true,
      modal: true,
      styleClass: 'p-dialog-draggable dialog-accent',
      draggable: true,
      data: {
        messages: [
          'The users will be synchronised.',
          'Last synced on:',
          formatDateWithTime(this.usersSyncing?.syncTime),
          `${this.usersSyncing?.count} new records updated`,
        ],
      },
    });

    ref.onClose.subscribe((result: any) => {
      if (result.confirmed) {
        this.adminApiClient
          .syncUsers()
          .pipe(takeUntil(this.destroyer$))
          .subscribe({
            next: (data: any) => {
              const isSynced = data?.data;
              if (isSynced) {
                this.messageService.clear();
                this.messageService.add({
                  severity: 'success',
                  summary: this.translate.instant('ELIGA_USERS_SYNCED_TITLE'),
                  detail: this.translate.instant(
                    'ELIGA_USERS_SYNCED_SUCCESSFULLY',
                  ),
                });
                this.getLastSyncTime();
              } else {
                this.messageService.clear();
                this.messageService.add({
                  severity: 'error',
                  summary: this.translate.instant('ELIGA_USERS_SYNCED_TITLE'),
                  detail: this.translate.instant('ELIGA_USERS_SYNCED_ERROR'),
                });
              }
            },
            error: (err) => {
              this.messageService.clear();
              this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('ELIGA_USERS_SYNCED_TITLE'),
                detail: this.translate.instant('ELIGA_USERS_SYNCED_ERROR'),
              });
            },
          });
      }
    });
  }

  syncVehicles(): void {
    const ref = this.dialogService.open(ConfirmationDialogComponent, {
      header: 'Sync Vehicles',
      dismissableMask: true,
      closable: true,
      modal: true,
      styleClass: 'p-dialog-draggable dialog-accent',
      draggable: true,
      data: {
        messages: [
          'The vehicles will be synchronised.',
          'Last synced on:',
          formatDateWithTime(this.vehiclesSyncing?.syncTime),
          `${this.vehiclesSyncing?.count} new records updated`,
        ],
      },
    });

    ref.onClose.subscribe((result: any) => {
      if (result?.confirmed) {
        this.adminApiClient
          .syncVehicles()
          .pipe(takeUntil(this.destroyer$))
          .subscribe({
            next: (data: any) => {
              const isSynced = data?.data;
              if (isSynced) {
                this.messageService.clear();
                this.messageService.add({
                  severity: 'success',
                  summary: this.translate.instant(
                    'ELIGA_VEHICLES_SYNCED_TITLE',
                  ),
                  detail: this.translate.instant(
                    'ELIGA_VEHICLES_SYNCED_SUCCESSFULLY',
                  ),
                });
                this.getLastSyncTime();
              } else {
                this.messageService.clear();
                this.messageService.add({
                  severity: 'error',
                  summary: this.translate.instant(
                    'ELIGA_VEHICLES_SYNCED_TITLE',
                  ),
                  detail: this.translate.instant('ELIGA_VEHICLES_SYNCED_ERROR'),
                });
              }
            },
            error: (err) => {
              this.messageService.clear();
              this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('ELIGA_VEHICLES_SYNCED_TITLE'),
                detail: this.translate.instant('ELIGA_VEHICLES_SYNCED_ERROR'),
              });
            },
          });
      }
    });
  }

  getLastSyncTime(): void {
    this.adminApiClient
      .getLastSyncTime()
      .pipe(takeUntil(this.destroyer$))
      .subscribe({
        next: (data: any) => {
          if (data.success && data.data) {
             this.assignSyncing(data.data.map(mapLastSyncDto));
          }
        },
        error: (err: any) => {
          this.messageService.clear();
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('SYNCING_TITLE'),
            detail: this.translate.instant('SOMETHING_WENT_WRONG_TRY_AGAIN'),
          });
        },
      });
  }

  assignSyncing(data: LastSync[]) {
    data.forEach((item) => {
      if (item?.importType === Imports.ServiceWorkersSyncing) {
        this.serviceWorkerSyncTime = item;
      } else if (item?.importType === Imports.UsersSyncing) {
        this.usersSyncing = item;
      } else if (item?.importType === Imports.VehiclesSyncing) {
        this.vehiclesSyncing = item;
      }
    });
  }

  UploadDeadlinePeriod() {
    const ref = this.dialogService.open(UploadDeadlinePeriodComponent, {
      header: 'Upload Deadline Period',
      dismissableMask: true,
      closable: true,
      modal: true,
      styleClass: 'p-dialog-draggable dialog-accent upload-deadline-dialog',
      draggable: true,
    });
    ref.onClose.subscribe((result: { success: boolean; count: number }) => {
      if (result && result.success === true) {
        this.isDeadlinesSyncing = true;

        this.dataNextService.getNewDeadlinesData.next(true);
        this.dataNextService.getDeadlinesSyncComplete.next(false);

        this.dataNextService.getDeadlinesSyncComplete
          .pipe(takeUntil(this.destroyer$))
          .subscribe((isComplete) => {
            if (isComplete && this.isDeadlinesSyncing) {
              this.isDeadlinesSyncing = false;

              this.messageService.clear();
              this.messageService.add({
                severity: 'success',
                summary: this.translate.instant('DEADLINE_TITLE'),
                detail: this.translate.instant('UPLOAD_DEADLINE_SUCCESS'),
                life: 5000,
              });
            }
          });
      }
    });
  }

  onAccordionOpen(accordion: any) {
    this.activeAccordionIds.add(accordion.index);
  }

  onAccordionClose(accordion: any) {
    this.activeAccordionIds.delete(accordion.index);
  }
}
