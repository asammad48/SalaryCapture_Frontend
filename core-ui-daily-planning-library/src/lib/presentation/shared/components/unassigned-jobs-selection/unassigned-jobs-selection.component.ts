import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
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
import { DropListConnectorService } from '../../services/job-drop-list-connector.service';
import { 
  BasePlanUnassignedJobsDto,
  ModifyPackageJobsRequestDto,
  JobSourceType
} from '../../../../data/api-clients/daily-planning-api.client';
import { PlanningMode } from '../../../../../../../core-ui-daily-planning-library/src/lib/core/domain/constants/planning-mode.enum';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-unassigned-jobs-selection',
  templateUrl: './unassigned-jobs-selection.component.html',
  styleUrls: ['./unassigned-jobs-selection.component.scss'],
  imports: [
    AccordionModule,
    CommonModule,
    DragDropModule,
    ScrollingModule,
    FormsModule
  ],
})
export class UnassignedJobsSelectionComponent implements AfterViewInit {

  @Input() planningMode: PlanningMode = PlanningMode.BasePlan;
  @Input() isActionAllowed: boolean = false;

  constructor(private dropListConnector: DropListConnectorService) {}

  @Input() set unassignedJobs(jobs: BasePlanUnassignedJobsDto[]) {
    this._unassignedJobs = jobs || [];
    this.filteredJobs = [...this._unassignedJobs];
  }
  get unassignedJobs(): BasePlanUnassignedJobsDto[] {
    return this._unassignedJobs;
  }

  @Input() planId?: string;
  @Input() currentDayOfWeek?: string;
  @Input() currentAreaId?: string;

  @Output() jobModified = new EventEmitter<ModifyPackageJobsRequestDto>();

  private _unassignedJobs: BasePlanUnassignedJobsDto[] = [];
  filteredJobs: BasePlanUnassignedJobsDto[] = [];
  isPanelActive = true;
  searchQuery = '';
  isDraggingUnassignLastItem = false;
  @ViewChildren('unassignedJobsList')
  unassignedJobsList!: QueryList<CdkDropList>;

  ngAfterViewInit() {
    setTimeout(() => {
      this.unassignedJobsList.forEach((list) =>
        this.dropListConnector.register(list, 'job')
      );
      // this.jobDropListConnector.connectAll();
    }, 300);
  }

  filterJobs(event: any): void {
    const query = event.query?.toLowerCase() || '';
    this.searchQuery = query;

    if (!query) {
      this.filteredJobs = [...this._unassignedJobs];
      return;
    }

    this.filteredJobs = this._unassignedJobs.filter((job) => {
      const jobNumber = job.jobNumber?.toString().toLowerCase() || '';
      return jobNumber.includes(query);
    });
  }

  onSearchInput(event: any): void {
    const query = event.target?.value?.toLowerCase() || '';
    this.searchQuery = query;

    if (!query) {
      this.filteredJobs = [...this._unassignedJobs];
      return;
    }

    this.filteredJobs = this._unassignedJobs.filter((job) => {
      const jobNumber = job.jobNumber?.toString().toLowerCase() || '';
      return jobNumber.includes(query);
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredJobs = [...this._unassignedJobs];
  }
  dropUnassignedJobs(event: CdkDragDrop<any[]>) {

    if (!this.isActionAllowed) return;

    if (event.previousContainer === event.container) {
      // Reordering within unassigned jobs - just update UI, no API call needed
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      // Job from package dropped into unassigned jobs
      const draggedData = event.item.data;
      const sourceContainerId = event.previousContainer.id;
      
      // Parse source container to determine type
      const source = this.parseContainerId(sourceContainerId);

      if(this.planningMode === PlanningMode.BasePlan) {

        if(!source || !this.planId || !this.currentAreaId) {
          console.error('Missing required context for unassigned job drop');
          return;
        }

      } else {

        if(!source || !this.currentAreaId) {
          console.error('Missing required context for unassigned job drop');
          return;
        }

      }

      // Extract job ID based on source type
      let jobId: string | undefined;
      
      if (source.type === JobSourceType._0) {
        // From DefaultJobs (assigned jobs)
        jobId = draggedData?.id;
      } else if (source.type === JobSourceType._1) {
        // From ChildPackage (manual jobs)
        jobId = draggedData?.defaultJobs?.[0]?.id;
      }

      if (!jobId || !source.packageId) {
        console.error('Could not extract job ID from dragged data');
        return;
      }

      // Create request to move job to unassigned
      const request = new ModifyPackageJobsRequestDto({
        planId: this.planId,
        dayOfWeek: this.currentDayOfWeek,
        organizationUnitId: this.currentAreaId,
        sourcePackageId: source.packageId,
        sourceType: source.type,
        targetType: JobSourceType._2, // Unassigned
        jobId: jobId,
        isReorder: false
      });

      // Emit to parent
      this.jobModified.emit(request);

      // Update UI
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  private parseContainerId(containerId: string): { type: JobSourceType; packageId?: string } | null {
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
    }
    return null;
  }

  onHeaderClicked(panel: any) {
    setTimeout(() => {
      this.isPanelActive = panel.el.nativeElement.classList.contains(
        'p-accordionpanel-active'
      );
    }, 100);

    this.searchQuery = '';
    this.filteredJobs = [...this._unassignedJobs];
  }

  unassignJobdragStarted(list: any) {
    if(!this.isActionAllowed) return;
    if (list.length === 1) {
      this.isDraggingUnassignLastItem = true;
    }
  }

  unassignJobdragEnded() {
    if(!this.isActionAllowed) return;
    this.isDraggingUnassignLastItem = false;
  }
}
