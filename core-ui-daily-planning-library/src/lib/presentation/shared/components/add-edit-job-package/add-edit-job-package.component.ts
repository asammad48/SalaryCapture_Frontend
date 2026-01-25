import { Component, Injector, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Checkbox } from 'primeng/checkbox';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TreeSelectModule } from 'primeng/treeselect';
import { TreeNode } from 'primeng/api';
import { AddEditJobPackageConfig } from '../../../../core/domain/models/add-edit-job-package/add-edit-job-package-config.model';
import { DialogMode } from '../../../../core/domain/constants/dialog-mode.enum';
import { DailyPlanningPortalBase } from '../../../base/daily-planning-base/daily-planning.base';
import { takeUntil } from 'rxjs';
import { OrganizationUserDto } from '../../../../core/domain/models/Organization-User-Dto';
import { DayOfWeek } from '../../../../core/domain/models/add-edit-job-package/day-of-week.model';
import { EditJobPackageData } from '../../../../core/domain/models/add-edit-job-package/edit-job-package-data.model';
import { PlanningMode } from '../../../../core/domain/constants/planning-mode.enum';
import { ProgressLoadingComponent } from '../progress-loading/progress-loading.component';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { FuturePlansDialogComponent, FuturePlansDialogAction, FuturePlansDialogResult } from '../../future-plans-dialog/future-plans-dialog.component';
import { JobPackageFilters } from 'core-ui-daily-planning-library/src/lib/core/domain/models/job-package/job-package-filters.model';
import { DateHelper } from '../../../../core/utils/date.helper';

@Component({
  selector: 'lib-add-edit-job-package',
  standalone: true,
  imports: [CommonModule, Checkbox, AutoCompleteModule, ReactiveFormsModule, FormsModule, TreeSelectModule, ProgressLoadingComponent],
  templateUrl: './add-edit-job-package.component.html',
})

export class AddEditJobPackageComponent extends DailyPlanningPortalBase implements OnInit {

  daysOfWeek: DayOfWeek[] = [
    { value: 'Monday', label: 'Monday', shortLabel: 'Mon' },
    { value: 'Tuesday', label: 'Tuesday', shortLabel: 'Tue' },
    { value: 'Wednesday', label: 'Wednesday', shortLabel: 'Wed' },
    { value: 'Thursday', label: 'Thursday', shortLabel: 'Thu' },
    { value: 'Friday', label: 'Friday', shortLabel: 'Fri' },
    { value: 'Saturday', label: 'Saturday', shortLabel: 'Sat' },
    { value: 'Sunday', label: 'Sunday', shortLabel: 'Sun' }
  ];

  // Dialog
  private readonly dialogConfig : AddEditJobPackageConfig | undefined;
  dialogMode: DialogMode = DialogMode.Add;
  planningMode: PlanningMode = PlanningMode.BasePlan; 
  selectedDayOfWeek: string | undefined;

  // Organization Unit Tree
  selectedOrganizationUnit: TreeNode | null = null;
  organizationTree: TreeNode[] = [];
  isLoadingOrganizationTree = false;
  loadingNodes: Set<string> = new Set();
  userOrganizationUnits: OrganizationUserDto[] = [];

  jobPackageForm: FormGroup;

  constructor(
    injector: Injector,
    public ref: DynamicDialogRef,
    private readonly config: DynamicDialogConfig<AddEditJobPackageConfig | undefined>,
    private fb: FormBuilder
  ) {
    super(injector);
    this.dialogConfig = this.config.data;
    this.dialogMode = this.dialogConfig?.mode || DialogMode.Add;
    this.planningMode = this.dialogConfig?.path || PlanningMode.BasePlan; 
    this.selectedDayOfWeek = this.dialogConfig?.dayOfWeek;
    this.jobPackageForm = this.initializeForm();
  }

  ngOnInit(): void {
    this.loadOrganizationTree();
  }

  get isBasePlan(): boolean {
    return this.planningMode === PlanningMode.BasePlan;
  }

  get isDailyPlan(): boolean {
    return this.planningMode === PlanningMode.DailyPlan;
  }

  loadOrganizationTree(): void {
    this.isLoadingOrganizationTree = true;

    this.accessService.getUserRegions()
      .pipe(takeUntil(this.destroyer$))
      .subscribe({
        next: (response) => {
          const regions = response as any as OrganizationUserDto[];
          this.userOrganizationUnits = regions;
          this.organizationTree = this.buildTreeFromRegions(regions);
          this.setDefaultOrganizationUnit();
          this.isLoadingOrganizationTree = false;
        },
        error: (error: any) => {
          console.error('Error loading organization tree:', error);
          this.isLoadingOrganizationTree = false;
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
        selectable: false,
        leaf: false,
        expanded: false,
        children: [],
        parent: parentNode
      };
      return areaNode;
    });
  }

