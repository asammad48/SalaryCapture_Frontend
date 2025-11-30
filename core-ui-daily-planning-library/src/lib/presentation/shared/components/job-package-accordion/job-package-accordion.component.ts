import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { JobPackageDetail, ManualJobsDetails } from './package-detail-data';
import {
  CdkDragDrop,
  CdkDropList,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DropListConnectorService } from '../../services/job-drop-list-connector.service';
import {
  GetJobPackagesV1ResponseDto,
  VehicleDto,
  PackageResponseDto,
  ModifyPackageJobsRequestDto,
  JobSourceType,
  AssignVehicleToJobPackageRequestDto,
  AssignUnAssignWorkerFromPackageRequestDto,
  EditJobPackageRequest
} from '../../../../data/api-clients/daily-planning-api.client';
import { ProgressLoadingComponent } from "../progress-loading/progress-loading.component";
import { FormsModule } from '@angular/forms';
import { Tooltip } from 'primeng/tooltip';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { JobPackageMapComponent } from '../job-package-map/job-package-map.component';
import { PlanningMode } from '../../../../core/domain/constants/planning-mode.enum';

@Component({
  standalone: true,
  selector: 'app-job-package-accordion',
  templateUrl: './job-package-accordion.component.html',
  imports: [
    AccordionModule,
    CommonModule,
    SelectModule,
    DragDropModule,
    ScrollingModule,
    CdkDropList,
    ProgressLoadingComponent,
    FormsModule,
    Tooltip,
    Menu,
    Paginator,
    JobPackageMapComponent
  ],
})
export class JobPackageAccordionComponent implements AfterViewInit {

  @Input() isDailyPlanReadMode: boolean = false;
  @Input() isDailyPlanEditMode: boolean = false
  @Input() planningMode: PlanningMode = PlanningMode.BasePlan;

  @ViewChildren(JobPackageMapComponent) packageMaps!: QueryList<JobPackageMapComponent>;
  @Output() setFilteredRecords = new EventEmitter<number>();

  @Input() isLoadingJobPackages: boolean = false;

  @Input() set jobPackagesData(value: GetJobPackagesV1ResponseDto[]) {
    this._allJobPackages = value || [];
    this.searchQuery = '';
    this.applySorting(true);
    this.applySearchAndPagination();
    this.scrollToJobPackageIfNeeded(this.scrollToJobPackageId);
  }
  
  @Input() packageDetailsMap: Map<string, PackageResponseDto> = new Map();
  get jobPackagesData(): GetJobPackagesV1ResponseDto[] {
    return this._allJobPackages;
  }

  searchQuery: string = '';

  @Input() planId?: string;
  @Input() currentDayOfWeek?: string;
  @Input() currentAreaId?: string;
  @Output() accordionOpened = new EventEmitter<string>();
  @Output() jobModified = new EventEmitter<ModifyPackageJobsRequestDto>();
  @Output() assignVehicle = new EventEmitter<AssignVehicleToJobPackageRequestDto>();
  @Output() assignWorker = new EventEmitter<AssignUnAssignWorkerFromPackageRequestDto>();
  @Output() unAssignWorker = new EventEmitter<GetJobPackagesV1ResponseDto>();
  @Output() editJobPackage = new EventEmitter<EditJobPackageRequest>();
  @Output() deleteJobPackageEvent = new EventEmitter<GetJobPackagesV1ResponseDto>();

  @ViewChildren('assignedJobsList') assignedJobsList!: QueryList<CdkDropList>;
  @ViewChildren('manualJobsList') manualJobsList!: QueryList<CdkDropList>;
  @ViewChildren('jobPackagesList') jobPackagesList!: QueryList<CdkDropList>;
  
  selectedVehicles: VehicleDto[] = [];
  workerJobPackageDetails = JobPackageDetail;
  manualJobs = ManualJobsDetails;
  jobAccodionActiveIndex: number[] = [];
  ActivePlanAccordion: number = -1; // Single package ID
  emptyJobsList: any[] = [];

