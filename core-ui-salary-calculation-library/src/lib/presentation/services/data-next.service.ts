import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataNextService {
  constructor() {
  }

  basePlanFiltersData = new BehaviorSubject<any>('');
  dailyPlanFiltersData = new BehaviorSubject<any>(false);
  dailyPlanEnableUnlock = new BehaviorSubject<any>('');
  dailyPlanDisabled = new BehaviorSubject<any>('');
  selectedPackageId = new BehaviorSubject<any>('');
  selectedPackageName = new BehaviorSubject<any>('');
  jobPackageOpen = new BehaviorSubject<any>('');
  selectedBasePlanWorkerIndex = new BehaviorSubject<any>('');

  selectedDailyPackageId = new BehaviorSubject<any>('');
  selectedDailyPackageName = new BehaviorSubject<any>('');
  dailyJobPackageOpen = new BehaviorSubject<any>('');
  selectedDailyPlanWorkerIndex = new BehaviorSubject<any>('');
  applyBasePlanFiltersWhenChangesAppliedOnBasePlan = new BehaviorSubject<any>('');
  applyDailyPlanFiltersWhenChangesAppliedOnBasePlan = new BehaviorSubject<any>('');
  getNewDeadlinesData = new BehaviorSubject<any>('');
  getDeadlinesSyncComplete = new BehaviorSubject<boolean>(false);
}
