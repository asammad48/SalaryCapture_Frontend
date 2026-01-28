import { Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePicker } from 'primeng/datepicker';
import { Permissions } from '../../core/domain/constants/claims.constants';
import { TableModule } from 'primeng/table';

import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TagModule } from 'primeng/tag';
import { AppPortalBase } from '../base/app-base/app.base';
import { NewUserDialogComponent } from './new-user-dialog/new-user-dialog.component';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';
import { User } from '../../core/domain/models/user.model';
import { ApiResponse } from 'core-ui-admin-library/src/lib/core/domain/models/shared/response.model';
import { lastValueFrom, takeUntil } from 'rxjs';
import { Checkbox, CheckboxModule } from 'primeng/checkbox';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserFilterRequest } from '../../core/domain/requests';
import { DateTime } from 'luxon';
import { AccessService } from '../../data/repositories/access/access.service';
import { Role } from '../../core/domain/models/role.model';
import { UsersRepository } from '../../core/repositories/users.repository';
import { Menu } from 'primeng/menu';
import { Popover, PopoverModule } from 'primeng/popover';
import { formatDateToDDMMYYYY } from '../../data/shared/helper.function';
import { ProgressLoadingComponent } from "../shared/progress-loading/progress-loading.component";
import { RegionListDialogComponent } from './region-list-dialog/region-list-dialog.component';
import { AreaListDialogComponent } from './area-list-dialog/area-list-dialog.component';
import { UsersNswagRepository } from '../../data/repositories/users/users.nswag.repository';
import { LoaderService } from '../../data/shared/loader.service';

