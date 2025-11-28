import { Component, Injector, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalaryCalculationPortalBase } from '../../base/salary-calculation-base/salary-calculation.base';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { PaginatorModule } from 'primeng/paginator';
import { TagModule } from 'primeng/tag';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { takeUntil } from 'rxjs';
import {
  DeadlinesData,
  UploadedDeadlineResponseDto,
} from 'core-ui-salary-calculation-library/src/lib/core/domain/models/Deadlines/deadlines.model';
import { DataNextService } from '../../services/data-next.service';
import { ImportService } from 'core-ui-salary-calculation-library/src/lib/data/repositories/imports/imports-web.repository/imports.service';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { formatDateToDDMMYYYY, formatDateWithTime } from 'core-ui-salary-calculation-library/src/lib/data/shared/helper.function';
import { ProgressLoadingComponent } from "../../shared/progress-loading/progress-loading.component";
@Component({
  selector: 'lib-deadline-periods',
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    FormsModule,
    AccordionModule,
    PaginatorModule,
    TagModule,
    ProgressLoadingComponent
],
  templateUrl: './deadline-periods.component.html',
})
export class DeadlinePeriodsComponent
  extends SalaryCalculationPortalBase
  implements OnInit
{
  deadlinesList: UploadedDeadlineResponseDto[] = [];
  deadlinesAgainstId: DeadlinesData[] = [];
  sortOrder: any = false;
  selectedDeadline: number | null = 0;
  constructor(
    inject: Injector,
    private dataNextService: DataNextService,
    private importService: ImportService
  ) {
    super(inject);
  }

  ngOnInit() {
    // this.deadlines$?.subscribe((data) => {
    //   this.deadlinesList = data;
    // })

    // this.deadlinesAgainstId$?.subscribe((data) => {
    //   this.deadlinesAgainstId = data;
    // })
    this.getDeadlines();

    this.dataNextService.getNewDeadlinesData.subscribe((x) => {
      if (x === true) {
        this.getDeadlines();
      }
    });
  }

  stopProp(e: any) {
    e.stopPropagation();
    e.preventDefault();
  }

  sortData(column: keyof DeadlinesData, object: UploadedDeadlineResponseDto) {
    this.sortOrder = !this.sortOrder; // Toggle sorting order

    // this.deadlinesList.sort((a, b) => {
    //   const statusA = Number(a.deadlinesData[0]?.[column] ?? ''); // Convert to number
    //   const statusB = Number(b.deadlinesData[0]?.[column] ?? ''); // Convert to number

    //   if (statusA < statusB) {
    //     return this.sortOrder ? -1 : 1;
    //   }
    //   if (statusA > statusB) {
    //     return this.sortOrder ? 1 : -1;
    //   }
    //   return 0;
    // });
  }

  getDeadlines() {
    try {
      this.importService
        .getDeadlines()
        .pipe(takeUntil(this.destroyer$))
        .subscribe({
          next: (data: any) => {
            this.deadlinesList = data.data;
            this.getDeadlinesData(0);
            this.dataNextService.getDeadlinesSyncComplete.next(true);
          },
          error: (err: any) => {
            this.showError(err);
            this.dataNextService.getDeadlinesSyncComplete.next(true);
          },
        });
    } catch (e: any) {
      let message = 'SOMETHING_WENT_WRONG_TRY_AGAIN';
      if (e?.error) {
        message = e.error.message ? e.error.message : e.error.errors[0];
      }
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('DEADLINE_TITLE'),
        detail: this.translate.instant(message),
        life: 3000,
      });
      this.dataNextService.getDeadlinesSyncComplete.next(true);
    }
  }
  private showError(error: any): void {
    const message = error?.error?.message
      ? error.error.message
      : error?.error?.errors?.[0]
      ? error.error.errors[0]
      : 'SOMETHING_WENT_WRONG_TRY_AGAIN';

    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('DEADLINE_TITLE'),
      detail: this.translate.instant(message),
      life: 3000,
    });
  }
  getDeadlinesData(index: number) {
    this.selectedDeadline = index;
    const id = this.deadlinesList[index].id;
    try {
      this.importService
        .getDeadlinesAgainstId(id)
        .pipe(takeUntil(this.destroyer$))
        .subscribe({
          next: (data: any) => {
            // this.getDeadlinesData(0);
            this.deadlinesAgainstId = data.data;
          },
          error: (err: any) => this.showError(err),
        });
    } catch (e: any) {
      let message = 'SOMETHING_WENT_WRONG_TRY_AGAIN';
      if (e?.error) {
        message = e.error.message ? e.error.message : e.error.errors[0];
      }
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('DEADLINE_TITLE'),
        detail: this.translate.instant(message),
        life: 3000,
      });
    }
  }

  openMenu(event: MouseEvent, menuRef: Menu) {
    this.stopProp(event);
    menuRef.toggle(event);
  }

 stopPropagation(e: any) {
    e.stopPropagation();
    e.preventDefault();
  }

  getDeadlineMenus(item: UploadedDeadlineResponseDto): MenuItem[] {
    return [
      {
        label: 'Delete',
        command: () => this.deleteDeadlineModal(item),
        styleClass: 'text-danger',
      },
    ];
  }

  deleteDeadlineModal(deadline: UploadedDeadlineResponseDto, event?: any) {
    this.stopPropagation(event);
    const ref = this.dialogService.open(ConfirmationDialogComponent, {
      header: 'Delete Deadline Period',
      styleClass: 'p-dialog-danger p-dialog-draggable dialog-accent',
      dismissableMask: true,
      closable: true,
      modal: true,
      draggable: true,
      data: {
        messages: [
          'The selected deadline period will be removed permanently.',
          'Deadline period:',
          deadline.fileName,
        ],
      },
    });
    ref.onClose.subscribe((flag: boolean) => {
      if (flag) {
        this.importService
          .deleteDeadlinesAgainstId(deadline.id)
          .pipe(takeUntil(this.destroyer$))
          .subscribe({
            next: (data: any) => {
              const isDeleted = data?.data;
              this.messageService.clear();

              if (isDeleted) {
                this.messageService.add({
                  severity: 'success',
                  summary: this.translate.instant('DEADLINE_TITLE'),
                  detail: this.translate.instant('DEADLINE_DELETED_SUCCESS'),
                });
                this.getDeadlines();
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: this.translate.instant('DEADLINE_TITLE'),
                  detail: this.translate.instant('SOMETHING_WENT_WRONG_TRY_AGAIN'),
                  life: 3000,
                });
              }
            },
            error: (err) => {
              this.messageService.clear();
              this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('DEADLINE_TITLE'),
                detail: err.message,
              });
            },
          });
      }
    });
  }
formateDateTime(date: Date | null | undefined, separator: string = '-'): string | undefined {
    return formatDateWithTime(date, separator);
  }
formateDateOnly(date: Date | null | undefined, separator: string = '-'): string | undefined {
    return formatDateToDDMMYYYY(date, separator);
  }

  formatTimeHHMM(time: string) {
    return time ? time.substring(0, 5) : '';
  }

  onAccordionClose(index: any) {
    this.selectedDeadline = null;
  }
}
