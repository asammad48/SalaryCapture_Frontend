import { Component, Injector, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FiltersSidebarComponent } from '../../../shared/components/filters-sidebar/filters-sidebar.component';
import { ResourcesSidebarComponent } from '../../../shared/components/resources-sidebar/resources-sidebar.component';
import { JobPackagesHeaderComponent } from '../../../shared/components/job-packages-header/job-packages-header.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { JobPackageAccordionComponent } from "../../../shared/components/job-package-accordion/job-package-accordion.component";
import { DailyPlanningPortalBase } from '../../../base/daily-planning-base/daily-planning.base';
import { PlanningMode } from '../../../../core/domain/constants/planning-mode.enum';
import {
  Client,
  GetJobPackagesV1RequestDto,
  GetJobPackagesStatusEnum,
  GetBasePlanUnassignedJobsRequestDto,
  GetWorkersForBasePlanDto,
  BasePlanServiceWorkerDto,
  BasePlanUnassignedJobsDto,
  CreateJobPackageRequest,
  VehiclesDto,
  EditJobPackageRequest,
  PackageResponseDto,
  ModifyPackageJobsRequestDto,
  JobSourceType,
  AssignVehicleToJobPackageRequestDto,
  AssignUnAssignWorkerFromPackageRequestDto,
  JobPackageResponse,
  DeleteBasePlanJobPackageRequestDto
} from '../../../../data/api-clients/daily-planning-api.client';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { DayOfWeek, JobPackageStatus } from '../../../../core/domain/constants/filters.constants';
import { withLoaderService } from '../../../../core/utils/with-loader.operator';
import { AddEditJobPackageComponent } from '../../../shared/components/add-edit-job-package/add-edit-job-package.component';
import { DialogMode } from '../../../../core/domain/constants/dialog-mode.enum';
import { AddEditJobPackageConfig } from '../../../../core/domain/models/add-edit-job-package/add-edit-job-package-config.model';
import { HttpErrorResponse } from '@angular/common/module.d-CnjH8Dlt';
import { EditJobPackageData } from '../../../../core/domain/models/add-edit-job-package/edit-job-package-data.model';
import { ConfirmationDialogComponent } from '../../../shared/confirmation-dialog/confirmation-dialog.component';
import { FuturePlansDialogComponent, FuturePlansDialogAction, FuturePlansDialogResult } from '../../../shared/future-plans-dialog/future-plans-dialog.component';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { formatDateToDDMMYYYY, toIsoDateOnly } from 'core-ui-admin-library/src/lib/data/shared/helper.function';
import { DateHelper } from 'core-ui-daily-planning-library/src/lib/core/utils/date.helper';

interface JobPackageFilters {
  area: string | null;
  day?: string | null | undefined;
  date?: Date | null;
  status: JobPackageStatus;
}

@Component({
  selector: 'lib-base-plan-job-packages',
  imports: [
    CommonModule,
    FiltersSidebarComponent,
    ResourcesSidebarComponent,
    JobPackagesHeaderComponent,
    ScrollingModule,
    JobPackageAccordionComponent
],
  templateUrl: './base-plan-job-packages.component.html',
})
export class BasePlanJobPackagesComponent extends DailyPlanningPortalBase implements OnInit, OnDestroy {

  @ViewChild(JobPackageAccordionComponent) jobPackageAccordionComponent!: JobPackageAccordionComponent;
  @ViewChild(JobPackagesHeaderComponent) jobPackagesHeaderComponent!: JobPackagesHeaderComponent;

  isLoadingJobPackages: boolean = false;
  jobPackages: JobPackageResponse[] = [];
  unassignedJobs: BasePlanUnassignedJobsDto[] = [];
  serviceWorkers: BasePlanServiceWorkerDto[] = [];
  planId?: string | undefined;
  currentSortBy = 0;
  lastFilters: JobPackageFilters | null = null;

  vehicles: VehiclesDto[] = [];
  packageDetailsMap: Map<string, PackageResponseDto> = new Map();

  // Expose PlanningMode enum to template
  PlanningMode = PlanningMode;

  filteredRecords: number = 0;

  setFilteredRecords(count: number): void {
    this.filteredRecords = count;
  }

  constructor(injector: Injector, private route: ActivatedRoute, private ngZone: NgZone) {
    super(injector);
        this.isLoadingJobPackages = true;

  }

  onEditJobPackage(jobPackage: EditJobPackageRequest): void {
      this.newJobPackage(DialogMode.Edit, jobPackage);
  }


