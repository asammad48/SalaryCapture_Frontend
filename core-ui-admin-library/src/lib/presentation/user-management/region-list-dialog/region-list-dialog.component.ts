import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import { User } from 'core-ui-admin-library/src/lib/core/domain/models/user.model';
import { includesIgnoreCase } from '../../../data/shared/helper.function';

@Component({
  selector: 'lib-region-dialog',
  imports: [CommonModule, AutoComplete, FormsModule],
  templateUrl: './region-list-dialog.component.html',
})

export class RegionListDialogComponent {

  private readonly user: User | undefined;
  originalRegions: string[] = [];
  regions: string[] = [];

  constructor(
    public ref: DynamicDialogRef,
    private readonly config: DynamicDialogConfig,
  ) {
    this.user = this.config.data?.user;
    this.originalRegions = this.user?.regions || [];
    this.regions = [...this.originalRegions];
  }

  searchParam: string | undefined;

  search(event: AutoCompleteCompleteEvent) {

    const query = event.query?.trim().toLowerCase() || '';

    if (!query) {
      this.regions = [...this.originalRegions];
      return;
    }

    this.regions = this.originalRegions.filter(region => includesIgnoreCase(region, query));
  }

  clearSearch() {
    this.searchParam = '';
    this.regions = [...this.originalRegions];
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
