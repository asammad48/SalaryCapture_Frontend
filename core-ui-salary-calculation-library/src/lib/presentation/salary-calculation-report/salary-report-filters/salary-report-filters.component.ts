import { Component, EventEmitter, OnDestroy, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { Subject, takeUntil, lastValueFrom } from 'rxjs';
import { SalaryReportRequest } from '../../../core/domain/requests/salary-report.request';
import { formatDateForBackend } from '../../../data/shared/helper.function';
import { Area } from '../../../core/domain/models/area.model';
import { AccessService } from '../../../data/repositories/access/access.service';

@Component({
  selector: 'lib-salary-report-filters',
  imports: [CommonModule, SelectModule, FormsModule, DatePickerModule],
  templateUrl: './salary-report-filters.component.html',
  styleUrl: './salary-report-filters.component.scss',
})

export class SalaryReportFiltersComponent implements OnInit, OnDestroy {

  @Output() filtersApplied = new EventEmitter<SalaryReportRequest>();
  @Output() filterPanelState = new EventEmitter<boolean>();

  private readonly destroy$ = new Subject<void>();

  regions: Area[] = [];
  areas: Area[] = [];
  areaOptions: Area[] = [];

  selectedRegionId = '';
  selectedAreaId = '';

  reportFromDate: Date | undefined = undefined;
  reportToDate: Date | undefined = undefined;

  filterPanelCollapsed = false;
  isLoadingRegions = false;

  constructor(
    private readonly accessService: AccessService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAreas();
  }

  private async loadAreas(): Promise<void> {
    this.isLoadingRegions = true;
    try {
      const response = await lastValueFrom(
        this.accessService.getUserRegions().pipe(
          takeUntil(this.destroy$)
        )
      );
      this.regions = response || [];
      this.isLoadingRegions = false;

      this.setDefaultRegionAndArea();
      this.setTodayDate();

      this.cdRef.detectChanges();
    } catch (error) {
      this.isLoadingRegions = false;
      console.error('Error fetching areas:', error);
      this.regions = [];
    }
  }

  private setDefaultRegionAndArea(): void {

    this.selectedRegionId = '';
    this.selectedAreaId = '';
    this.areaOptions = [];

    if (!this.regions || this.regions.length === 0) return;
    
    const selectedRegion = this.regions[0];
    this.selectedRegionId = selectedRegion.areaId;

    const selectedRegionId = selectedRegion.areaId;
    const allAreasForRegion = this.regions.find(x => x.areaId === selectedRegionId)?.subAreas || [];
    const availableAreas = allAreasForRegion.filter(area => area.parentId === selectedRegionId);
    
    this.areaOptions = [...availableAreas];
    this.areas = allAreasForRegion;
    
    if (availableAreas.length > 0) {
      this.selectedAreaId = availableAreas[0].areaId;
    }

  }

  private setTodayDate(): void {
    const today = new Date();
    this.reportFromDate = today;
    this.reportToDate = today;
  }

  onRegionChange(event: any): void {
    const selectedRegion = event.value;
    this.selectedRegionId = selectedRegion;

    this.areas = this.regions.find(x => x.areaId === selectedRegion)?.subAreas || [];
    const filteredSubAreas = this.areas.filter((x) => x.parentId === selectedRegion);
    this.areaOptions = [...filteredSubAreas];
    this.selectedAreaId = '';

    if (filteredSubAreas.length > 0) {
      this.selectedAreaId = filteredSubAreas[0].areaId;
    }

    this.cdRef.detectChanges();
  }

  onAreaChange(event: any): void {
    this.selectedAreaId = event.value;
  }

  isApplyBtnDisabled(): boolean {
    return !this.selectedAreaId || !this.reportFromDate || !this.reportToDate;
  }

  applyFilters() {

    if (!this.selectedAreaId || !this.reportFromDate || !this.reportToDate) {
      console.warn('All filters are required');
      return;
    }

    const from = formatDateForBackend(this.reportFromDate);
    const to = formatDateForBackend(this.reportToDate);

    if (this.selectedAreaId && from && to) {

      const request: SalaryReportRequest = {
        areaId: this.selectedAreaId,
        fromDate: from,
        toDate: to
      };

      this.filtersApplied.emit(request);
    }

  }

  filterPanelToggler() {
    this.filterPanelCollapsed = !this.filterPanelCollapsed;
    this.filterPanelState.emit(this.filterPanelCollapsed);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
