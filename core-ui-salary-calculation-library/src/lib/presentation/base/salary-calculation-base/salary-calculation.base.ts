import { AccessService } from 'core-ui-salary-calculation-library/src/lib/data/repositories/access/access.service';
import {
  ElementRef,
  inject,
  Renderer2,
} from '@angular/core';
import { Component, Injector } from '@angular/core';
import { Authorize } from '../../../core/domain/models';
import { Subject, takeUntil, EMPTY, lastValueFrom } from 'rxjs';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DateTime, Duration } from 'luxon';
import { TranslateService } from '@ngx-translate/core';
import {
  ConfirmationService,
  LazyLoadEvent,
  MessageService,
} from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { LocalStorageService } from '../../services/local-storage.service';
import { CurrentUserAreaRoles } from 'core-ui-salary-calculation-library/src/lib/core/domain/models/Access/CurrentUserAreaRoles.model';
import { Area } from 'core-ui-salary-calculation-library/src/lib/core/domain/models/area.model';
import { UsersService } from 'core-ui-salary-calculation-library/src/lib/data/repositories/usersManagement/users.service';
import { LocalStorageKeys } from 'core-ui-salary-calculation-library/src/lib/data/repositories/access/local-storage-keys';

@Component({
    template: '',
    standalone: false
})
export abstract class SalaryCalculationPortalBase {
  public destroyer$: Subject<boolean> = new Subject<boolean>();
  // public store: Store;
  public dialogService: DialogService;
  public messageService: MessageService;
  public translate: TranslateService;
  loaderHandler = false;
  public confirmationService: ConfirmationService;
  public router: Router;
  public dialogRef: DynamicDialogRef | undefined;
  private elref: ElementRef;
  private renderer2: Renderer2;

  public hasAccess = false;
  public userAreasRoles: CurrentUserAreaRoles[] = [];
  public currentUserRole: string | undefined;
  public regions: Area[] = [];
  public subAreas: Area[] = [];


  isFileUploadErr = false;
  protected accessService = inject(AccessService);
  private localStorage = inject(LocalStorageService);
  private userService = inject(UsersService);
  private datePickerKeyListener?: (event: KeyboardEvent) => void;

  protected constructor(injector: Injector){//, private accessService: AccessService, private localStorage: LocalStorageService) {
    this.dialogService = injector.get(DialogService);
    this.confirmationService = injector.get(ConfirmationService);
    this.translate = injector.get(TranslateService);
    this.messageService = injector.get(MessageService);
    this.router = injector.get(Router);
    // this.store = injector.get(Store);
    // this.store
    //   .select(BaseState.loading)
    //   .pipe(debounceTime(300), takeUntil(this.destroyer$))
    //   .subscribe((loaderHandler: LoaderHandler[] | undefined) => {
    //     this.loaderHandler = !!(loaderHandler && loaderHandler?.length > 0);
    //   });
      this.elref = injector.get(ElementRef);
    this.renderer2 = injector.get(Renderer2);
  }

  isDateTime(value: unknown): string | undefined {
    if (value) {
      if (DateTime.isDateTime(value)) {
        return 'DateTime';
      } else if (Duration.isDuration(value)) {
        return 'Duration';
      } else {
        return undefined;
      }
    }
    return '';
  }
  getFilterData(event: LazyLoadEvent, key: string): any | null | undefined {
    return event.filters?.[key] && (event.filters?.[key] as any)[0]?.value
      ? (event.filters?.[key] as any)[0]?.value
      : null;
  }

  // enableLoading(payload: LoaderHandler) {
  //   this.store.dispatch(new EnableLoading(payload));
  // }

  // disableLoading(payload: LoaderHandler) {
  //   this.store.dispatch(new DisableLoading(payload));
  // }

  handleError(err: HttpErrorResponse) {
    let message = 'SOMETHING_WENT_WRONG';
    if (err.error.message) {
      message = err.error.message;
    } else if (err.error.errors && err.error.errors.length > 0) {
      message = err.error.errors.join(', ');
    }
    this.messageService.clear();
    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('ERROR'),
      detail: message,
    });
    return EMPTY;
  }

  checkUserAreaAccess(): void {

  const role = this.localStorage.get<string>(LocalStorageKeys.ROLE);

  if (!role) {
    this.hasAccess = false;
    return;
  }
  this.currentUserRole = role;

  this.accessService.getUserAreaAccess(role)
    .pipe(takeUntil(this.destroyer$))
    .subscribe((access: any) => {
      this.hasAccess = access;
      this.localStorage.add(LocalStorageKeys.HAS_ACCESS, access);
    });
}