  setDefaultOrganizationUnit(): void {
    if (!this.organizationTree || this.organizationTree.length === 0) return;

    // If in edit mode, load and select the organization unit from job package data
    if (this.dialogMode === DialogMode.Edit && this.dialogConfig?.jobPackage) {
      this.loadOrganizationUnitForEdit(this.dialogConfig.jobPackage);
      return;
    }

    // Otherwise set first depot as default for add mode
    const firstRegion = this.organizationTree[0];

    if (firstRegion.children && firstRegion.children.length > 0) {
      const firstArea = firstRegion.children[0];

      this.apiClient.geChildOUsByParentId(firstArea.key as string)
        .pipe(takeUntil(this.destroyer$))
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

            if (firstArea.children && firstArea.children.length > 0) {
              this.selectedOrganizationUnit = firstArea.children[0];
              this.jobPackageForm.patchValue({ organizationUnitId: this.selectedOrganizationUnit });
              firstRegion.expanded = true;
              firstArea.expanded = true;
            }
          },
          error: (error: any) => {
            console.error('Error loading default depots:', error);
          }
        });
    }
  }

  private getSelectedAreaNode(jobPackage: EditJobPackageData): TreeNode | null {

    for (const region of this.organizationTree) {

      for (const area of region.children || []) {

        if (area.key === jobPackage.areaId) {
          return area;
        }

      }

    }

    return null;
  }

  loadOrganizationUnitForEdit(jobPackage: EditJobPackageData): void {

    const areaNode = this.getSelectedAreaNode(jobPackage);

    if (!areaNode) {
      console.error('Area not found for job package edit:', jobPackage);
      return;
    }

    this.apiClient.geChildOUsByParentId(String(areaNode.key))
      .pipe(takeUntil(this.destroyer$))
      .subscribe({
        next: response => {
          const depots = Array.isArray(response.data) ? response.data : [];

          // Build children once
          areaNode.children = depots.map(depot => ({
            key: depot.areaId,
            label: depot.displayName,
            data: depot,
            selectable: true,
            leaf: true,
            parent: areaNode
          }));

          // Find depot match
          const matchingDepot = areaNode.children.find(d => d.key === jobPackage.subAreaId);

          if (!matchingDepot) {
            return;
          }

          this.selectedOrganizationUnit = matchingDepot;

          this.jobPackageForm.patchValue({organizationUnitId: matchingDepot});

          // Expand area and region with safe guards
          let cursor: TreeNode | undefined = matchingDepot.parent;

          while (cursor) {
            cursor.expanded = true;
            cursor = cursor.parent;
          }

          // Load remaining fields
          this.populateFormForEdit(jobPackage);
        },

        error: err => {
          console.error('Error loading depots for edit:', err);
        }

      });
      
  }

  populateFormForEdit(jobPackage: EditJobPackageData): void {

    if (jobPackage.name) {
      this.jobPackageForm.patchValue({ name: jobPackage.name });
    }

    if (this.planningMode === PlanningMode.BasePlan && jobPackage.daysOfWeek) {
      this.jobPackageForm.patchValue({ daysOfWeek: jobPackage.daysOfWeek });
    }

    if (jobPackage.tags) {
      const tagsArray = jobPackage.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      this.jobPackageForm.patchValue({ tags: tagsArray });
    }
    
  }

  onNodeExpand(event: any): void {
    const node = event.node;

    if (node) {
      node.expanded = true;
    }

    if (node && !node.leaf && (!node.children || node.children.length === 0)) {
      const nodeKey = node.key as string;
      if (this.loadingNodes.has(nodeKey)) {
        return;
      }
      this.loadDepots(node);
    }
  }

  onNodeCollapse(event: any): void {
    const node = event.node;
    if (node) {
      node.expanded = false;
    }
  }

  loadDepots(areaNode: TreeNode): void {
    const areaId = areaNode.key as string;

    this.loadingNodes.add(areaId);
    this.isLoadingOrganizationTree = true;

    this.apiClient.geChildOUsByParentId(areaId)
      .pipe(takeUntil(this.destroyer$))
      .subscribe({
        next: (response) => {
          const depots = response.data || [];
          areaNode.children = depots.map(depot => {
            const depotNode: TreeNode = {
              key: depot.areaId,
              label: depot.displayName,
              data: depot,
              selectable: true,
              leaf: true
            };
            return depotNode;
          });

          this.loadingNodes.delete(areaId);
          this.isLoadingOrganizationTree = false;
        },
        error: (error: any) => {
          console.error('Error loading depots for area:', areaId, error);
          this.loadingNodes.delete(areaId);
          this.isLoadingOrganizationTree = false;
        }
      });
  }

  private getTomorrowDay(): string[] {

    if (this.dialogMode === DialogMode.Add && this.planningMode === PlanningMode.BasePlan) {
      const tomorrowDay = DateHelper.getDayOfWeekFromDate(DateHelper.getTomorrowDate());
      return tomorrowDay ? [tomorrowDay] : [];
    }

    return [];
  }

  private initializeForm(): FormGroup {

    const daysOfWeekValidators = this.planningMode === PlanningMode.BasePlan ? [Validators.required, this.minArrayLengthValidator(1)] : [];
    const defaultDayOfWeek = this.getTomorrowDay();

    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1), this.noWhitespaceValidator]],
      organizationUnitId: [null, [Validators.required]],
      daysOfWeek: [defaultDayOfWeek, daysOfWeekValidators],
      tags: [[]]
    });
  }

  noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    const isWhitespace = value.trim().length === 0;
    return isWhitespace ? { whitespace: true } : null;
  }

  minArrayLengthValidator(minLength: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!Array.isArray(value) || value.length < minLength) {
        return { minArrayLength: { requiredLength: minLength, actualLength: value?.length || 0 } };
      }
      return null;
    };
  }

  onDayChange(event: any, day: string): void {
    
    if (this.planningMode !== PlanningMode.BasePlan) {
      return;
    }

    const checked = event.checked;
    const currentDays = this.jobPackageForm.get('daysOfWeek')?.value || [];

    if (checked) {
      if (!currentDays.includes(day)) {
        currentDays.push(day);
      }
    } else {
      const index = currentDays.indexOf(day);
      if (index > -1) {
        currentDays.splice(index, 1);
      }
    }

    this.jobPackageForm.patchValue({ daysOfWeek: currentDays });
    this.jobPackageForm.get('daysOfWeek')?.markAsTouched();
  }

  isDaySelected(day: string): boolean {
    const currentDays = this.jobPackageForm.get('daysOfWeek')?.value || [];
    return currentDays.includes(day);
  }

  get isFormValid(): boolean {
    return this.jobPackageForm.valid;
  }

  get isEditMode(): boolean {
    return this.dialogMode === DialogMode.Edit;
  }

  get nameControl() {
    return this.jobPackageForm.get('name');
  }

  get organizationUnitIdControl() {
    return this.jobPackageForm.get('organizationUnitId');
  }

  get daysOfWeekControl() {
    return this.jobPackageForm.get('daysOfWeek');
  }

  get tagsControl() {
    return this.jobPackageForm.get('tags');
  }

  closeModal(isConfirm: boolean): void {
    if (isConfirm) {
      Object.keys(this.jobPackageForm.controls).forEach(key => {
        this.jobPackageForm.get(key)?.markAsTouched();
      });

      if (!this.isFormValid) {
        return;
      }

      const organizationUnitNode = this.jobPackageForm.value.organizationUnitId as TreeNode;

      const formData = {
        id: this.dialogConfig?.jobPackage?.id,
        name: this.jobPackageForm.value.name,
        organizationUnitId: organizationUnitNode?.key || null,
        daysOfWeek: this.jobPackageForm.value.daysOfWeek,
        tags: this.jobPackageForm.value.tags,
        mode: this.dialogMode,
        resetFuturePlans: false,
        dayOfWeek: undefined
      };

    if (this.dialogConfig?.onSubmit) {
      this.confirmAndApplyToFutureDailyPlans(formData, (finalFormData) => {
        this.dialogConfig?.onSubmit!(finalFormData);
      });
    }

    } else {
      this.ref.close({ success: false });
    }
  }

  cancel(): void {
    this.jobPackageForm.reset();
    this.ref.close({ success: false });
  }

  confirmAndApplyToFutureDailyPlans<T extends { resetFuturePlans?: boolean; dayOfWeek?: string }>(request: T, callback: (request: T) => void): void {
  
    request.dayOfWeek = this.selectedDayOfWeek;
  
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
            `This action will reset the following existing future daily plans for ${this.selectedDayOfWeek} to match the updated base plan.`,
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
          // Cancel - close the add/edit dialog without saving
          this.ref.close({ success: false });
          return;
        }
        
        request.resetFuturePlans = result.action === FuturePlansDialogAction.Update;
        callback(request);
      });
    };
  
    tryOpenDialog();
  }
  

}
