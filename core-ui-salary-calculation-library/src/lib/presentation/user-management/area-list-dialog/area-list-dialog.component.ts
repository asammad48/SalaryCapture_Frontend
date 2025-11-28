import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import { User, UserAreas } from 'core-ui-salary-calculation-library/src/lib/core/domain/models/user.model';
import { includesIgnoreCase } from 'core-ui-salary-calculation-library/src/lib/data/shared/helper.function';

@Component({
  selector: 'lib-area-dialog',
  imports: [CommonModule, AutoComplete, FormsModule],
  templateUrl: './area-list-dialog.component.html',
})
export class AreaListDialogComponent {

  private readonly user: User | undefined;
  originalAreas: UserAreas[] = [];
  areas: UserAreas[] = [];

  constructor(
    public ref: DynamicDialogRef,
    private readonly config: DynamicDialogConfig,
  ) {
    this.user = this.config.data?.user;
    this.originalAreas = this.user?.areas || [];
    this.areas = [...this.originalAreas];
  }

  searchParam: string | undefined;

  search(event: AutoCompleteCompleteEvent) {

    const query = event.query?.trim().toLowerCase() || '';

    if (!query) {
      this.areas = [...this.originalAreas];
      return;
    }

    this.areas = this.originalAreas.filter(area => includesIgnoreCase(area.subAreaDisplayName, query));
  }

  clearSearch() {
    this.searchParam = '';
    this.areas = [...this.originalAreas];
  }

  onInputChange(event: Event) {

    const input = event.target as HTMLInputElement;

    const value = input.value;

    if (value === '') {
      this.clearSearch();
    }

  }

  closeModal(isConfirm: boolean) {
    this.ref.close(isConfirm);
  }

}
