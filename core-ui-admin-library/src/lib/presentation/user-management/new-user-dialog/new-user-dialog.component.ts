import { Component, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { AccordionModule } from 'primeng/accordion';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { Permissions } from '../../../core/domain/constants/claims.constants';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User, UserAreas } from 'core-ui-admin-library/src/lib/core/domain/models/user.model';
import { AppPortalBase } from '../../base/app-base/app.base';
import { Role } from 'core-ui-admin-library/src/lib/core/domain/models/role.model';
import { Area } from 'core-ui-admin-library/src/lib/core/domain/models/area.model';
import { ApiResponse } from 'core-ui-admin-library/src/lib/core/domain/models/shared/response.model';
import { AreaRole } from 'core-ui-admin-library/src/lib/core/domain/models/areaRole.model';
import { AccessService } from 'core-ui-admin-library/src/lib/data/repositories/access/access.service';
import { takeUntil } from 'rxjs';
import { UsersService } from 'core-ui-admin-library/src/lib/data/repositories/usersManagement/users.service';
import { ProgressLoadingComponent } from '../../shared/progress-loading/progress-loading.component';
import { TenantConfigurationService } from '../../services/tenant-configuration.service';

@Component({
  selector: 'lib-new-user-dialog',
  imports: [
    CommonModule,
    FormsModule,
    CheckboxModule,
    Select,
    ReactiveFormsModule,
    AccordionModule,
    ProgressLoadingComponent
  ],
  providers: [AccessService, UsersService],
  templateUrl: './new-user-dialog.component.html'
})
export class NewUserDialogComponent extends AppPortalBase {

  Permissions = Permissions;

  canEditModuleAccess = false;        // show module section at all?
  canEditSalaryAccess = false;        // show salary checkbox?
  canEditDailyPlanningAccess = false; // show planning checkbox?

  selectedUser: any;
  options: Role[] = [];
  areaRoles: AreaRole[] = [];

  subareasId: string[] = [];

  formGroup: FormGroup;