  newJobPackage(mode: DialogMode, jobPackage?: JobPackageResponse): void {

    const dayName = this.dayOfWeekToString(this.lastFilters?.day || undefined);

    const data: AddEditJobPackageConfig = {
      mode: mode,
      path: PlanningMode.BasePlan,
      dayOfWeek: dayName,
    };

    if(mode === DialogMode.Edit && jobPackage) {

      const jobPackageToEdit : EditJobPackageData = {
        id: jobPackage.id,
        name: jobPackage.name,
        areaId: jobPackage.areaId,
        subAreaId: jobPackage.subAreaId,
        tags: jobPackage.tags || '',
        daysOfWeek: jobPackage.daysOfWeek || []
      };

      data.jobPackage = jobPackageToEdit;

    }

    const headerText = mode === DialogMode.Add ? 'New Job Package' : 'Edit Job Package';

    const ref = this.dialogService.open(AddEditJobPackageComponent, {
      header: headerText,
      styleClass: 'p-dialog-draggable dialog-accent',
      closable: true,
      modal: true,
      draggable: true,

      data: {

          ...data,

          onSubmit: (formData: any) => {
            
            if(mode === DialogMode.Add) {
              this.createJobPackage(formData, ref);

            } else if(mode === DialogMode.Edit) {
              this.updateJobPackage(formData, ref);
            }

          }
        }
    });

  }

  deleteJobPackage(jobPackage: JobPackageResponse){

      const request = new DeleteBasePlanJobPackageRequestDto({
        jobPackageId: jobPackage.id!,
        organizationUnitId: this.lastFilters?.area || undefined,
      });
      
      const ref = this.dialogService.open(ConfirmationDialogComponent, {
          header: 'Delete Job Package',
          styleClass: 'p-dialog-danger p-dialog-draggable dialog-accent',
          dismissableMask: true,
          closable: true,
          modal: true,
          draggable: true,
          focusOnShow:false,
          data: {
            messages: [
              'The following job package will be deleted permanently including all the jobs, vehicle and worker assignments.',
              'Job Package:',
              jobPackage.heading,
              jobPackage.description,
            ],
          },
        });

        ref.onClose.subscribe(async (result: any) => {

          if (result?.confirmed) {
            this.confirmAndApplyToFutureDailyPlans(request, (req) => this.onDeleteJobPackage(req));
          }

        });
  }

  ngOnDestroy(): void {
    this.destroyer$.next(true);
    this.destroyer$.complete();
  }

  ngOnInit(): void {
    // read planId from route params so we can include it in API requests
    this.route.paramMap.pipe(takeUntil(this.destroyer$)).subscribe(paramMap => {
      this.planId = paramMap.get('planId') || undefined;
    });
  }

  onFiltersApplied(filters: JobPackageFilters): void {
    this.lastFilters = filters;
    this.loadJobPackages(filters);
    this.loadUnassignedJobs(filters);
    this.loadServiceWorkers(filters);
    this.loadVehicles();
  }

  onSortToggled(sortValue: number): void {
    this.currentSortBy = sortValue;
    // Sort client-side using the current jobPackages list. 0 = asc, 1 = desc
    const sortDirection = sortValue === 0;
    if(this.jobPackageAccordionComponent) {
      this.jobPackageAccordionComponent.applySorting(sortDirection);
    }
  }

