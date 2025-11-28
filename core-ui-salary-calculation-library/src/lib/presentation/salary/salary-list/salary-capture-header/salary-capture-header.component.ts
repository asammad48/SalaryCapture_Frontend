import { Component, EventEmitter, Input, Output, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { AutoComplete, AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { trigger, transition, style, animate } from '@angular/animations';
import { Permissions, PermissionsType } from '../../../../core/domain/constants/claims.constants';
import { AccessService } from '../../../../data/repositories/access/access.service';
import { RegionalWorkerResponse, ServiceWorkersByFilterResponse } from '../../../../core/domain/models/ServiceWorker/service-worker-by-filter-response.model';
import { GetServiceWorkerAgainstSalariesResponse } from '../../../../core/domain/models/ServiceWorker/service-worker-against-salaries-response.model';
import { SalaryCaptureViewType } from '../../../../core/domain/enums/salary-capture-view-type.enum';
import { MenuActionKey, MenuActions } from 'core-ui-salary-calculation-library/src/lib/core/domain/constants/application-constants';
import { Menu, MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'lib-salary-capture-header',
  standalone: true,
  imports: [
    CommonModule,
    CheckboxModule,
    ButtonModule,
    AutoCompleteModule,
    FormsModule,
    TooltipModule,
    SkeletonModule,
    MenuModule
  ],
  templateUrl: './salary-capture-header.component.html',
  styleUrls: ['./salary-capture-header.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(-10px)' }))
      ])
    ])
  ]
})
export class SalaryCaptureHeaderComponent implements AfterViewInit {
  Permissions = Permissions;
  SalaryCaptureViewType = SalaryCaptureViewType;

  @Input() isScrolling = false;
  @Input() filterPanelCollapsed = false;
  @Input() serviceWorkers: GetServiceWorkerAgainstSalariesResponse[] = [];
  @Input() allServiceWorkersForAutocomplete: ServiceWorkersByFilterResponse[] = [];
  @Input() filteredGroups: RegionalWorkerResponse[] = [];
  @Input() globalSearchTerm: string | undefined = '';
  @Input() deadLineText = '';
  @Input() fullDate: string | undefined;
  @Input() showCurrentDeadlinePeriod = false;
  @Input() showPastDeadlinePeriod = false;
  @Input() hasDeadline = false;
  @Input() isFilterApplied = false;
  @Input() isAllChecked = false;
  @Input() isAllIndeterminate = false;
  @Input() totalRecords = 0;
  @Input() currentView: SalaryCaptureViewType = SalaryCaptureViewType.WORKER_ACCORDION;
  @Input() canApproveAll = false;
  @Input() canRejectAll = false;
  @Input() canShowBulkMenu = false;
  @Input() isLoading = false;

  @Output() selectAllWorkersChange = new EventEmitter<boolean>();
  @Output() workerFilterSelected = new EventEmitter<any>();
  @Output() workerFilterCleared = new EventEmitter<void>();
  @Output() filterRegionalWorkers = new EventEmitter<any>();
  @Output() addSalaryLineGlobal = new EventEmitter<any>();
  @Output() rejectGlobal = new EventEmitter<void>();
  @Output() approveGlobal = new EventEmitter<void>();
  @Output() globalSearchTermChange = new EventEmitter<string>();
  @Output() viewToggle = new EventEmitter<SalaryCaptureViewType>();

  @Output() bulkMenuActionClicked = new EventEmitter<MenuActionKey>();

  @Output() addSalaryLineButtonRef = new EventEmitter<any>();
  @Output() rejectGlobalButtonRef = new EventEmitter<any>();
  @Output() approveGlobalButtonRef = new EventEmitter<any>();
  @Output() selectAllWorkersRef = new EventEmitter<any>();

  @ViewChild('addSalaryLineBtn') addSalaryLineBtn: any;
  @ViewChild('rejectGlobalBtn') rejectGlobalBtn: any;
  @ViewChild('approveGlobalBtn') approveGlobalBtn: any;
  @ViewChild('workerAutoCompleteRef') workerAutoCompleteRef!: AutoComplete;
  salaryMenuItems: MenuItem[] = [];

  constructor(public accessService: AccessService) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
        this.focusWorkerAutoComplete();
    },300);
  }

  onSelectAllWorkersChange(checked: boolean): void {
    this.selectAllWorkersChange.emit(checked);
  }

  onWorkerFilterSelected(event: any): void {
    this.workerFilterSelected.emit(event);
  }

  onWorkerFilterCleared(): void {
    this.workerFilterCleared.emit();
  }

  onFilterRegionalWorkers(event: any): void {
    this.filterRegionalWorkers.emit(event);
  }

  onAddSalaryLineGlobal($event: any): void {
    this.addSalaryLineGlobal.emit($event);
    if (this.addSalaryLineBtn) {
      this.addSalaryLineButtonRef.emit(this.addSalaryLineBtn);
    }
  }

  onRejectGlobal(): void {
    this.rejectGlobal.emit();
    if (this.rejectGlobalBtn) {
      this.rejectGlobalButtonRef.emit(this.rejectGlobalBtn);
    }
  }

  onApproveGlobal(): void {
    this.approveGlobal.emit();
    if (this.approveGlobalBtn) {
      this.approveGlobalButtonRef.emit(this.approveGlobalBtn);
    }
  }

  canAddSalaryLine(): boolean {
    return this.isFilterApplied && this.hasDeadline;
  }

  onViewToggle(): void {
    const newView = this.currentView === SalaryCaptureViewType.WORKER_ACCORDION 
      ? SalaryCaptureViewType.WORKER_SALARY 
      : SalaryCaptureViewType.WORKER_ACCORDION;
    this.viewToggle.emit(newView);
  }

  showAllCheckbox(): boolean {

    if(this.currentView === SalaryCaptureViewType.WORKER_ACCORDION) {
      return this.isFilterApplied && this.totalRecords > 0;

    } else if(this.currentView === SalaryCaptureViewType.WORKER_SALARY) {
      return this.isFilterApplied && this.totalRecords > 0;
    }

    return false;
  }

  gridMenus() {

    return [

      {
        label: 'Reset Statuses',
        styleClass: 'list-warning fs-14',
        command: () => this.bulkMenuActionClicked.emit(MenuActions.RESET),
        disabled: !this.canShowBulkMenu || !this.accessService.hasPermission(Permissions.SALARY_CAPTURE_RESET_BUTTON),
        visible: this.accessService.hasPermission(Permissions.SALARY_CAPTURE_REMOVEENTRY_SALARY_BUTTON),
      },

      {
        label: 'Remove Entries',
        styleClass: 'list-danger fs-14',
        command: () => this.bulkMenuActionClicked.emit(MenuActions.REMOVE),
        disabled: !this.canShowBulkMenu || !this.accessService.hasPermission(Permissions.SALARY_CAPTURE_REMOVEENTRY_SALARY_BUTTON),
        visible: this.accessService.hasPermission(Permissions.SALARY_CAPTURE_REMOVEENTRY_SALARY_BUTTON),
      },

    ];

  }

  onMenuClick(event: MouseEvent, menu: Menu) {
    this.salaryMenuItems = this.gridMenus();
    menu.toggle(event);
  }

  focusWorkerAutoComplete() {
    if (this.workerAutoCompleteRef?.inputEL) {
      this.workerAutoCompleteRef.inputEL.nativeElement.focus();
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent): void {
    if (event.altKey && event.key.toLowerCase() === 'k') {
      this.focusWorkerAutoComplete();
    }
  }
}
