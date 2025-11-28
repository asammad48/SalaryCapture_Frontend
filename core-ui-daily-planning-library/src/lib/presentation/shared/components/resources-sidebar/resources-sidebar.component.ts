import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UnassignedJobsSelectionComponent } from '../unassigned-jobs-selection/unassigned-jobs-selection.component';
import { WorkersSectionComponent } from '../workers-section/workers-section.component';
import { AccordionModule } from 'primeng/accordion';
import { 
  BasePlanServiceWorkerDto, 
  BasePlanUnassignedJobsDto,
  ModifyPackageJobsRequestDto
} from '../../../../data/api-clients/daily-planning-api.client';
import { PlanningMode } from '../../../../../../../core-ui-daily-planning-library/src/lib/core/domain/constants/planning-mode.enum';

@Component({
  standalone: true,
  selector: 'app-resources-sidebar',
  templateUrl: './resources-sidebar.component.html',
  styleUrls: ['./resources-sidebar.component.scss'],
  imports: [CommonModule,UnassignedJobsSelectionComponent,WorkersSectionComponent,AccordionModule]
})
export class ResourcesSidebarComponent {
  @Input() isDailyPlanReadMode: boolean = false;
  @Input() isDailyPlanEditMode: boolean = false;
  @Input() planningMode: PlanningMode = PlanningMode.BasePlan;
  @Input() unassignedJobs: BasePlanUnassignedJobsDto[] = [];
  @Input() serviceWorkers: BasePlanServiceWorkerDto[] = [];
  @Input() planId?: string;
  @Input() currentDayOfWeek?: string;
  @Input() currentAreaId?: string;

  @Output() jobModified = new EventEmitter<ModifyPackageJobsRequestDto>();

  resourcePanelCollapsed:boolean = true;
  accordionActiveIndex:number = 0;
  
  resourcePanelToggler() {
    this.resourcePanelCollapsed = !this.resourcePanelCollapsed;
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
    
}