@Component({
  selector: 'lib-user-management',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    BreadcrumbModule,
    TagModule,
    DatePicker,
    CheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    Checkbox,
    Menu,
    PopoverModule,
    ProgressLoadingComponent
],
  templateUrl: './user-management.component.html',
})
export class UserManagementComponent
  extends AppPortalBase
  implements OnInit, OnDestroy
{
  items: MenuItem[] = [];
  home: MenuItem | undefined;
  userManagement: User[] = [];
  roles: Role[] = [];
  //hasAccess = false;
  userFilters!: FormGroup;
  dropdownState: { [key: string]: boolean } = {};
  @ViewChild('nameFilter') nameFilter!: Popover;
  @ViewChild('userFilter') userFilter!: Popover;
  @ViewChild('statusFilter') statusFilter!: Popover;
  @ViewChild('roleFilter') roleFilter!: Popover;
  @ViewChild('dateFilter') dateFilter!: Popover;
  isFilterApplied = false;
  appliedFilters: { key: string; label: string; value: string }[] = [];

  constructor(
    inject: Injector,
    private fb: FormBuilder,
    private UserRepository: UsersNswagRepository,
    private loaderService: LoaderService,
  ) {
    super(inject);
  }

  statusOptions = [
    { key: 'active', label: 'Active' },
    { key: 'blocked', label: 'Blocked' },
  ];

  allStatusIndeterminate = false;
  allRolesIndeterminate = false;

  ngOnInit() {

    const statusGroup = this.createStatusForm();
    const roleGroup = this.createRoleForm();

    this.items = [{ label: 'User Management' }];
    this.home = { label: 'Daily Planning Portal', routerLink: '' };
    this.userFilters = this.fb.group({
      name: [null],
      userName: [null],
      status: [null],
      role: [null],
      area: [null],
      subArea: [null],
      createdBy: [null],
      createdAt: [null],
      statusFilter: statusGroup,
      roleFilter: roleGroup
    });

    this.getUsers();
    this.getRoles();
    this.checkUserAreaRole();
    this.addGlobalKeyListener();
    this.handleStatusFilterChanges();
  }

  private createStatusForm(): FormGroup {
    const statusGroup = this.fb.group({});

    statusGroup.addControl('all', this.fb.control(false));

    this.statusOptions.forEach(opt =>
      statusGroup.addControl(opt.key, this.fb.control(false))
    );

    return statusGroup;
  }

  private createRoleForm(): FormGroup {
    const roleGroup = this.fb.group({});
    roleGroup.addControl('all', this.fb.control(false));
    return roleGroup;
  }

  private handleStatusFilterChanges() {

      const statusGroup = this.userFilters.get('statusFilter') as FormGroup;

      const getControl = (name: string): FormControl => {

        const ctrl = statusGroup.get(name);

        if (!ctrl) {
          throw new Error(`Control '${name}' not found in statusFilter group`);
        }

        return ctrl as FormControl;
      };

      // handle "all"
      const allControl = getControl('all');

      allControl.valueChanges.subscribe(allChecked => {
        this.statusOptions.forEach(opt => getControl(opt.key).setValue(allChecked, { emitEvent: false }));
      });

      // handle individual options
      this.statusOptions.forEach(opt => {

        const ctrl = getControl(opt.key);

        ctrl.valueChanges.subscribe(() => {

          const allValues = this.statusOptions.map(o => getControl(o.key).value);

          const allChecked = allValues.every(v => v === true);
          const noneChecked = allValues.every(v => v === false);

          allControl.setValue(allChecked, { emitEvent: false });

          this.allStatusIndeterminate = !allChecked && !noneChecked;

        });

      });

  }
  private getSelectedStatus(): boolean | null {

    const statusGroup = this.userFilters.get('statusFilter') as FormGroup;
    const allControl = statusGroup.get('all') as FormControl;

    if (allControl.value) {
      return null;
    }

    const isActive = statusGroup.get('active')?.value;
    const isBlocked = statusGroup.get('blocked')?.value;

    if (isActive) {
      return true;
    }

    if (isBlocked) {
      return false;
    }

    return null;
  }

  applyFilters(id: string) {
    this.toggleDropdown(id);
    this.getUsers();
    this.hideFilters();
    this.isFilterApplied = true;
  }

  resetFilter(id: string) {
    this.userFilters.get(id)?.patchValue(null);
    this.getUsers();
    this.hideFilters();
    this.isFilterApplied = false;
  }

  handleEnterPress(event: any) {
    if (event.key === 'Enter' || event.code === 'Enter') {
      event.preventDefault();
    }
  }

  resetStatusFilter(id: string) {
    const data = this.userFilters.get(id);
    data?.get('all')?.setValue(false);
    data?.get('active')?.setValue(false);
    data?.get('blocked')?.setValue(false);
    this.getUsers();
    this.hideFilters();
  }

  resetRoleFilter(id: string) {
    const data = this.userFilters.get(id);
    if (!data) return;

    // Reset all control
    data.get('all')?.setValue(false);

    // Reset all individual role controls
    this.roles.forEach(role => {
      data.get(role.roleName)?.setValue(false);
    });

    // Reset indeterminate state
    this.allRolesIndeterminate = false;

    this.getUsers();
    this.hideFilters();
  }

  getUsers(): void {
    const filters = this.createFilters();
    this.loaderService.show('UserMgt_ViewUsers');

    this.UserRepository.getUsers(filters)
      .pipe(takeUntil(this.destroyer$))
      .subscribe({
        next: (users: User[]) => {
          this.loaderService.hide('UserMgt_ViewUsers');
          // Clone and modify users locally
          this.userManagement = JSON.parse(JSON.stringify(users));
        },
        error: (err) => {
          this.loaderService.hide('UserMgt_ViewUsers');
          this.showError(err);
        },
      });
  }

  getRoles(): void {
    this.UserRepository.getRoles()
      .pipe(takeUntil(this.destroyer$))
      .subscribe({
        next: (roles: Role[]) => {
          this.roles = roles;
          this.addRoleControlsToForm(roles);
          this.handleRoleFilterChanges();
        },
        error: (error) => {
          this.showError(error);
        },
      });
  }

  private addRoleControlsToForm(roles: Role[]): void {

    const roleGroup = this.userFilters.get('roleFilter') as FormGroup;

    if (!roleGroup) return;

    roles.forEach(role => roleGroup.addControl(role.roleName, this.fb.control(false)));

  }

  private handleRoleFilterChanges(): void {

    const roleGroup = this.userFilters.get('roleFilter') as FormGroup;

    if (!roleGroup) return;

    const getControl = (name: string): FormControl => {

      const ctrl = roleGroup.get(name);

      if (!ctrl) {
        throw new Error(`Control '${name}' not found in roleFilter group`);
      }

      return ctrl as FormControl;
    };

    // Handle "all" checkbox
    const allControl = getControl('all');

    allControl.valueChanges.subscribe(allChecked => {

      this.roles.forEach(role => {

        const control = roleGroup.get(role.roleName);

        if (control) {
          control.setValue(allChecked, { emitEvent: false });
        }

      });

    });

    // Handle individual role checkboxes
    this.roles.forEach(role => {

      const control = roleGroup.get(role.roleName);

      if (control) {

        control.valueChanges.subscribe(() => {

          const allValues = this.roles.map(r => {
            const ctrl = roleGroup.get(r.roleName);
            return ctrl ? ctrl.value : false;
          });

          const allChecked = allValues.every(v => v === true);
          const noneChecked = allValues.every(v => v === false);

          allControl.setValue(allChecked, { emitEvent: false });
          this.allRolesIndeterminate = !allChecked && !noneChecked;
        });

      }

    });

  }

  checkUserAreaRole() {
    this.checkUserAreaAccess();
  }

  openMenu(event: MouseEvent, menuRef: Menu) {
    this.stopProp(event);
    menuRef.toggle(event);
    this.hideFilters();
  }

  getUserMenus(item: User): MenuItem[] {
    return [
      {
        label: 'Edit User',
        command: () => this.UpdateUserModal(item),
        disabled: !item.isActive,
        styleClass: !this.accessService.hasPermission(Permissions.USER_MANAGEMENT_EDIT_USER)
          ? 'color-gray-500 pe-none'
          : 'color-gray-900',
      },
      {
        label: item.isActive ? 'Block User' : 'Unblock User',
        command: () =>
          item.isActive
            ? this.disableUserModal(item)
            : this.enableUserModal(item),
        styleClass: item.isActive
          ? !this.accessService.hasPermission(Permissions.USER_MANAGEMENT_DISABLE_USER)
            ? 'color-gray-500 pe-none'
            : 'text-warning'
          : !this.accessService.hasPermission(Permissions.USER_MANAGEMENT_ENABLE_USER)
          ? 'color-gray-500 pe-none'
          : 'text-warning',
      },
      {
        label: 'Delete User',
        command: () => this.deleteUserModal(item),
        styleClass: !this.accessService.hasPermission(Permissions.USER_MANAGEMENT_DELETE_USER)
          ? 'color-gray-500 pe-none'
          : 'text-danger',
      },
    ];
  }

  formatDate(date: Date): string | undefined {
    return formatDateToDDMMYYYY(date);
  }

  UpdateUserModal(user: User): void {
    const ref = this.dialogService.open(NewUserDialogComponent, {
      header: 'Edit user',
      styleClass: 'p-dialog-xl p-dialog-draggable dialog-accent',
      dismissableMask: true,
      closable: true,
      modal: true,
      draggable: true,
      data: {
        user: user,
      },
    });
    
    ref.onClose.subscribe(async (result: ApiResponse<User>) => {
      if (result?.success) {

        this.loaderService.show('UserMgt_ViewUsers');
        
        try {
          await lastValueFrom(
             this.UserRepository.updateUser(result.data)
          );
          this.loaderService.hide('UserMgt_ViewUsers');
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('USER_TITLE'),
            detail: this.translate.instant('USER_UPDATED'),
            life: 3000,
          });

          this.getUsers();
        } catch (error: any) {
          this.showError(error);
        }
      }
    });
  }

  regionsDialog(user: User): void {
    this.dialogService.open(RegionListDialogComponent, {
      header: 'Regions',
      styleClass: 'p-dialog-draggable dialog-accent',
      dismissableMask: true,
      closable: true,
      modal: true,
      draggable: true,
      focusOnShow: false,
      data: {
        user: user,
      },
    });
  }

  areasDialog(user: User): void {
    this.dialogService.open(AreaListDialogComponent, {
      header: 'Areas',
      styleClass: 'p-dialog-draggable dialog-accent',
      dismissableMask: true,
      closable: true,
      modal: true,
      draggable: true,
      focusOnShow: false,
      data: {
        user: user,
      },
    });
  }

  // syncUser(){
  //   this.store
  //         .dispatch(new SyncEligaUsers())
  //         .pipe(
  //           takeUntil(this.destroyer$),
  //           catchError((err) => {
  //             this.messageService.clear();
  //             this.messageService.add({
  //               severity: 'error',
  //               summary: this.translate.instant('USER_TITLE'),
  //               detail: err.message,
  //             });
  //             return EMPTY;
  //           })
  //         )
  //         .subscribe((data) => {
  //           const isSynced = data.userManagement.eligaUsersSynced;
  //           if(isSynced){
  //              this.messageService.clear();
  //                   this.messageService.add({
  //                     severity: 'success',
  //                     summary: this.translate.instant('ELIGA_USERS_SYNCED_TITLE'),
  //                     detail: this.translate.instant('ELIGA_USERS_SYNCED_SUCCESSFULLY'),
  //                   });
  //           }
  //           else {
  //             this.messageService.clear();
  //             this.messageService.add({
  //               severity: 'error',
  //               summary: this.translate.instant('ELIGA_USERS_SYNCED_TITLE'),
  //               detail: this.translate.instant('ELIGA_USERS_SYNCED_ERROR'),
  //             });
  //           }
  //         });
  // }

  deleteUserModal(user: User): void {
    const ref = this.dialogService.open(ConfirmationDialogComponent, {
      header: 'Delete User',
      styleClass: 'p-dialog-danger p-dialog-draggable dialog-accent',
      dismissableMask: true,
      closable: true,
      modal: true,
      draggable: true,
      data: {
        messages: [
          'All the access levels for the following user will be removed permanently.',
          'User:',
          user.name,
          user.role == null ? '-' : user.role,
          'Areas: ' + user.areasCount + ', Sub-areas: ' + user.areas?.length,
        ],
      },
    });

    ref.onClose.subscribe(async (confirmed: boolean) => {
      if (!confirmed) return;

      try {
        this.loaderService.show('UserMgt_ViewUsers');
        await lastValueFrom(
          this.UserRepository.deleteUser(user.id)
        );
        this.loaderService.hide('UserMgt_ViewUsers');
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('USER_TITLE'),
          detail: this.translate.instant('USER_DELETED'),
          life: 3000,
        });

        this.getUsers();
      } catch (error: any) {
        this.showError(error);
      }
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
      summary: this.translate.instant('USER_TITLE'),
      detail: message,
      life: 3000,
    });
  }

  disableUserModal(user: User): void {
    const ref = this.dialogService.open(ConfirmationDialogComponent, {
      header: 'Block User',
      styleClass: 'p-dialog-warning p-dialog-draggable dialog-accent',
      dismissableMask: true,
      closable: true,
      modal: true,
      draggable: true,
      data: {
        messages: [
          'All the access levels for the following user will be disabled until restored manually.',
          'User:',
          user.name,
          user.role == null ? '-' : user.role,
          'Areas: ' + user.areasCount + ', Sub-areas: ' + user.areas?.length,
        ],
      },
    });

    ref.onClose.subscribe(async (confirmed: boolean) => {
      if (!confirmed) return;
      this.loaderService.show('UserMgt_ViewUsers');
      try {
        await lastValueFrom(
          this.UserRepository.disableUser(user)
        );
        this.getUsers();
        this.loaderService.hide('UserMgt_ViewUsers');

        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('USER_TITLE'),
          detail: this.translate.instant('USER_DISABLED'),
          life: 3000,
        });

        // Optional: Update local list if needed
        //const updatedUser = { ...user, isActive: false, status: 'Block' };
        //this.users[i] = updatedUser;
      } catch (error: any) {
        this.showError(error);
      }
    });
  }

  enableUserModal(user: User): void {
    const ref = this.dialogService.open(ConfirmationDialogComponent, {
      header: 'Unblock User',
      styleClass: 'p-dialog-warning p-dialog-draggable dialog-accent',
      dismissableMask: true,
      closable: true,
      modal: true,
      draggable: true,
      data: {
        messages: [
          'All the access levels for the following user will be enabled.',
          'User:',
          user.name,
          user.role == null ? '-' : user.role,
          'Areas: ' + user.areasCount + ', Sub-areas: ' + user.areas?.length,
        ],
      },
    });

    ref.onClose.subscribe(async (confirmed: boolean) => {
      if (confirmed) {
        this.loaderService.show('UserMgt_ViewUsers');
        try {
          await lastValueFrom(
            this.UserRepository.enableUser(user).pipe(
              takeUntil(this.destroyer$)
            )
          );
          this.loaderService.hide('UserMgt_ViewUsers');
          this.getUsers();

          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('USER_TITLE'),
            detail: this.translate.instant('USER_ENABLED'),
            life: 3000,
          });
        } catch (error: any) {
          this.showError(error);
        }
      }
    });
  }

  toggleDropdown(dropdownId: string) {
    this.dropdownState[dropdownId] = !this.dropdownState[dropdownId];
    return this.dropdownState[dropdownId] || false;
  }

  openDropdown(dropdownId: string) {
    this.dropdownState[dropdownId] = true;
  }

  closeDropdown(dropdownId: string) {
    this.dropdownState[dropdownId] = false;
  }

  isDropdownOpen(dropdownId: string): boolean {
    return this.dropdownState[dropdownId] || false;
  }

  ngOnDestroy(): void {
    this.removeGlobalKeyListener();
  }

  addGlobalKeyListener(): void {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  removeGlobalKeyListener(): void {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.code === 'Enter') {
      const key = this.findTrueKey(this.dropdownState);
      if (key) {
        this.applyFilters(key);
      }

      // Add your custom logic here
    }
  }

  findTrueKey(obj: { [key: string]: boolean }): string | undefined {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key]) {
        return key;
      }
    }
    return undefined;
  }

  stopProp(e: any) {
    e.stopPropagation();
    e.preventDefault();
  }

  hideFilters() {
    this.nameFilter.hide();
    this.userFilter.hide();
    this.statusFilter.hide();
    this.roleFilter.hide();
    this.dateFilter.hide();
  }


