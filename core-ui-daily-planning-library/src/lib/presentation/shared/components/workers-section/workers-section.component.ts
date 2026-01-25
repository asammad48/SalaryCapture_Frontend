import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { StringHelper } from '../../../../core/utils/string.helper';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, QueryList, ViewChildren } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { AutoComplete } from 'primeng/autocomplete';
import { BasePlanServiceWorkerDto } from '../../../../data/api-clients/daily-planning-api.client';
import { DropListConnectorService } from '../../services/job-drop-list-connector.service';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-workers-section',
  templateUrl: './workers-section.component.html',
  styleUrls: ['./workers-section.component.scss'],
  imports: [
    AccordionModule,
    FormsModule,
    CommonModule,
    DragDropModule,
    ScrollingModule,
  ],
})
export class WorkersSectionComponent implements AfterViewInit {
  
  @Input() isActionAllowed: boolean = false;

  constructor(private dropListConnector: DropListConnectorService) {}
  @Input() set serviceWorkers(workers: BasePlanServiceWorkerDto[]) {
    this.unassignedWorkers = workers || [];
    this.filteredWorkers = [...this.unassignedWorkers];
  }
  isPanelActive = true;
  searchQuery = '';
  unassignedWorkers: BasePlanServiceWorkerDto[] = [];
  filteredWorkers: BasePlanServiceWorkerDto[] = [];
  @ViewChildren('unassignedWorkersList')
  unassignedWorkersList!: QueryList<CdkDropList>;
  isDragginWorkerLastItem = false;
  ngAfterViewInit() {
    this.unassignedWorkersList.forEach((list) =>
      this.dropListConnector.register(list, 'worker')
    );
  }

  filterWorkers(event: any): void {
    const query = event.query?.toLowerCase() || '';
    this.searchQuery = query;

    if (!query) {
      this.filteredWorkers = [...this.unassignedWorkers];
      return;
    }

    this.filteredWorkers = this.unassignedWorkers.filter((worker) => {
      const firstName = worker.firstName?.toLowerCase() || '';
      const workerId = worker.workerId?.toString() || '';
      return firstName.includes(query) || workerId.includes(query);
    });
  }

  onSearchInput(event: any): void {
    const query = event.target?.value?.trim() || '';
    this.searchQuery = query;

    if (!query) {
      this.filteredWorkers = [...this.unassignedWorkers];
      return;
    }

    this.filteredWorkers = this.unassignedWorkers.filter((worker) => {
      const firstName = worker.firstName || '';
      const workerId = worker.workerId?.toString() || '';
      return StringHelper.includesIgnoreCase(firstName, query) || StringHelper.includesIgnoreCase(workerId, query);
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredWorkers = [...this.unassignedWorkers];
  }

  dropUnassignedWorkers(event: CdkDragDrop<any[]>) {
    if (!this.isActionAllowed) return;
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  onHeaderClicked(panel: any) {
    
    setTimeout(() => {

      const wasActive = this.isPanelActive;

      this.isPanelActive = panel.el.nativeElement.classList.contains(
        'p-accordionpanel-active'
      );

    }, 100);

    this.searchQuery = '';
    this.filteredWorkers = [...this.unassignedWorkers];

  }

  workerdragStarted(list: any) {
    if(!this.isActionAllowed) return;
    if (list.length === 1) {
      this.isDragginWorkerLastItem = true;
    }
  }

  workerdragEnded() {
    if(!this.isActionAllowed) return;
    this.isDragginWorkerLastItem = false;
  }
}