async getAreas(): Promise<void> {
    try {
      const response = await lastValueFrom(
        this.accessService.getUserRegions().pipe(
          takeUntil(this.destroyer$)
        )
      );
      this.regions = response;
     this.subAreas = response.flatMap(x => x.subAreas ?? []);
    } catch (error:any) {
      this.handleError(error);
    }
  }
  onInputTime(event: any, formGroup: FormGroup, formControlName: string) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 3) {
      value = value.slice(0, 2) + ':' + value.slice(2, 4);
    }
    event.target.value = value;
    // Validate the time format (HH:MM)
    if (value.length == 5) {
      const [hours, minutes] = value.split(':').map(Number); // Split into hours and minutes
      // Validate hours (00-23) and minutes (00-59)
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        formGroup.get(formControlName)?.setValue(value); // Set valid time in the form control
      }
    }
  }

 browseButtonListener() {
  const chooseButton = this.elref.nativeElement.querySelector(
    '.fileupload-choose'
  );
  if (chooseButton) {
    chooseButton.addEventListener('click', () => {
      this.onFileUploadMouseLeave();
    });

    chooseButton.addEventListener('mouseup', () => {
      setTimeout(() => {
        this.onFileUploadMouseLeave();
      }, 100);
    });
  } else {
    console.warn('fileupload-choose element not found');
  }
}
  getErrorMessage() {
    const errorMessageToast =
      this.elref.nativeElement.querySelector('.p-message-error');
    if (errorMessageToast) {
      this.isFileUploadErr = true;
    } else {
      this.isFileUploadErr = false;
    }
  }
  onFileUploadMouseMove() {
    this.getErrorMessage();
    const closeButton =
      this.elref.nativeElement.querySelector('.p-message-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.isFileUploadErr = false;
      });
    }
    this.onFileUploadMouseEnter();
  }
  onFileUploadMouseEnter() {
    const uploadFilesOutside = this.elref.nativeElement.querySelector(
      '.upload-files-outside'
    );
    if (uploadFilesOutside) {
      this.renderer2.addClass(uploadFilesOutside, 'drop-zone-inactive');
    }
  }
  onFileUploadMouseLeave() {
    const uploadFilesOutside = this.elref.nativeElement.querySelector(
      '.upload-files-outside'
    );
    if (uploadFilesOutside) {
      this.renderer2.removeClass(uploadFilesOutside, 'drop-zone-inactive');
    }
  }

  autoFocusToFilterInput() {
    // wait until overlay transition finishes
    setTimeout(() => {
      const overlays = document.querySelectorAll('.p-multiselect-overlay');
      const lastOverlay = overlays[overlays.length - 1];

      if (!lastOverlay) return;

      const multiselect = document.querySelector('.p-multiselect.p-focus');
      if (multiselect?.classList.contains('p-focus')) {
        multiselect.classList.remove('p-focus');
      }

      const filterInput = lastOverlay.querySelector<HTMLInputElement>('.p-multiselect-filter');
      filterInput?.focus();
    });
  }

  onCalendarShow() {
      setTimeout(() => {
        const overlay = document.querySelector('.p-datepicker-panel') as HTMLElement;
        if (!overlay) return;

        if (this.datePickerKeyListener) {
          overlay.removeEventListener('keydown', this.datePickerKeyListener);
        }

        this.datePickerKeyListener = (event: KeyboardEvent) => {
          if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
            setTimeout(() => {
              const dayCells = overlay.querySelectorAll('.p-datepicker-day-cell span.p-datepicker-day');
              const enabledDays = Array.from(dayCells).filter(
                (day: any) => !day.classList.contains('p-disabled')
              );

              if (enabledDays.length === 0) {
                const targetBtn =
                  event.key === 'ArrowRight' || event.key === 'ArrowDown'
                    ? overlay.querySelector('.p-datepicker-next-button')
                    : overlay.querySelector('.p-datepicker-prev-button');

                (targetBtn as HTMLButtonElement)?.focus();
              }
            }, 10);
          }
        };

        overlay.addEventListener('keydown', this.datePickerKeyListener);
      }, 0);
  }
  onCalendarHide() {
      const overlay = document.querySelector('.p-datepicker-panel') as HTMLElement;
      if (overlay && this.datePickerKeyListener) {
        overlay.removeEventListener('keydown', this.datePickerKeyListener);
        this.datePickerKeyListener = undefined;
      }
  }
}