private getSelectedRoles(): string[] | null {

  const roleGroup = this.userFilters.get('roleFilter') as FormGroup;

  const allControl = roleGroup?.get('all');

  if (!roleGroup || !allControl) return null;

  if (allControl.value) {
    return null;
  }

  // Get selected roles
  const selectedRoles = this.roles
    .filter(role => roleGroup.get(role.roleName)?.value === true)
    .map(role => role.roleName);

  // If at least one role is selected, join them with comma
  if (selectedRoles.length > 0) {
    return selectedRoles;
  }

  return null;
}

createFilters() {

  const selectedStatus = this.getSelectedStatus();

  const selectedRoles = this.getSelectedRoles();

  const createdAtControl = this.userFilters.get('createdAt')?.value;
  const createdAt = createdAtControl ? DateTime.fromJSDate(createdAtControl).toFormat('yyyy-MM-dd').toString() : null;

  const filter: UserFilterRequest = {
    name: this.userFilters.get('name')?.value,
    userName: this.userFilters.get('userName')?.value,
    status: selectedStatus,
    roles: selectedRoles,
    area: this.userFilters.get('area')?.value,
    subArea: this.userFilters.get('subArea')?.value,
    createdBy: this.userFilters.get('createdBy')?.value,
    createdAt: createdAt as string, // Cast to string to satisfy type requirements
  };

  this.updateAppliedFilters(filter);

  return filter;
}