  affectedJobPackageIds: string[] = [];
  scrollToJobPackageId: string | undefined;

  @Input() vehicles: VehicleDto[] = [];
  maxTagsToShow = 3;
  jobPackageMenuItems: MenuItem[] = [];

  // Pagination & Search properties
  private _allJobPackages: GetJobPackagesV1ResponseDto[] = [];
  filteredJobPackages: GetJobPackagesV1ResponseDto[] = [];
  paginatedJobPackages: GetJobPackagesV1ResponseDto[] = [];
  pageSize: number = 20;
  first: number = 0;
  currentPage: number = 0;
  isDraggingAssignLastItem = false;
  lastOpenedMenu: Menu | null = null;

  constructor(private dropListConnector: DropListConnectorService) {}

  ngAfterViewInit(): void {

    this.jobPackagesList.changes.subscribe(() => {
      this.setupJobPackageConnetion();
    });

  }

  // Search functionality
  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.first = 0;
    this.currentPage = 0;
    this.applySearchAndPagination(query);
  }

  applySorting(asc: boolean): void {

    if (!this._allJobPackages || this._allJobPackages.length === 0) return;

    const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });

    this._allJobPackages.sort((a, b) => {
      const aKey = (a.heading || a.name || '').toString();
      const bKey = (b.heading || b.name || '').toString();
      const comparison = collator.compare(aKey, bKey);
      return asc ? comparison : -comparison;
    });

    this.applySearchAndPagination(this.searchQuery);
  }

  private applySearchAndPagination(searchQuery: string = ''): void {

    // Apply search filter
    if (searchQuery) {
      this.filteredJobPackages = this.searchJobPackages(this._allJobPackages, searchQuery);

    } else {
      this.filteredJobPackages = [...this._allJobPackages];
    }

    // Apply pagination
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedJobPackages = this.filteredJobPackages.slice(startIndex, endIndex);

    // Emit total count for parent component
    this.setFilteredRecords.emit(this.filteredJobPackages.length);
  }

  private scrollToJobPackageIfNeeded(packageId : string | undefined): void {
    if(!this.scrollToJobPackageId) return;
    this.scrollToJobPackageId = undefined;
    this.scrollToAndOpenPackage(packageId);
  }

  private searchJobPackages(packages: GetJobPackagesV1ResponseDto[], query: string): GetJobPackagesV1ResponseDto[] {

    if (!query) return packages;

    const lowerQuery = query.toLowerCase()?.trim();

    return packages.filter(pkg => {

      // Search in package heading
      if (pkg.heading?.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Search in package description
      if (pkg.description?.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Search in worker details
      if (pkg.worker) {
        const firstName = pkg.worker.firstName?.toLowerCase()?.trim() || '';
        const lastName = pkg.worker.lastName?.toLowerCase()?.trim() || '';
        const workerId = pkg.worker.workerId?.toString().toLowerCase()?.trim() || '';

        if (
          firstName.includes(lowerQuery) ||
          lastName.includes(lowerQuery) ||
          workerId.includes(lowerQuery) 
        ) {
          return true;
        }
      }

      // Search in tags
      if (pkg.tags?.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Search in package ID
      if (pkg.id?.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      return false;

    });

  }

  onPageChange(event: PaginatorState): void {
    this.first = event.first || 0;
    this.currentPage = event.page || 0;
    this.pageSize = event.rows || 10;
    this.applySearchAndPagination();
  }

  // Clear search
  clearSearch(): void {
    this.first = 0;
    this.currentPage = 0;
    this.applySearchAndPagination('');
  }

  onAccordionOpenEvent(event: any, packageId: string | undefined = undefined): void {

    const openedIndex = event.index;

    const resolvedPackageId = packageId ?? this.paginatedJobPackages[openedIndex]?.id;

    if (resolvedPackageId) {
      this.onAccordionOpen(resolvedPackageId);
    }
  }

  onAccordionOpen(packageId: string): void {
    // Emit event to parent to load package details
    this.accordionOpened.emit(packageId);
    // Defer drop list connection to next tick for immediate setup
    setTimeout(() => {
      this.setupDropConnection();
    }, 200);
  }

  getPackageDetails(packageId: string): PackageResponseDto | undefined {
    return this.packageDetailsMap.get(packageId);
  }

  setupJobPackageConnetion() {
    this.jobPackagesList.forEach((list) =>
      this.dropListConnector.register(list, 'worker')
    );
  }

  setupDropConnection() {
    // Register all drop lists
    this.assignedJobsList.forEach((list) =>
      this.dropListConnector.register(list, 'job')
    );
    this.manualJobsList.forEach((list) =>
      this.dropListConnector.register(list, 'job')
    );

    // Connect all lists together
    // this.jobDropListConnector.connectAll();
  }

  onVehicleChange(event: SelectChangeEvent, index: number) {

    if (!this.isActionAllowed()) return;

    this.selectedVehicles[index] = event.value;

    const packageId = this._allJobPackages[index].id;
    
    if(!packageId) return;

    const defaultPackageId = this.packageDetailsMap.get(packageId)?.otherJobs?.[0]?.id;

    this.assignVehicle.emit(
      new AssignVehicleToJobPackageRequestDto({
        packageId: defaultPackageId,
        vehicleId: event.value.id,
      })
    );
  }

  dropAssignedJobs(event: CdkDragDrop<any[]>) {

    if (!this.isActionAllowed()) return;

    const packageId = this.getPackageIdFromContainerId(event.container.id);

    if (event.previousContainer === event.container) {
      // Reordering within default jobs
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.handleReorder(event, packageId, JobSourceType._0);
    } else {
      // Moving between different lists
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.handleJobTransfer(event, packageId);
    }
  }

  dropManualJobs(event: CdkDragDrop<any[]>) {

    if (!this.isActionAllowed()) return;

    const packageId = this.getPackageIdFromContainerId(event.container.id);

    if (event.previousContainer === event.container) {
      // Reordering within child packages (other jobs)
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.handleReorder(event, packageId, JobSourceType._1);
    } else {
      // Moving between different lists
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.handleJobTransfer(event, packageId);
    }
  }

  private handleReorder(event: CdkDragDrop<any[]>, packageId: string, jobType: JobSourceType) {
    // Don't call API if dropped at the same position
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    const item = event.container.data[event.currentIndex];

    // Get job ID based on type
    let jobId: string;
    if (jobType === JobSourceType._0) {
      // DefaultJobs - item is a PackageAssignedJob
      jobId = item.id;
    } else {
      // ChildPackage - item is a PackageResponseDto with defaultJobs array
      jobId = item.defaultJobs?.[0]?.id || item.id;
    }

    const request = new ModifyPackageJobsRequestDto({
      planId: this.planId,
      sourcePackageId: packageId,
      targetPackageId: packageId,
      jobId: jobId,
      sourceType: jobType,
      targetType: jobType,
      sourceIndex: event.previousIndex,
      targetIndex: event.currentIndex,
      dayOfWeek: this.currentDayOfWeek,
      organizationUnitId: this.currentAreaId,
      isReorder: true
    });

    this.jobModified.emit(request);
  }

  private handleJobTransfer(event: CdkDragDrop<any[]>, packageId: string) {
    const sourceContainerId = event.previousContainer.id;
    const targetContainerId = event.container.id;
    const draggedItem = event.item.data;

    const source = this.parseContainerId(sourceContainerId);
    const target = this.parseContainerId(targetContainerId);

    // Get the job ID - handle both PackageAssignedJob and PackageResponseDto (child package)
    let jobId: string;
    if (draggedItem.defaultJobs && Array.isArray(draggedItem.defaultJobs)) {
      // It's a PackageResponseDto (child package)
      jobId = draggedItem.defaultJobs[0]?.id || draggedItem.id;
    } else {
      // It's a PackageAssignedJob
      jobId = draggedItem.id;
    }

    // Get vehicle ID from package details
    const packageDetails = this.getPackageDetails(packageId);
    const vehicleId = packageDetails?.vehicle?.id;

    const request = new ModifyPackageJobsRequestDto({
      planId: this.planId,
      sourcePackageId: source.packageId,
      targetPackageId: target.packageId || packageId,
      jobId: jobId,
      sourceType: source.type,
      targetType: target.type,
      sourceIndex: event.previousIndex,
      targetIndex: event.currentIndex,
      vehicleId: vehicleId,
      dayOfWeek: this.currentDayOfWeek,
      organizationUnitId: this.currentAreaId,
      isReorder: false
    });

    this.jobModified.emit(request);
  }

  private getPackageIdFromContainerId(containerId: string): string {
    return containerId.replace('assigned-', '').replace('manual-', '').replace('worker-', '');
  }

  private parseContainerId(containerId: string): { type: JobSourceType, packageId?: string } {
    if (containerId.startsWith('assigned-')) {
      return {
        type: JobSourceType._0,
        packageId: containerId.replace('assigned-', '')
      };
    } else if (containerId.startsWith('manual-')) {
      return {
        type: JobSourceType._1,
        packageId: containerId.replace('manual-', '')
      };
    } else if (containerId === 'unassigned') {
      return {
        type: JobSourceType._2,
        packageId: undefined
      };
    }
    return { type: JobSourceType._0 };
  }

  getSelectedVehicle(i: number) {
    return (
      this.selectedVehicles[i] || this.vehicles.find(v => v.typeName === 'Walk')
    );
  }

  stopEvent(e: Event) {
    e.stopPropagation();
    e.preventDefault();
  }

  getIconForVehicleType(typeName: string): string {
    const vehicleIconMapping: { [key: string]: string } = {
      Walk: 'fa-person-walking',
      Bike: 'fa-bicycle',
      'Electric bicycle': 'fa-bicycle',
      'Scooter 30': 'fa-motorcycle',
      'Scooter 45': 'fa-motorcycle',
      Kyburz: 'fa-motorcycle',
      Paxster: 'fa-car-side',
      'Passenger Car': 'fa-car',
      'Small Van': 'fa-van-shuttle',
      'Large Van': 'fa-van-shuttle',
      'DK Truck': 'fa-truck',
    };

    return vehicleIconMapping[typeName.trim()] || 'fa-question-circle';
  }

  onAccordionMenuClick(event: MouseEvent, menu: Menu, jobPackage: GetJobPackagesV1ResponseDto) {
    this.stopEvent(event);
    this.jobPackageMenuItems = this.packageAccordionMenus(jobPackage);
    if (this.lastOpenedMenu && this.lastOpenedMenu !== menu) {
      this.lastOpenedMenu.hide();
    }
    menu.toggle(event);
    this.lastOpenedMenu = menu;
  }

  isActionAllowed(): boolean {

    if (this.planningMode === PlanningMode.BasePlan) {
      return true;
    }

    if (this.planningMode === PlanningMode.DailyPlan) {
      return this.isDailyPlanEditMode;
    }

    return false;
  }

  packageAccordionMenus(jobPackage: GetJobPackagesV1ResponseDto) {
    return [
      {
        label: 'Edit Job Package',
        styleClass: 'list-default fs-14',
        command: () => this.editJobPackage.emit(jobPackage),
        disabled: !this.isActionAllowed()
      },
      {
        visible: jobPackage?.worker !== null && jobPackage?.worker !== undefined,
        label: 'Unassign Service Worker',
        styleClass: 'list-danger fs-14',
        command: () => this.unAssignWorker.emit(jobPackage),
        disabled: !this.isActionAllowed()
      },
      {
        label: 'Delete Job Package',
        styleClass: 'list-danger fs-14',
        command: () => this.deleteJobPackage(jobPackage),
        disabled: !this.isActionAllowed()
      },
    ];
  }

  deleteJobPackage(jobPackage: GetJobPackagesV1ResponseDto) {
    this.deleteJobPackageEvent.emit(jobPackage);
  }

  private capitalizeEachWord(text: string): string {
    return text
      .split(' ')
      .map((w) => (w.length ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w))
      .join(' ');
  }

  private getTagsArray(jobPackage: GetJobPackagesV1ResponseDto): string[] {
    const raw = jobPackage?.tags || '';
    return raw
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => this.capitalizeEachWord(t));
  }

  getVisibleTags(jobPackage: GetJobPackagesV1ResponseDto) {
    return this.getTagsArray(jobPackage).slice(0, this.maxTagsToShow);
  }

  getRemainingTags(jobPackage: GetJobPackagesV1ResponseDto) {
    return this.getTagsArray(jobPackage).slice(this.maxTagsToShow);
  }

  getRemainingTooltipText(jobPackage: GetJobPackagesV1ResponseDto) {
    return this.getRemainingTags(jobPackage).join(', ');
  }

  getTagWidthClass(tag: string): string {
    return tag.length <= 2 ? 'max-w-10' : 'max-w-6';
  }

  dropJobPackage(event: CdkDragDrop<any[]>) {
    
    // If dropped in same container - nothing to do
    if (event.previousContainer === event.container) {
      return;
    }

    // Resolve dragged data: prefer explicit drag data, fall back to previous container's array item
    let dragged = event.item?.data;

    if (!dragged) {
      dragged = event.previousContainer?.data?.[event.previousIndex];
    }

    // Heuristic: if the dragged item looks like a worker, handle assign worker
    const looksLikeWorker = !!dragged && (dragged.firstName !== null || dragged.workerId !== null);

    const containerId = event.container.id;

    const packageId = this.getPackageIdFromContainerId(containerId);

    if (looksLikeWorker) {
      // Update lists for immediate UI feedback
      try {
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
      } catch (e) {
        // ignore transfer errors
      }

      const workerId = dragged.id || dragged.workerId;

      const request = new AssignUnAssignWorkerFromPackageRequestDto({
        packageId: packageId,
        workerId: workerId,
      });

      this.assignWorker.emit(request);
      return;
    }

    // Not a worker - nothing here (jobs handled by other drop handlers)
  }

  assignJobdragStarted(list: any) {
    if (list.length === 1) {
      this.isDraggingAssignLastItem = true;
    }
  }

  assignJobdragEnded() {
    this.isDraggingAssignLastItem = false;
  }

  refreshPackageMap(jobPackage: PackageResponseDto): void {

    const mapComponent = this.packageMaps.find(
      (map) => map.packageDetails?.id === jobPackage.id
    );

    if (mapComponent) {
      mapComponent.refreshMap(jobPackage);
    }

  }

  getPackageStatusClass(jobPackage: GetJobPackagesV1ResponseDto): string {

    if(this.affectedJobPackageIds.includes(jobPackage.id || '')) {
      return 'border-info';
    }

    const hasJobs = jobPackage.jobCount !== null && jobPackage.jobCount !== undefined && jobPackage.jobCount > 0;

    const hasVehicle = jobPackage.vehicle !== null && jobPackage.vehicle !== undefined;

    if (hasJobs && hasVehicle) {
      return 'border-success-500';
    }
    
    return 'border-warning';
  }

  private setPageForIndex(globalIndex: number): void {
    this.currentPage = Math.floor(globalIndex / this.pageSize);
    this.first = this.currentPage * this.pageSize;
    this.applySearchAndPagination();
  }

  scrollToAndOpenPackage(packageId: string | undefined): void {

    if (!packageId) return;

    const globalIndex = this.filteredJobPackages.findIndex(pkg => pkg.id === packageId);

    if (globalIndex === -1) return;

    this.setPageForIndex(globalIndex);

    setTimeout(() => {

      const localIndex = this.paginatedJobPackages.findIndex(pkg => pkg.id === packageId);

      if (localIndex === -1) return;

      this.ActivePlanAccordion = localIndex;      
      this.onAccordionOpenEvent({ index: localIndex }, packageId);

      setTimeout(() => {

        const element = document.getElementById(packageId);

        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

      }, 300);

    }, 100);

  }
  

}
