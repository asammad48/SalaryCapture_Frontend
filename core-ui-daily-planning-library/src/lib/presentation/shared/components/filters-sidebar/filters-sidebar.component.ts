import { DateHelper } from './../../../../core/utils/date.helper';
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, EventEmitter, Output, Injector, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { TreeSelectModule } from 'primeng/treeselect';
import { DatePicker } from 'primeng/datepicker';
import { TreeNode } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DAYS_OF_WEEK, JOB_PACKAGE_STATUS_LIST, DayOfWeek, JobPackageStatus } from '../../../../core/domain/constants/filters.constants';
import { PlanningMode } from '../../../../core/domain/constants/planning-mode.enum';
import { DailyPlanningPortalBase } from '../../../base/daily-planning-base/daily-planning.base';
import { OrganizationUserDto } from '../../../../core/domain/models/Organization-User-Dto';
import { JobPackageFilters } from '../../../../core/domain/models/job-package/job-package-filters.model';

@Component({
  standalone: true,
  selector: 'app-filters-sidebar',
  templateUrl: './filters-sidebar.component.html',
  styleUrls: ['./filters-sidebar.component.scss'],
  imports: [CommonModule, FormsModule, TreeSelectModule, DatePicker],
})

export class FiltersSidebarComponent extends DailyPlanningPortalBase implements OnInit, OnDestroy {

  @Input() isLoadingJobPackages: boolean = false;
  @Input() planningMode: PlanningMode = PlanningMode.BasePlan;
  @Input() totalRecords: number = 0;

  @Input() isBasePlanFallbackMode: boolean = false;
  @Input() isFutureDatesMode: boolean = false;
  @Input() isPreviousDatesMode: boolean = false;

  @Output() filtersApplied = new EventEmitter<any>();
  @Output() dailyPlanReset = new EventEmitter<JobPackageFilters>();
  @Output() dailyPlanCreate = new EventEmitter<JobPackageFilters>();

  private destroy$ = new Subject<void>();

  filterPanelCollapsed = true;

  selectedDepot: TreeNode | null = null;
  selectedDay: DayOfWeek | null = DayOfWeek.Monday;
  selectedDate: Date | null = null;
  selectedStatus: JobPackageStatus = JobPackageStatus.All;

  organizationTree: TreeNode[] = [];
  isLoadingTree = false;
  loadingNodes: Set<string> = new Set(); // Track which nodes are currently loading