  loadJobPackages(filters: JobPackageFilters | undefined, scrollTo: string = ''): void {

    if(!filters) {
      this.isLoadingJobPackages = false;
      return;
    }

    // Map numeric DayOfWeek enum (e.g. 1) to full name (e.g. 'Monday') expected by API
    const dayName = this.dayOfWeekToString(filters.day || undefined);

    const request = new GetJobPackagesV1RequestDto({
      organizationUnitId: filters.area || undefined,
      dayOfTheWeek: dayName,
      status: filters.status as unknown as GetJobPackagesStatusEnum,
      planId: this.planId,
    });

    this.apiClient.getJobPackagesV1(request)
      .pipe(withLoaderService(this.loaderService, 'LoadingJobPackages'), takeUntil(this.destroyer$))
      .subscribe({

        next: (response) => {
          this.jobPackages = response.data || [];
        },
        error: () => {
          this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('ERROR_TITLE'),
              detail: this.translate.instant('SOMETHING_WENT_WRONG_TRY_AGAIN')
            });
        },
        complete: () => {
          this.isLoadingJobPackages = false;
        }
      });
  }

  private createJobPackage(formData: any, ref: DynamicDialogRef): void {

    const commaSeparatedTags = formData.tags && formData.tags.length > 0 ? formData.tags.join(',') : '';

    const request = new CreateJobPackageRequest();
    request.name = formData.name;
    request.organizationUnitId = formData.organizationUnitId;
    request.daysOfWeek = formData.daysOfWeek;
    request.tags = commaSeparatedTags
    request.basePlanId = this.planId;
    request.dayOfWeek = formData.dayOfWeek;
    request.resetFuturePlans = formData.resetFuturePlans;

    this.apiClient.createNewJobPackage(request)
    .pipe(withLoaderService(this.loaderService, 'Add_Edit_JobPackage'), takeUntil(this.destroyer$))
    .subscribe({
      next: (response) => {

        if (response.success) {

          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('SUCCESS_TITLE'),
            detail: this.translate.instant('JOB_PACKAGE_CREATED_SUCCESS')
          });

          if (this.jobPackageAccordionComponent) {

            const convertDay = (day: string | undefined): number | undefined => {
              return DayOfWeek[day as keyof typeof DayOfWeek];
            };

            const newlyAddedPackage = response.data?.find(pkg => {
              const backendDayNum = convertDay(pkg.dayOfWeek);   // e.g. "Monday" → 1
              return backendDayNum === this.lastFilters?.day;
            });

            if (newlyAddedPackage) {
              this.jobPackageAccordionComponent.scrollToJobPackageId = undefined;
              this.jobPackageAccordionComponent.scrollToJobPackageId = newlyAddedPackage.id!;
              this.jobPackageAccordionComponent.affectedJobPackageIds.push(newlyAddedPackage.id!);
            }

            if(this.lastFilters) {
              this.loadJobPackages(this.lastFilters);
            }
          }

          ref.close({success: true});

        } else {

          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('JOB_PACKAGE_CREATE_TITLE'),
            detail: this.translate.instant('JOB_PACKAGE_CREATED_ERROR')
          });

        }

      },
      error: (error: any) => {
        console.error('Error creating job package:', error);

        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('JOB_PACKAGE_CREATE_TITLE'),
          detail: this.translate.instant('JOB_PACKAGE_CREATED_ERROR')
        });

      }

    });

  }

  private updateJobPackage(formData: any, ref: DynamicDialogRef): void {

    const commaSeparatedTags = formData.tags && formData.tags.length > 0 ? formData.tags.join(',') : '';

    const request = new EditJobPackageRequest();
    request.jobPackageId = formData.id;
    request.name = formData.name;
    request.organizationUnitId = formData.organizationUnitId;
    request.daysOfWeek = formData.daysOfWeek;
    request.tags = commaSeparatedTags;
    request.dayOfWeek = formData.dayOfWeek;
    request.resetFuturePlans = formData.resetFuturePlans;
    
    this.apiClient.editJobPackage(request)
    .pipe(withLoaderService(this.loaderService, 'Add_Edit_JobPackage'), takeUntil(this.destroyer$))
    .subscribe({

      next: (response) => {

        if (response.success) {

          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('SUCCESS_TITLE'),
            detail: this.translate.instant('JOB_PACKAGE_UPDATED_SUCCESS')
          });

          if (this.jobPackageAccordionComponent) {
            this.jobPackageAccordionComponent.scrollToJobPackageId = undefined;
            this.jobPackageAccordionComponent.scrollToJobPackageId = formData.id;
            this.jobPackageAccordionComponent.affectedJobPackageIds.push(formData.id);
          }

          if(this.lastFilters) {
            this.loadJobPackages(this.lastFilters);
          }

          ref.close({success: true});

        } else {

          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('ERROR_TITLE'),
            detail: this.translate.instant('JOB_PACKAGE_UPDATED_ERROR')
          });

        }

      },

      error: (error: any) => {

        console.error('Error updating job package:', error);

        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('ERROR_TITLE'),
          detail: this.translate.instant('JOB_PACKAGE_UPDATED_ERROR')
        });

      }

    });

  }

  private loadUnassignedJobs(filters: JobPackageFilters): void {

    const dayName = this.dayOfWeekToString(filters.day || undefined);

    const request = new GetBasePlanUnassignedJobsRequestDto({
      basePlanId: this.planId,
      organizationUnitId: filters.area || undefined,
      dayOfWeek: dayName,
    });

    this.apiClient.getBasePlanUnassignedJobsV1(request)
      .pipe(takeUntil(this.destroyer$))
      .subscribe({
        next: (response) => {
          this.unassignedJobs = response.data || [];
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('ERROR_TITLE'),
            detail: this.translate.instant('SOMETHING_WENT_WRONG_TRY_AGAIN')
          });
        }
      });
  }

  private loadServiceWorkers(filters: JobPackageFilters): void {
    const request = new GetWorkersForBasePlanDto({
      basePlanId: this.planId,
      organizationUnitId: filters.area || undefined,
    });

    this.apiClient.getBasePlanServiceWorkersV1(request)
      .pipe(takeUntil(this.destroyer$))
      .subscribe({
        next: (response) => {
          this.serviceWorkers = response.data || [];
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('ERROR_TITLE'),
            detail: this.translate.instant('SOMETHING_WENT_WRONG_TRY_AGAIN')
          });
        }
      });
  }

  private loadVehicles(): void {

    if(this.vehicles.length > 0) {
      return;
    }

    this.apiClient.getVehicles().pipe(takeUntil(this.destroyer$)).subscribe({

      next: (response) => {
        this.vehicles = response.data || [];
      },

      error: (error: HttpErrorResponse) => {

        console.error('Error loading vehicles', error);

        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('ERROR_TITLE'),
          detail: this.translate.instant('SOMETHING_WENT_WRONG_TRY_AGAIN')
        });

      }

    });

  }

  loadPackageDetails(packageId: string, refreshMap: boolean = false): void {
    this.apiClient.getPackageDetailsById(packageId)
      .pipe(takeUntil(this.destroyer$))
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.packageDetailsMap.set(packageId, response.data);
            if (refreshMap && this.jobPackageAccordionComponent) {
              this.jobPackageAccordionComponent.refreshPackageMap(response.data);
            }
          }
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('ERROR_TITLE'),
            detail: this.translate.instant('SOMETHING_WENT_WRONG_TRY_AGAIN')
          });
        }
      });
  }

  private shouldReloadAllPackages(request: ModifyPackageJobsRequestDto): boolean {
    // Only reload if job counts changed (moved between packages or to/from unassigned)
    const unassignedJobsAffected = request.sourceType === JobSourceType._2 || request.targetType === JobSourceType._2;
    const movedBetweenPackages = request.sourcePackageId !== request.targetPackageId;
    return unassignedJobsAffected || movedBetweenPackages;
  }

  onJobModified(request: ModifyPackageJobsRequestDto): void {
    this.confirmAndApplyToFutureDailyPlans(request, (req) => this.modifyPackageJobs(req));
  }

  modifyPackageJobs(request: ModifyPackageJobsRequestDto): void {
    this.apiClient.modifyPackageJobs(request)
      .pipe(withLoaderService(this.loaderService, 'ModifyingJobsInPackage'), takeUntil(this.destroyer$))
      .subscribe({
        next: (response) => {
          if (response.data?.success) {

            let translationKey = '';
            const src = request.sourceType;
            const tgt = request.targetType;
            const isReorder = !!request.isReorder;
            if (isReorder && src === JobSourceType._0) {
              translationKey = 'JOB_MOVE_REORDER_ASSIGNED_SUCCESS';
            } else if (isReorder && src === JobSourceType._1) {
              translationKey = 'JOB_MOVE_REORDER_MANUAL_SUCCESS';
            } else if (src === JobSourceType._0 && tgt === JobSourceType._1) {
              translationKey = 'JOB_MOVE_ASSIGNED_TO_MANUAL_SUCCESS';
            } else if (src === JobSourceType._1 && tgt === JobSourceType._0) {
              translationKey = 'JOB_MOVE_MANUAL_TO_ASSIGNED_SUCCESS';
            } else if (src === JobSourceType._2 && tgt === JobSourceType._0) {
              translationKey = 'JOB_MOVE_UNASSIGNED_TO_ASSIGNED_SUCCESS';
            } else if (src === JobSourceType._0 && tgt === JobSourceType._2) {
              translationKey = 'JOB_MOVE_ASSIGNED_TO_UNASSIGNED_SUCCESS';
            } else if (src === JobSourceType._1 && tgt === JobSourceType._2) {
              translationKey = 'JOB_MOVE_MANUAL_TO_UNASSIGNED_SUCCESS';
            } else if (src === JobSourceType._2 && tgt === JobSourceType._1) {
              translationKey = 'JOB_MOVE_UNASSIGNED_TO_MANUAL_SUCCESS';
            } else if (src !== tgt && request.sourcePackageId && request.targetPackageId) {
              translationKey = 'JOB_MOVE_BETWEEN_PACKAGES_SUCCESS';
            } else {
              translationKey = 'JOB_MOVE_GENERIC_SUCCESS';
            }
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('SUCCESS'),
              detail: this.translate.instant(translationKey)
            });

            // Refresh affected packages
            if (request.sourcePackageId) {
              this.loadPackageDetails(request.sourcePackageId, true);
            }
            if (request.targetPackageId && request.targetPackageId !== request.sourcePackageId) {
              this.loadPackageDetails(request.targetPackageId, true);
            }

            // Reload unassigned jobs if affected
            if (request.sourceType === JobSourceType._2 || request.targetType === JobSourceType._2) {
              if (this.lastFilters) {
                this.loadUnassignedJobs(this.lastFilters);
              }
            }

            // Only reload job packages list if needed
            if (this.shouldReloadAllPackages(request) && this.lastFilters) {
              this.loadJobPackages(this.lastFilters);
            }
          } else {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('ERROR_TITLE'),
              detail: response.data?.message || this.translate.instant('SOMETHING_WENT_WRONG_TRY_AGAIN')
            });
          }
        },
        error: (error: any) => {
          console.error('Error modifying package jobs:', error);
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('ERROR_TITLE'),
            detail: this.translate.instant('SOMETHING_WENT_WRONG_TRY_AGAIN')
          });
        }
      });
  }

  dayOfWeekToString(day: string | undefined | DayOfWeek): string {
    if(!day) return '';
    return String(DayOfWeek[day as keyof typeof DayOfWeek]);
  }

  onAssignVehicle(request: AssignVehicleToJobPackageRequestDto): void {
    request.organizationUnitId = this.lastFilters?.area || undefined;
    this.confirmAndApplyToFutureDailyPlans(request, (req) => this.assignVehicleToJobPackage(req));
  }

  assignVehicleToJobPackage(request: AssignVehicleToJobPackageRequestDto): void {

    this.apiClient.assignVehicleToJobPackage(request)
      .pipe(withLoaderService(this.loaderService, 'AssigningVehicle'), takeUntil(this.destroyer$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('SUCCESS'),
              detail: this.translate.instant('VEHICLE_ASSIGNED_SUCCESS')
            });
            // Refresh package details
            this.loadPackageDetails(request.packageId as string);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('ERROR_TITLE'),
              detail: response.message || this.translate.instant('SOMETHING_WENT_WRONG_TRY_AGAIN')
            });
          }
        },
        error: (error: any) => {
          console.error('Error assigning vehicle to job package:', error);
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('ERROR_TITLE'),
            detail: this.translate.instant('SOMETHING_WENT_WRONG_TRY_AGAIN')
          });
        }
      });
  }

  onAssignWorker(request: AssignUnAssignWorkerFromPackageRequestDto): void {

    request.organizationUnitId = this.lastFilters?.area || undefined;
    request.dayOfWeek = this.lastFilters?.day || undefined;

    const jobPackage = this.jobPackages.find(pkg => pkg.id === request.packageId);
    const worker = this.serviceWorkers.find(wkr => wkr.id === request.workerId);

    if (!jobPackage || !worker) {
      return;
    }

    const workerAlreadyAssigned = jobPackage.worker?.id != null;

    if (workerAlreadyAssigned) {

      const workerName = `${worker!.firstName} ${worker.lastName}`;

      const ref = this.dialogService.open(ConfirmationDialogComponent, {
        header: 'Reassign Service Worker',
        styleClass: 'p-dialog-warning p-dialog-draggable dialog-accent',
        dismissableMask: true,
        closable: true,
        modal: true,
        draggable: true,
        focusOnShow: false,
        data: {
          messages: [
            'The job package already has a service worker assigned.',
            'New Worker:',
            workerName,
            worker.workerId ?? '',
          ],
          confirmation: 'Are you sure you want to reassign the service worker for this job package?',
        }
      });

      ref.onClose.subscribe((result: any) => {
        if (result?.confirmed) {
          this.confirmAndApplyToFutureDailyPlans(request, (req) => this.assignUnAssignWorker(req));
        }
      });

    } else {
      this.confirmAndApplyToFutureDailyPlans(request, (req) => this.assignUnAssignWorker(req));
    }
  }

  assignUnAssignWorker(request: AssignUnAssignWorkerFromPackageRequestDto): void {

    const successMessage = request.workerId ? this.translate.instant('WORKER_ASSIGNED_SUCCESS') : this.translate.instant('WORKER_UNASSIGNED_SUCCESS');
    const errorMessage = request.workerId ? this.translate.instant('WORKER_ASSIGNED_ERROR') : this.translate.instant('WORKER_UNASSIGNED_ERROR');

    this.apiClient.assignUnAssignWorkerFromJobPackage(request)
      .pipe(withLoaderService(this.loaderService, 'ModifyingJobsInPackage'), takeUntil(this.destroyer$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('SUCCESS'),
              detail: successMessage
            });

            if (this.lastFilters) {
              this.loadJobPackages(this.lastFilters);
            }

            // Refresh package details
            this.loadPackageDetails(request.packageId as string);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('ERROR_TITLE'),
              detail: errorMessage
            });
          }
        },
        error: (error: any) => {
          console.error('Error assigning worker to job package:', error);
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('ERROR_TITLE'),
            detail: errorMessage
          });
        }
      });

  }

  onUnassignWorker(jobPackage: JobPackageResponse): void {

    const workerName = jobPackage.worker
      ? `${jobPackage.worker.firstName} ${jobPackage.worker.lastName}`
      : 'Unknown Worker';

    const ref = this.dialogService.open(ConfirmationDialogComponent, {
      header: 'Unassign Service Worker',
      styleClass: 'p-dialog-danger p-dialog-draggable dialog-accent',
      dismissableMask: true,
      closable: true,
      modal: true,
      draggable: true,
      focusOnShow: false,
      data: {
        messages: [
          'The following service worker will be unassigned from the job package.',
          'Service Worker:',
          workerName,
          jobPackage.worker?.workerId ?? ''
        ],
      }
    });

    ref.onClose.subscribe((result: any) => {

      if (result?.confirmed) {
        const request = new AssignUnAssignWorkerFromPackageRequestDto({
          packageId: jobPackage.id!,
          workerId: undefined,
          organizationUnitId: this.lastFilters?.area || undefined
        });

        this.confirmAndApplyToFutureDailyPlans(request, (req) => this.assignUnAssignWorker(req));
      }

    });

  }

  onDeleteJobPackage(request: DeleteBasePlanJobPackageRequestDto): void {
    this.apiClient.deleteJobPackage(request)
      .pipe(withLoaderService(this.loaderService, 'DeletingJobPackage'), takeUntil(this.destroyer$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('SUCCESS_TITLE'),
              detail: this.translate.instant('JOB_PACKAGE_DELETED_SUCCESS')
            });
            if (this.lastFilters) {
              this.loadJobPackages(this.lastFilters);
              this.loadUnassignedJobs(this.lastFilters);
            }
          } else {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('ERROR_TITLE'),
              detail: response.message || this.translate.instant('JOB_PACKAGE_DELETED_ERROR')
            });
          }
        },
        error: (error: any) => {
          console.error('Error deleting job package:', error);
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('ERROR_TITLE'),
            detail: this.translate.instant('JOB_PACKAGE_DELETED_ERROR')
          });
        }
      });
  }

  onSearchInputChange(value: string) {

    if (this.jobPackageAccordionComponent) {
      this.jobPackageAccordionComponent.onSearchChange(value);
    }

  }

  confirmAndApplyToFutureDailyPlans<T extends { resetFuturePlans?: boolean; dayOfWeek?: string }>(request: T, callback: (request: T) => void): void {

    const dayName = this.dayOfWeekToString(this.lastFilters?.day || undefined);
    request.dayOfWeek = dayName;

    const tryOpenDialog = () => {

      const ref: DynamicDialogRef | null = this.dialogService.open(FuturePlansDialogComponent, {
        header: 'Existing Daily Plans',
        styleClass: 'p-dialog-warning p-dialog-draggable dialog-accent',
        dismissableMask: true,
        closable: true,
        modal: true,
        draggable: true,
        focusOnShow: false,
        data: {
          messages: [
            `This action will reset the following existing future daily plans for ${dayName} to match the updated base plan.`,
          ],
          confirmation: 'Do you want to apply these changes to future daily plans?'
        }
      });

      if (!ref) {
        // Retry after 50ms until the dialog opens
        setTimeout(tryOpenDialog, 50);
        return;
      }

      ref.onClose.subscribe((result: FuturePlansDialogResult | undefined) => {

        if (!result || result.action === FuturePlansDialogAction.Cancel) {
          return;
        }

        request.resetFuturePlans = result.action === FuturePlansDialogAction.Update;
        callback(request);
      });
      
    };

    tryOpenDialog();
  }


}
