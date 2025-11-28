import { SalaryCaptureFilterRequest } from './salary-capture-filter-request.model';
export interface SalaryLinesRequest {
  salaryLines?: string[];
  salaryStatus?: number;

}export interface SalaryLinesWithParamsRequest {
  salaryLineParams: SalaryLineParams;
  salaryStatus?: number;
}

export interface SalaryLineParams {
  serviceWorkerId: string[];
  salaryBuidlingBrickId?: string;
  organizationUnitId: string;
  durationId?: number;
  toDate?: number;
  fromDate?: number;
}
export interface SalaryLineActionsRequest extends SalaryCaptureFilterRequest {
  salariesLines: SalaryLineIdsForAction[];
  actionId: number;
  forceSaveConflicts?: boolean;
}

export interface SalaryLineIdsForAction {
  ServiceWorkerID: string;
  SalaryLineIDs: string[];
}