private updateRolesFilter(roles: string[] | null): void {

  if (!roles || roles.length === 0) return;

  // Convert role names to display names
  const displayNames = roles.map(roleName => {
    const role = this.roles.find(r => r.roleName === roleName);
    return role ? role.displayName : roleName;
  });

  // Add to applied filters
  this.appliedFilters.push({
    key: 'roleFilter',
    label: roles.length > 1 ? 'Roles' : 'Role',
    value: displayNames.join(', ')
  });

}

private updateAppliedFilters(filter: UserFilterRequest) {
  this.appliedFilters = [];

  if (filter.name) this.appliedFilters.push({ key: 'name', label: 'Name', value: filter.name });
  if (filter.userName) this.appliedFilters.push({ key: 'userName', label: 'Username', value: filter.userName });
  if (filter.status !== null)
    this.appliedFilters.push({
      key: 'statusFilter',
      label: 'Status',
      value: filter.status ? 'Active' : 'Blocked',
    });

  // Handle roles with the separate method
  if (filter.roles) {
    this.updateRolesFilter(filter.roles);
  }

  if (filter.area) this.appliedFilters.push({ key: 'area', label: 'Area', value: filter.area });
  if (filter.subArea) this.appliedFilters.push({ key: 'subArea', label: 'Sub Area', value: filter.subArea });
  if (filter.createdBy)
    this.appliedFilters.push({ key: 'createdBy', label: 'Created By', value: filter.createdBy });
  if (filter.createdAt)
    this.appliedFilters.push({ key: 'createdAt', label: 'Created At', value: filter.createdAt });

  this.isFilterApplied = this.appliedFilters.length > 0;
}
removeFilter(key: string) {
  if (key === 'statusFilter') {
    this.resetStatusFilter(key);
  } else if (key === 'roleFilter') {
    this.resetRoleFilter(key);
  } else {
    this.userFilters.get(key)?.patchValue(null);
  }
  this.getUsers();
  this.createFilters(); // Refresh appliedFilters
}
}
