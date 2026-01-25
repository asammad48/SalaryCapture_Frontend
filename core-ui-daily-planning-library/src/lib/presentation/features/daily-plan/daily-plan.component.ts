import { DateHelper } from './../../../core/utils/date.helper';
import { Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FiltersSidebarComponent } from '../../shared/components/filters-sidebar/filters-sidebar.component';
import { ResourcesSidebarComponent } from '../../shared/components/resources-sidebar/resources-sidebar.component';
import { JobPackagesHeaderComponent } from '../../shared/components/job-packages-header/job-packages-header.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { JobPackageAccordionComponent } from '../../shared/components/job-package-accordion/job-package-accordion.component';
import { DailyPlanningPortalBase } from '../../base/daily-planning-base/daily-planning.base';
import { PlanningMode } from '../../../core/domain/constants/planning-mode.enum';
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
  GetDailyPlanJobPackagesV1RequestDto,
  GetWorkersForDailyPlanDto,
  ModifyDailyPlanPackageJobsRequestDto,
  ResetDailyPlanRequestDto,
  GetDailyPlanUnassignedJobsRequestDto,
  CreateDailyPlanDto,
  JobPackageResponse
} from '../../../data/api-clients/daily-planning-api.client';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { DayOfWeek, JobPackageStatus } from '../../../core/domain/constants/filters.constants';
import { withLoaderService } from '../../../core/utils/with-loader.operator';
import { AddEditJobPackageComponent } from '../../shared/components/add-edit-job-package/add-edit-job-package.component';
import { DialogMode } from '../../../core/domain/constants/dialog-mode.enum';
import { AddEditJobPackageConfig } from '../../../core/domain/models/add-edit-job-package/add-edit-job-package-config.model';
import { HttpErrorResponse } from '@angular/common/http';
import { EditJobPackageData } from '../../../core/domain/models/add-edit-job-package/edit-job-package-data.model';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { JobPackageFilters } from '../../../core/domain/models/job-package/job-package-filters.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DailyPlanViewMode } from '../../../core/domain/constants/daily-plan/daily-plan-view-mode.enum';

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
  templateUrl: './daily-plan.component.html',
})
export class DailyPlanComponent extends DailyPlanningPortalBase implements OnInit, OnDestroy {

  dailyPlanViewMode: DailyPlanViewMode = DailyPlanViewMode.FUTURE_DATES;

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

  constructor(injector: Injector, private route: ActivatedRoute) {
    super(injector);
    this.isLoadingJobPackages = true;
  }

  onEditJobPackage(jobPackage: EditJobPackageRequest): void {
      this.newJobPackage(DialogMode.Edit, jobPackage);
  }