  daysOfWeek = DAYS_OF_WEEK;
  statusList = JOB_PACKAGE_STATUS_LIST;
  PlanningMode = PlanningMode; // Expose enum to template

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.loadOrganizationTree();
    this.setTomorrowAsDefault();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrganizationTree(): void {
    this.isLoadingTree = true;

    this.accessService.getUserRegions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const regions = response as any as OrganizationUserDto[];
          this.organizationTree = this.buildTreeFromRegions(regions);
          this.setDefaultDepot();
          this.isLoadingTree = false;
        },
        error: (error: any) => {
          console.error('Error loading organization tree:', error);
          this.isLoadingTree = false;
        },
      });
  }

  buildTreeFromRegions(regions: OrganizationUserDto[]): TreeNode[] {
    return regions.map(region => {
      const regionNode: TreeNode = {
        key: region.areaId,
        label: region.displayName,
        data: region,
        selectable: false, // Regions cannot be selected
        leaf: false,
        expanded: false, // Start collapsed
        children: []
      };
      // Build areas and set parent reference
      regionNode.children = this.buildAreasForRegion(region, regionNode);
      return regionNode;
    });
  }

  buildAreasForRegion(region: OrganizationUserDto, parentNode: TreeNode): TreeNode[] {
    const areas = region.subAreas?.filter(area => area.parentId === region.areaId) || [];
    return areas.map(area => {
      const areaNode: TreeNode = {
        key: area.areaId,
        label: area.displayName,
        data: area,
        selectable: false, // Areas cannot be selected
        leaf: false, // Areas have depots as children
        expanded: false, // Start collapsed
        children: [], // Will be loaded on demand
        parent: parentNode // Set parent reference
      };
      return areaNode;
    });
  }

  onNodeExpand(event: any): void {
    const node = event.node;

    // Collapse all siblings at the same level before expanding this node
    this.collapseSiblings(node);

    // Mark node as expanded
    if (node) {
      node.expanded = true;
    }

    // Only load children if the node has no children yet and is not a leaf
    if (node && !node.leaf && (!node.children || node.children.length === 0)) {
      // Mark node as loading
      const nodeKey = node.key as string;
      if (this.loadingNodes.has(nodeKey)) {
        return; // Already loading, prevent duplicate calls
      }
      this.loadDepots(node);
    }
  }

  onNodeCollapse(event: any): void {
    const node = event.node;
    // Mark node as collapsed
    if (node) {
      node.expanded = false;
    }
  }

  loadDepots(areaNode: TreeNode): void {
    const areaId = areaNode.key as string;

    // Mark as loading and show loader
    this.loadingNodes.add(areaId);
    this.isLoadingTree = true;

    this.apiClient.geChildOUsByParentId(areaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const depots = response.data || [];
          areaNode.children = depots.map(depot => {
            const depotNode: TreeNode = {
              key: depot.areaId,
              label: depot.displayName,
              data: depot,
              selectable: true, // Only depots are selectable
              leaf: true // Depots have no children
            };
            return depotNode;
          });

          // Clear loading state
          this.loadingNodes.delete(areaId);
          this.isLoadingTree = false;
        },
        error: (error: any) => {
          console.error('Error loading depots for area:', areaId, error);

          // Clear loading state on error
          this.loadingNodes.delete(areaId);
          this.isLoadingTree = false;
        }
      });
  }

  setDefaultDepot(): void {
    if (!this.organizationTree || this.organizationTree.length === 0) return;

    // Get first region
    const firstRegion = this.organizationTree[0];

    // Get first area
    if (firstRegion.children && firstRegion.children.length > 0) {
      const firstArea = firstRegion.children[0];

      // Load depots for the first area
      this.apiClient.geChildOUsByParentId(firstArea.key as string)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            const depots = response.data || [];
            firstArea.children = depots.map(depot => ({
              key: depot.areaId,
              label: depot.displayName,
              data: depot,
              selectable: true,
              leaf: true
            }));

            // Select first depot
            if (firstArea.children && firstArea.children.length > 0) {
              this.selectedDepot = firstArea.children[0];
              // Expand the path to the selected depot
              firstRegion.expanded = true;
              firstArea.expanded = true;
              this.applyFilters();
            }
          },
          error: (error: any) => {
            console.error('Error loading default depots:', error);
          }
        });
    }
  }

  filterPanelToggler(): void {
    this.filterPanelCollapsed = !this.filterPanelCollapsed;
  }

  onDaySelect(value: DayOfWeek | string): void {
    this.selectedDay = typeof value === 'string' ? parseInt(value, 10) as DayOfWeek : value;
  }

  onSelectStatus(value: JobPackageStatus | string): void {
    this.selectedStatus = typeof value === 'string' ? parseInt(value, 10) as JobPackageStatus : value;
  }

  onDateSelect(value: Date): void {
    this.selectedDate = value;
  }

  applyFilters(): void {
    const filters: any = {
      area: this.selectedDepot?.key || null,
      status: this.selectedStatus
    };

    // Add day or date based on planning mode
    if (this.planningMode === PlanningMode.BasePlan) {
      filters.day = this.selectedDay;
    } else if (this.planningMode === PlanningMode.DailyPlan) {
      filters.date = this.selectedDate;
    }

    this.filtersApplied.emit(filters);
  }

  onDepotSelect(event: any): void {
    // When a depot is selected, collapse all other paths and expand only to this depot
    this.collapseAllNodes();

    if (this.selectedDepot) {
      // Find the parent area and region
      for (const region of this.organizationTree) {
        for (const area of region.children || []) {
          if (area.children?.some(d => d.key === this.selectedDepot?.key)) {
            region.expanded = true;
            area.expanded = true;
            return;
          }
        }
      }
    }
  }

  onPanelShow(): void {
    // When panel opens, collapse all nodes first, then expand only path to selected depot
    this.collapseAllNodes();

    if (this.selectedDepot) {
      // Find and expand the path to the selected depot
      for (const region of this.organizationTree) {
        for (const area of region.children || []) {
          if (area.children?.some(d => d.key === this.selectedDepot?.key)) {
            // Expand only region and area containing selected depot
            region.expanded = true;
            area.expanded = true;
            return;
          }
        }
      }
    }
  }

  collapseAllNodes(): void {
    // Collapse all regions and areas
    for (const region of this.organizationTree) {
      region.expanded = false;
      if (region.children) {
        for (const area of region.children) {
          area.expanded = false;
        }
      }
    }
  }

  collapseSiblings(node: TreeNode): void {
    if (!node || !node.parent) {
      // If node has no parent, collapse all top-level (region) siblings
      for (const region of this.organizationTree) {
        if (region.key !== node.key) {
          region.expanded = false;
          // Also collapse all children of sibling regions
          if (region.children) {
            for (const area of region.children) {
              area.expanded = false;
            }
          }
        }
      }
    } else {
      // If node has a parent, collapse siblings within that parent
      const parent = node.parent;
      if (parent.children) {
        for (const sibling of parent.children) {
          if (sibling.key !== node.key) {
            sibling.expanded = false;
            // Also collapse all children of the sibling
            if (sibling.children) {
              for (const child of sibling.children) {
                child.expanded = false;
              }
            }
          }
        }
      }
    }
  }

  resetDailyPlan(): void {

    if(!(this.planningMode === PlanningMode.DailyPlan)) {
      return;
    }

    const filters: JobPackageFilters = {
      area: this.selectedDepot?.key || null,
      areaName: this.selectedDepot?.label || null,
      status: this.selectedStatus,
      date: this.selectedDate || null
    };

    this.dailyPlanReset.emit(filters);
  }

  createDailyPlan(): void {

    const filters: JobPackageFilters = {
      area: this.selectedDepot?.key || null,
      areaName: this.selectedDepot?.label || null,
      status: this.selectedStatus,
      date: this.selectedDate || null
    };

    this.dailyPlanCreate.emit(filters);
  }

  showResetButton(): boolean {
    return this.planningMode === PlanningMode.DailyPlan && this.isFutureDatesMode && this.totalRecords > 0;
  }

  showEditDailyPlanButton(): boolean {
    // Show create button only when:
    // - In daily plan mode
    // - In BASE_PLAN_FALLBACK mode (no daily packages exist)
    // - Date is NOT before tomorrow (prevent creating plans for past dates)
    const isDateValid = this.selectedDate ? !DateHelper.isBeforeTomorrow(this.selectedDate) : false;
    return this.planningMode === PlanningMode.DailyPlan && this.isBasePlanFallbackMode && this.totalRecords > 0 && isDateValid;
  }

  setTomorrowAsDefault(): void {

    if(this.planningMode === PlanningMode.BasePlan) {
      this.setTomorrowDayOfWeek();

    } else if(this.planningMode === PlanningMode.DailyPlan) {
      this.setTomorrowDate();
    }

  }

  setTomorrowDayOfWeek(): void {
    const tomorrowDay = DateHelper.getTomorrowDayOfWeek() as DayOfWeek;
    this.selectedDay = tomorrowDay;
  }

  setTomorrowDate(): void {
    const tomorrowDate = DateHelper.getTomorrowDate();
    this.selectedDate = tomorrowDate;
  }

}