  isPasswordVisible = false;
  isRoleLoading = false;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private fb: FormBuilder,
    private UserRepository: UsersService,
    inject: Injector,
    private tenantConfig: TenantConfigurationService
  ) {
    super(inject);
    this.formGroup = this.fb.group({
      role: [],
      hasSalaryCapture: [false],
      hasDailyPlanning: [false],
      areasCtrl: this.fb.array([])
    });
  }

  private addAreaForm() {
    return this.fb.group({
      areaState: [null],
      areaRole: [],
      subareaCtrl: this.fb.array([])
    });
  }

  private addSubAreaForm() {
    return this.fb.group({
      subareaState: [],
      subareaRole: []
    });
  }

  ngOnInit(): void {
    // editable only when tenant is in dual-module mode
    this.canEditSalaryAccess = false;
    this.canEditDailyPlanningAccess = this.tenantConfig.isDailyPlanningAccessEditable();
    this.canEditModuleAccess = this.canEditSalaryAccess || this.canEditDailyPlanningAccess;

    this.openingHoursFunc();
    this.selectedUser = this.config.data?.user;
    this.getAllAreas();
    this.createForm();
    this.getAreasRoles();
  }

  getAllAreas(): void {
    this.UserRepository.getAreas()
      .pipe(takeUntil(this.destroyer$))
      .subscribe({
        next: (response: any) => {
          this.regions = JSON.parse(JSON.stringify(response.data));
          this.createForm();
        },
        error: (err) => this.showError(err)
      });
  }

  getAreasRoles(): void {
    this.UserRepository.getAreaRoles()
      .pipe(takeUntil(this.destroyer$))
      .subscribe({
        next: (response: any) => {
          this.areaRoles = response.data;
        },
        error: (err) => this.showError(err)
      });
  }

  private showError(error: any): void {
    const message = error?.error?.message
      ? error.error.message
      : error?.error?.errors?.[0]
        ? error.error.errors[0]
        : this.translate.instant('SOMETHING_WENT_WRONG_TRY_AGAIN');

    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('AREA_ROLES_TITLE'),
      detail: message,
      life: 3000,
    });
  }

  createForm() {
    this.regions = this.regions.sort((a, b) => a.displayName.localeCompare(b.displayName));

    for (let index = 0; index < this.regions.length; index++) {
      this.getAreasCtrl.push(this.addAreaForm());
      const subareas = this.regions[index].subAreas!;
      if (subareas) {
        for (let i = 0; i < subareas.length; i++) {
          this.getSubAreasCtrl(index).push(this.addSubAreaForm());
          if (
            this.selectedUser &&
            this.selectedUser.areas.length > 0 &&
            this.selectedUser.areas?.filter((x: UserAreas) => x.subareaId === subareas[i].areaId).length > 0
          ) {
            const selectedSubarea = this.selectedUser.areas?.filter(
              (x: UserAreas) => x.subareaId === subareas[i].areaId
            );

            this.getSubAreasCtrl(index).controls[i].get('subareaState')?.setValue(true);
            this.subareasId.push(selectedSubarea[0].subareaId);

            if (subareas.every(x => this.subareasId.filter(y => x.areaId === y).includes(x.areaId))) {
              this.getAreasCtrl.controls[index].get('areaState')?.patchValue(true);
            } else {
              this.getAreasCtrl.controls[index].get('areaState')?.patchValue(false);
            }

            this.getSubAreasCtrl(index).controls[i]
              .get('subareaRole')
              ?.setValue(selectedSubarea[0].subareaRoleId);
          }
        }
      }
    }

    if (this.selectedUser?.roleId) {
      this.formGroup.get('role')?.patchValue(this.selectedUser.roleId);
    }

    if (this.selectedUser) {
      this.formGroup.patchValue({
        hasSalaryCapture: this.selectedUser.hasSalaryCapture ?? false,
        hasDailyPlanning: this.selectedUser.hasDailyPlanning ?? false
      });
    }
  }

  get getAreasCtrl(): FormArray {
    return this.formGroup.get('areasCtrl') as FormArray;
  }

  getSubAreasCtrl(index: number): FormArray {
    return this.getAreasCtrl.controls[index].get('subareaCtrl') as FormArray;
  }

  showPassword() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  openingHoursFunc(): void {
    this.isRoleLoading = true;
    this.UserRepository.getRoles()
      .pipe(takeUntil(this.destroyer$))
      .subscribe({
        next: (response: any) => {
          this.options = response.data;
          this.isRoleLoading = false;
        },
        error: (err) => this.showError(err)
      });
    this.isRoleLoading = false;
  }

  onAreaCheckboxChange(event: any, area: Area, i: number) {
    const subAreasOfCurrentArea = this.regions.find(x => x.areaId === area.areaId)?.subAreas;

    if (event.checked === true && subAreasOfCurrentArea) {
      const newSubareaIds = subAreasOfCurrentArea
        .map(x => x.areaId)
        .filter(id => !this.subareasId.includes(id));
      this.subareasId = this.subareasId.concat(newSubareaIds);
      this.changeSubAreaState(i, true);
    } else if (event.checked === false && subAreasOfCurrentArea) {
      this.subareasId = this.subareasId.filter(
        x => !subAreasOfCurrentArea?.map(y => y.areaId).includes(x)
      );
      this.changeSubAreaState(i, false);
    }
  }

  private changeSubAreaState(i: number, value: boolean) {
    for (let index = 0; index < this.getSubAreasCtrl(i).controls.length; index++) {
      this.getSubAreasCtrl(i).controls[index].get('subareaState')?.patchValue(value);
    }
  }

  onSubAreaCheckboxChange(
    event: CheckboxChangeEvent,
    subarea: Area,
    parentPosition: number,
    subareaPosition: number
  ) {
    const parentArea = this.regions.find(x => x.areaId === subarea.parentId);

    if (parentArea && event.checked) {
      if (!this.subareasId.includes(subarea.areaId)) {
        this.subareasId.push(subarea.areaId);
      }

      this.getSubAreasCtrl(parentPosition).controls[subareaPosition]
        .get('subareaRole')
        ?.setValidators(Validators.required);
      this.getSubAreasCtrl(parentPosition).controls[subareaPosition]
        .get('subareaRole')
        ?.updateValueAndValidity();

      const parentAreaSubAreaIds = parentArea.subAreas?.map(y => y.areaId);

      if (
        parentAreaSubAreaIds?.every(x =>
          this.subareasId.filter(z => parentAreaSubAreaIds?.includes(z)).includes(x)
        )
      ) {
        this.getAreasCtrl.controls[parentPosition].get('areaState')?.patchValue(true);
      } else {
        this.getAreasCtrl.controls[parentPosition].get('areaState')?.patchValue(false);
      }
    } else if (parentArea && !event.checked) {
      this.subareasId = this.subareasId.filter(x => x !== subarea.areaId);
      const list = parentArea.subAreas?.map(y => y.areaId);

      this.getSubAreasCtrl(parentPosition).controls[subareaPosition]
        .get('subareaRole')
        ?.clearValidators();
      this.getSubAreasCtrl(parentPosition).controls[subareaPosition]
        .get('subareaRole')
        ?.updateValueAndValidity();

      if (
        this.subareasId.length === 0 ||
        list?.every(x => !this.subareasId.filter(z => list?.includes(z)).includes(x))
      ) {
        this.getAreasCtrl.controls[parentPosition].get('areaState')?.patchValue(false);
      } else {
        this.getAreasCtrl.controls[parentPosition].get('areaState')?.patchValue(false);
      }
    }
  }

  onChangeAreaDropdown(event: any, area: Area, areaPosition: number) {
    const subareas = area.subAreas;
    if (subareas) {
      for (let i = 0; i < subareas.length; i++) {
        this.getSubAreasCtrl(areaPosition).controls[i].get('subareaRole')?.patchValue(event.value);
      }
    }
  }

  closeModal(isConfirm: boolean) {
    let response: any = {};

    if (isConfirm) {
      const updatedUser = { ...this.selectedUser } as User;
      updatedUser.roleId = this.formGroup.value.role;

      if (this.canEditModuleAccess) {
        updatedUser.hasSalaryCapture = this.formGroup.value.hasSalaryCapture;
        updatedUser.hasDailyPlanning = this.formGroup.value.hasDailyPlanning;
      }

      const selectedAreas: UserAreas[] = [];
      const areasForm = this.formGroup.value.areasCtrl;

      for (let i = 0; i < areasForm.length; i++) {
        for (let x = 0; x < areasForm[i].subareaCtrl.length; x++) {
          if (areasForm[i].subareaCtrl[x].subareaState) {
            const subarea = this.regions[i].subAreas;
            if (subarea) {
              selectedAreas.push({
                areaRole: this.options.find(
                  v => v.roleId === areasForm[i].subareaCtrl[x].subareaRole
                )?.roleName,
                areaName: this.regions[i].name,
                subareaName: subarea[x].name,
                subareaId: subarea[x].areaId,
                subareaRoleId: '2', // or areasForm[i].subareaCtrl[x].subareaRole
              });
            }
          }
        }
      }

      updatedUser.areas = selectedAreas;

      // if (updatedUser.areas?.some(x => x.subareaRoleId == null)) {
      //   this.messageService.add({
      //     severity: "error",
      //     summary: this.translate.instant('AREA_ROLES_TITLE'),
      //     detail: this.translate.instant("AREAS_WITHOUT_ROLES"),
      //     life: 3000
      //   })
      //   return
      // }


      response = {
        success: isConfirm,
        data: updatedUser
      } as ApiResponse<User>;
    } else {
      response = {
        success: isConfirm
      } as ApiResponse<User>;
    }

    this.ref.close(response);
  }

  stopPropagation(e: any) {
    e.stopPropagation();
    e.preventDefault();
  }
}