  newJobPackage(mode: DialogMode, jobPackage?: JobPackageResponse): void {

    if(this.isBasePlanStateEnabled()) return;

    const data: AddEditJobPackageConfig = {
      mode: mode,
      path: PlanningMode.DailyPlan
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

    if(this.isBasePlanStateEnabled()) return;

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

        ref.onClose.subscribe((result: any) => {

          if (result?.confirmed) {
            this.onDeleteJobPackage(jobPackage.id!);
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
    this.loadServiceWorkers(filters);
    this.loadVehicles();
  }

  onSortToggled(sortValue: number): void {
    this.currentSortBy = sortValue;
    // Sort client-side using the current jobPackages list. 0 = asc, 1 = desc
    const sortDirection = sortValue === 0;
    if(this.jobPackageAccordionComponent)
    this.jobPackageAccordionComponent.applySorting(sortDirection);
  }

  loadJobPackages(filters: JobPackageFilters | undefined): void {

    this.isLoadingJobPackages = true;

    if(!filters) {
      this.isLoadingJobPackages = false;
      return;
    }

    const request = new GetDailyPlanJobPackagesV1RequestDto({
      organizationUnitId: filters.area || undefined,
      planDate: filters.date ? DateHelper.toDateOnly(filters.date) : undefined,
      status: filters.status as unknown as GetJobPackagesStatusEnum,
      sortBy: 0
    });

    this.apiClient.getDailyPlanJobPackagesV1(request)
      .pipe(withLoaderService(this.loaderService, 'LoadingJobPackages'), takeUntil(this.destroyer$))
      .subscribe({

        next: (response) => {

          this.jobPackages = response.data || [];

          if (this.jobPackagesHeaderComponent) {
            this.jobPackagesHeaderComponent.searchValue = '';
          }

          const isPrev = this.isBeforeTomorrow(filters.date!);
          const hasPackages = this.jobPackages.length > 0;

          if (isPrev) {

            if (!hasPackages) {
              // Previous date with no daily packages - show base plan (read-only)
              this.dailyPlanViewMode = DailyPlanViewMode.BASE_PLAN_FALLBACK;
              this.isLoadingJobPackages = true;
              this.loadJobPackagesForBasePlan(filters);
            } else {
              // Previous date with daily packages - show daily packages (read-only)
              this.dailyPlanViewMode = DailyPlanViewMode.PREVIOUS_DATES;
              this.isLoadingJobPackages = false;
              this.loadUnassignedJobs(filters);
            }

          } else {

            if (!hasPackages) {
              // Future date with no daily packages - show base plan (read-only)
              this.dailyPlanViewMode = DailyPlanViewMode.BASE_PLAN_FALLBACK;
              this.isLoadingJobPackages = true;
              this.loadJobPackagesForBasePlan(filters);
            } else {
              // Future date with daily packages - show daily packages (editable)
              this.dailyPlanViewMode = DailyPlanViewMode.FUTURE_DATES;
              this.isLoadingJobPackages = false;
              this.loadUnassignedJobs(filters);
            }

          }
        },


        error: () => {
          this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('ERROR_TITLE'),
              detail: this.translate.instant('SOMETHING_WENT_WRONG_TRY_AGAIN')
          });

          this.isLoadingJobPackages = false;
        },

      });
  }

  isBeforeTomorrow(date: Date): boolean {
    return DateHelper.isBeforeTomorrow(date);
  }

  private createJobPackage(formData: any, ref: DynamicDialogRef): void {

    if(this.isBasePlanStateEnabled()) return;

    const commaSeparatedTags = formData.tags && formData.tags.length > 0 ? formData.tags.join(',') : '';

    const request = new CreateJobPackageRequest();
    request.name = formData.name;
    request.organizationUnitId = formData.organizationUnitId;
    request.daysOfWeek = formData.daysOfWeek;
    request.tags = commaSeparatedTags
    request.basePlanId = this.planId;

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

          if(this.lastFilters) {
            this.loadJobPackages(this.lastFilters);
          }

          ref.close({success: true});

        } else {

          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('ERROR_TITLE'),
            detail: this.translate.instant('JOB_PACKAGE_CREATED_ERROR')
          });

        }

      },
      error: (error: any) => {
        console.error('Error creating job package:', error);

        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('ERROR_TITLE'),
          detail: this.translate.instant('JOB_PACKAGE_CREATED_ERROR')
        });

      }

    });

  }

  private updateJobPackage(formData: any, ref: DynamicDialogRef): void {

    if(this.isBasePlanStateEnabled()) return;

    const commaSeparatedTags = formData.tags && formData.tags.length > 0 ? formData.tags.join(',') : '';

    const request = new EditJobPackageRequest();
    request.jobPackageId = formData.id;
    request.name = formData.name;
    request.organizationUnitId = formData.organizationUnitId;
    request.tags = commaSeparatedTags;

    this.apiClient.editDailyJobPackage(request)
    .pipe(withLoaderService(this.loaderService, 'Add_Edit_JobPackage'), takeUntil(this.destroyer$))
    .subscribe({

      next: (response) => {

        if (response.success) {

          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('SUCCESS_TITLE'),
            detail: this.translate.instant('JOB_PACKAGE_UPDATED_SUCCESS')
          });

          if(this.jobPackageAccordionComponent) {
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

    if(this.isBasePlanStateEnabled()) return;

    const request = new GetDailyPlanUnassignedJobsRequestDto({
      organizationUnitId: filters.area || undefined,
      date: filters.date ? DateHelper.toDateOnly(filters.date) : undefined,
    });

    this.apiClient.getDailyPlanUnassignedJobsV1(request)
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

  private loadUnassignedJobsForBasePlan(filters: JobPackageFilters): void {

    if(!this.isBasePlanStateEnabled()) return;

    const request = new GetBasePlanUnassignedJobsRequestDto({
      basePlanId: undefined,
      organizationUnitId: filters.area || undefined,
      dayOfWeek: DateHelper.getDayOfWeekFromDate(filters.date!),
      planDate: filters.date ? DateHelper.toDateOnly(filters.date) : undefined,
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

    const request = new GetWorkersForDailyPlanDto({
      organizationUnitId: filters.area || undefined,
    });

    this.apiClient.getDailyPlanServiceWorkersV1(request)
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

  loadPackageDetails(packageId: string): void {

    // Use daily plan API if we have daily packages (FUTURE_DATES or PREVIOUS_DATES with packages)
    // Use base plan API only when no daily packages exist (BASE_PLAN_FALLBACK mode)
    if(this.isBasePlanFallbackMode) {
      this.loadPackageDetailsForBasePlan(packageId);
      
    } else {
      this.loadPackageDetailsForDailyPlan(packageId);
    }

  }  loadPackageDetailsForDailyPlan(packageId: string): void {
    this.apiClient.getDailyPlanPackageDetailsById(packageId)
    .pipe(takeUntil(this.destroyer$))
    .subscribe({
      next: (response) => {
        if (response.data) {
          this.packageDetailsMap.set(packageId, response.data);
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

    if(this.isBasePlanStateEnabled()) return;

    this.apiClient.modifyDailyPlanPackageJobs(request)
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
              summary: this.translate.instant('SUCCESS_TITLE'),
              detail: this.translate.instant(translationKey)
            });

            // Refresh affected packages
            if (request.sourcePackageId) {
              this.loadPackageDetails(request.sourcePackageId);
            }
            if (request.targetPackageId && request.targetPackageId !== request.sourcePackageId) {
              this.loadPackageDetails(request.targetPackageId);
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

  dayOfWeekToString(day: DayOfWeek): string {
    return DayOfWeek[day];
  }

  onAssignVehicle(request: AssignVehicleToJobPackageRequestDto): void {

    if(this.isBasePlanStateEnabled()) return;

    this.apiClient.assignVehicleToDailyJobPackage(request)
      .pipe(withLoaderService(this.loaderService, 'AssigningVehicle'), takeUntil(this.destroyer$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('SUCCESS_TITLE'),
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

    if(this.isBasePlanStateEnabled()) return;

    const jobPackage = this.jobPackages.find(pkg => pkg.id === request.packageId);
    const worker = this.serviceWorkers.find(wkr => wkr.id === request.workerId);

    if (!jobPackage || !worker) {
      return;
    }

    const workerAlreadyAssigned = jobPackage.worker?.id != null;

    if (workerAlreadyAssigned) {

      const workerName = `${worker!.firstName} ${worker.lastName} (${worker.workerId ?? ''})`;

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
          ],
          confirmation: 'Are you sure you want to reassign the service worker for this job package?'
        }
      });

      ref.onClose.subscribe((result: any) => {
        if (result?.confirmed) {
          this.assignUnAssignWorker(request);
        }
      });

    } else {
      this.assignUnAssignWorker(request);
    }
  }

  assignUnAssignWorker(request: AssignUnAssignWorkerFromPackageRequestDto): void {

    if(this.isBasePlanStateEnabled()) return;

    const successMessage = request.workerId ? this.translate.instant('WORKER_ASSIGNED_SUCCESS') : this.translate.instant('WORKER_UNASSIGNED_SUCCESS');
    const errorMessage = request.workerId ? this.translate.instant('WORKER_ASSIGNED_ERROR') : this.translate.instant('WORKER_UNASSIGNED_ERROR');

    this.apiClient.assignUnAssignWorkerFromDailyJobPackage(request)
      .pipe(withLoaderService(this.loaderService, 'ModifyingJobsInPackage'), takeUntil(this.destroyer$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('SUCCESS_TITLE'),
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

    if(this.isBasePlanStateEnabled()) return;

    const workerName = jobPackage.worker
      ? `${jobPackage.worker.firstName} ${jobPackage.worker.lastName} (${jobPackage.worker.workerId ?? ''})`
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
        ],
      }
    });

    ref.onClose.subscribe((result: any) => {

      if (result?.confirmed) {
        const request = new AssignUnAssignWorkerFromPackageRequestDto({
          packageId: jobPackage.id!,
          workerId: undefined
        });
        this.assignUnAssignWorker(request);
      }

    });

  }

  onDeleteJobPackage(jobPackageId: string): void {

    if(this.isBasePlanStateEnabled()) return;

    this.apiClient.deleteDailyJobPackage(jobPackageId)
      .pipe(withLoaderService(this.loaderService, 'DeletingJobPackage'), takeUntil(this.destroyer$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('JOB_PACKAGE_DELETE_TITLE'),
              detail: this.translate.instant('JOB_PACKAGE_DELETED_SUCCESS')
            });

            if (this.lastFilters) {
              this.loadJobPackages(this.lastFilters);
              this.loadUnassignedJobs(this.lastFilters);
            }

          } else {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('JOB_PACKAGE_DELETE_TITLE'),
              detail: response.message || this.translate.instant('JOB_PACKAGE_DELETED_ERROR')
            });
          }
        },
        error: (error: any) => {
          console.error('Error deleting job package:', error);
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('JOB_PACKAGE_DELETE_TITLE'),
            detail: this.translate.instant('JOB_PACKAGE_DELETED_ERROR')
          });
        }
      });
  }

  onSearchInputChange(value: string): void {

    if (this.jobPackageAccordionComponent) {
      this.jobPackageAccordionComponent.onSearchChange(value);
    }
    
  }

  onDailyPlanReset(filters: JobPackageFilters): void {

    if(this.isBasePlanFallbackMode) return;

    const request = new ResetDailyPlanRequestDto({
      organizationUnitId: filters.area || undefined,
      date: filters.date ? DateHelper.toDateOnly(filters.date) : undefined
    });

    const dateForView = DateHelper.formatDateDDMMYYYY(request.date!);

    const ref = this.dialogService.open(ConfirmDialogComponent, {
      header: 'Reset Daily Plan',
      styleClass: 'p-dialog-danger p-dialog-draggable dialog-accent',
      dismissableMask: true,
      closable: true,
      modal: true,
      draggable: true,
      focusOnShow: false,
      data: {
        messages: [
            `This will remove all job package assignments, vehicle and worker assignments for ${dateForView} and area ${filters.areaName}. This process might take some time`,
          'Are you sure you want to proceed?'
        ],
        onConfirm: (result: any) => {
          if (result?.confirmed) {
            this.resetDailyPlan(request, ref);
          }
        }
      }
    });

  }

  resetDailyPlan(request: ResetDailyPlanRequestDto, dialogRef: any) {

    if(this.isBasePlanFallbackMode) return;

    this.apiClient.resetDailyPlan(request)
      .pipe(withLoaderService(this.loaderService, 'ResettingDailyPlan'), takeUntil(this.destroyer$))
      .subscribe({
        next: (response) => {

          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('SUCCESS_TITLE'),
              detail: this.translate.instant('DAILY_PLAN_RESET_SUCCESS')
            });

            if (this.lastFilters) {
              this.loadJobPackages(this.lastFilters);
              this.loadUnassignedJobs(this.lastFilters);
            }

            dialogRef.close();

          } else {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('ERROR_TITLE'),
              detail: response.message || this.translate.instant('DAILY_PLAN_RESET_ERROR')
            });
          }

        },

        error: (error: any) => {

          console.error('Error resetting daily plan:', error);

          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('ERROR_TITLE'),
            detail: this.translate.instant('DAILY_PLAN_RESET_ERROR')
          });
          
        }
      });

  }

  loadJobPackagesForBasePlan(filters: JobPackageFilters | undefined, scrollTo: string = ''): void {

      if(!filters) {
        this.isLoadingJobPackages = false;
        return;
      }

      const dayOfTheWeek = DateHelper.getDayOfWeekFromDate(filters.date);

      const request = new GetJobPackagesV1RequestDto({
        organizationUnitId: filters.area || undefined,
        dayOfTheWeek: dayOfTheWeek,
        status: filters.status as unknown as GetJobPackagesStatusEnum,
        planId: undefined,
        planDate: filters.date ? DateHelper.toDateOnly(filters.date) : undefined,
      });

      this.apiClient.getJobPackagesV1(request)
        .pipe(withLoaderService(this.loaderService, 'LoadingJobPackages'), takeUntil(this.destroyer$))
        .subscribe({

          next: (response) => {
            this.jobPackages = response.data || [];
            this.loadUnassignedJobsForBasePlan(filters);
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

  createDailyPlan(filters: JobPackageFilters): void {

    const ref = this.dialogService.open(ConfirmDialogComponent, {
      header: 'Create Daily Plan from Base Plan',
      styleClass: 'p-dialog-warning p-dialog-draggable',
      dismissableMask: true,
      closable: true,
      modal: true,
      draggable: true,
      focusOnShow: false,
      data: {
        messages: [
            `Do you really want to create a daily plan from the base plan for the selected date ${DateHelper.formatDateDDMMYYYY(filters.date!)} and area ${filters.areaName}?`
        ],
        onConfirm: (result: any) => {
          if (result?.confirmed) {
            this.createDailyPlanFromBasePlan(filters, ref);
          }
        }
      }
    });

  }

  createDailyPlanFromBasePlan(filters: JobPackageFilters, dialogRef: any): void {

    const request = new CreateDailyPlanDto({
      organizationUnitId: filters.area || undefined,
      planDate: filters.date ? DateHelper.toDateOnly(filters.date) : undefined,
    });

    this.apiClient.createDailyPlan(request).pipe(
      withLoaderService(this.loaderService, 'ResettingDailyPlan'),
      takeUntil(this.destroyer$)
    ).subscribe({

      next: (response) => {

        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('SUCCESS_TITLE'),
            detail: this.translate.instant('DAILY_PLAN_CREATED_FROM_BASE_PLAN_SUCCESS')
          });
        }

        if(this.lastFilters) {
          this.loadJobPackages(this.lastFilters);
        }

        dialogRef.close();
      },

      error: (error: any) => {
        console.error('Error creating daily plan from base plan:', error);
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('ERROR_TITLE'),
          detail: this.translate.instant('DAILY_PLAN_CREATED_FROM_BASE_PLAN_ERROR')
        });
      }

    });

  }

  loadPackageDetailsForBasePlan(packageId: string, refreshMap: boolean = false): void {

    if(!this.isBasePlanStateEnabled()) return;

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

  get isBasePlanFallbackMode(): boolean {
    return this.dailyPlanViewMode === DailyPlanViewMode.BASE_PLAN_FALLBACK;
  }

  get isFutureDatesMode(): boolean {
    return this.dailyPlanViewMode === DailyPlanViewMode.FUTURE_DATES;
  }

  get isPreviousDatesMode(): boolean {
    return this.dailyPlanViewMode === DailyPlanViewMode.PREVIOUS_DATES;
  }

  isBasePlanStateEnabled(): boolean {
    // Block editing when:
    // - BASE_PLAN_FALLBACK mode: No daily packages exist (showing base plan)
    // - PREVIOUS_DATES mode: Daily packages exist but date is in the past (read-only)
    return this.isBasePlanFallbackMode || this.isPreviousDatesMode;
  }

}
