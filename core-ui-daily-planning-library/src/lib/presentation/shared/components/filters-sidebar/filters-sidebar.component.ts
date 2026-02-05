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
        return regions.map(region => this.mapDtoToTreeNode(region));
    }

    mapDtoToTreeNode(dto: OrganizationUserDto, parentNode?: TreeNode): TreeNode {
        const hasChildren = dto.subAreas && dto.subAreas.length > 0;
        const node: TreeNode = {
            key: dto.areaId,
            label: dto.displayName,
            data: dto,
            selectable: !hasChildren,
            leaf: !hasChildren,
            expanded: false,
            children: [],
            parent: parentNode
        };

        if (hasChildren) {
            node.children = dto.subAreas!.map(child => this.mapDtoToTreeNode(child, node));
        }

        return node;
    }

    onNodeExpand(event: any): void {
        const node = event.node;
        this.collapseSiblings(node);
        if (node) {
            node.expanded = true;
        }
    }

    onNodeCollapse(event: any): void {
        const node = event.node;
        if (node) {
            node.expanded = false;
        }
    }

    setDefaultDepot(): void {
        const firstSelectable = this.findFirstSelectableNode(this.organizationTree);
        if (firstSelectable) {
            this.selectedDepot = firstSelectable;
            this.expandPathToNode(firstSelectable);
            this.applyFilters();
        }
    }

    findFirstSelectableNode(nodes: TreeNode[]): TreeNode | null {
        for (const node of nodes) {
            if (node.selectable) {
                return node;
            }
            if (node.children && node.children.length > 0) {
                const found = this.findFirstSelectableNode(node.children);
                if (found) return found;
            }
        }
        return null;
    }

    expandPathToNode(node: TreeNode): void {
        let current = node.parent;
        while (current) {
            current.expanded = true;
            current = current.parent;
        }
    }

    filterPanelToggler(): void {
        this.filterPanelCollapsed = !this.filterPanelCollapsed;
    }

    onDaySelect(value: DayOfWeek | string): void {
        this.selectedDay = typeof value === 'string' ? parseInt(value, 10) as DayOfWeek : value;
        this.applyFilters();
    }

    onSelectStatus(value: JobPackageStatus | string): void {
        this.selectedStatus = typeof value === 'string' ? parseInt(value, 10) as JobPackageStatus : value;
        this.applyFilters();
    }

    onDateSelect(value: Date): void {
        this.selectedDate = value;
        this.applyFilters();
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
        this.collapseAllNodes();
        if (this.selectedDepot) {
            this.expandPathToNode(this.selectedDepot);
        }
        this.applyFilters();
    }

    onPanelShow(): void {
        this.collapseAllNodes();
        if (this.selectedDepot) {
            this.expandPathToNode(this.selectedDepot);
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

        if (!(this.planningMode === PlanningMode.DailyPlan)) {
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

        if (this.planningMode === PlanningMode.BasePlan) {
            this.setTomorrowDayOfWeek();

        } else if (this.planningMode === PlanningMode.DailyPlan) {
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
