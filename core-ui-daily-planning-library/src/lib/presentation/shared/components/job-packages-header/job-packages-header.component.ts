import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Injector,
  Input,
  Output,
} from '@angular/core';
import { Tooltip } from 'primeng/tooltip';
import { DailyPlanningPortalBase } from '../../../base/daily-planning-base/daily-planning.base';
import { AddEditJobPackageComponent } from '../add-edit-job-package/add-edit-job-package.component';
import { DialogMode } from '../../../../core/domain/constants/dialog-mode.enum';
import { AutoComplete } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import { PlanningMode } from '../../../../../../../core-ui-daily-planning-library/src/lib/core/domain/constants/planning-mode.enum';

@Component({
  standalone: true,
  selector: 'app-job-packages-header',
  templateUrl: './job-packages-header.component.html',
  styleUrls: ['./job-packages-header.component.scss'],
  imports: [CommonModule, Tooltip, AutoComplete, FormsModule],
})
export class JobPackagesHeaderComponent extends DailyPlanningPortalBase {

  @Input() isDailyPlanReadMode: boolean = false;
  @Input() isDailyPlanEditMode: boolean = false;
  @Input() planningMode: PlanningMode = PlanningMode.BasePlan;

  @Input() totalRecords = 0;
  @Input() filteredRecords = 0;
  @Output() sortToggled = new EventEmitter<number>();
  sortAsc = true;
  isSearchOpen = false;
  searchValue = '';
  @Output() confirmedCreate = new EventEmitter<DialogMode>();
  @Output() searchChanged = new EventEmitter<string>();

  constructor(inject: Injector) {
    super(inject);
  }

  toggleSort(): void {
    this.sortAsc = !this.sortAsc;
    const sortValue = this.sortAsc ? 0 : 1; // 0 = asc, 1 = desc (SortByEnum)
    this.sortToggled.emit(sortValue);
  }

  newJobPackage() {
    this.confirmedCreate.emit(DialogMode.Add);
  }
  openSearch(event: Event, searchJob: AutoComplete) {
    this.stopProp(event);
    this.isSearchOpen = true;
    setTimeout(() => {
      searchJob?.inputEL?.nativeElement.focus();
    }, 50);
  }
  onFocus() {
    this.isSearchOpen = true;
  }
  onBlur(event: FocusEvent) {
    setTimeout(() => {
      if (!this.searchValue) {
        this.isSearchOpen = false;
      }
    }, 150);
  }
  stopProp(event: Event) {
    event.stopPropagation();
  }
  @HostListener('document:click')
  onDocumentClick() {
    if (!this.searchValue) {
      this.isSearchOpen = false;
    }
  }

  onSearchInputChange(value: string) {
    this.searchChanged.emit(value);

    if (!value) {
      this.searchValue = '';
    }
  }

  showReadModeBadge(): boolean {
    return this.planningMode === PlanningMode.DailyPlan && this.isDailyPlanReadMode;
  }
  
}
