import { SalaryLineDialogMode } from '../../constants/salary-line-dialogue-mode';
import { GetSalaryLineDto } from '../Salary/salary.model';
import { GetServiceWorkerAgainstSalariesResponse } from '../ServiceWorker/service-worker-against-salaries-response.model';
import { ServiceWorkersByFilterResponse } from '../ServiceWorker/service-worker-by-filter-response.model';
import { SalaryCode } from './salary-code.model';
import { SalaryCaptureFilterRequest } from './salary-capture-filter-request.model';

export interface SalaryLineDialogConfig {
  mode: SalaryLineDialogMode;
  openedFromHeader ?: boolean;
  salaryLine?: GetSalaryLineDto;
  serviceWorkers?: ServiceWorkersByFilterResponse[];
  salaryCode?: SalaryCode;
  organizationUnitId?: string;
  deadlineStartDate?: string;
  deadlineEndDate?: string;
  productionDate?: string;
  timelineStartTime?: string;
  timelineEndTime?: string;
  allServiceWorkers?: ServiceWorkersByFilterResponse[] | [];
  allSalaryCodes: SalaryCode[];
  salaryCaptureFilterRequest?: SalaryCaptureFilterRequest;
  isRegionalScope?: boolean;
  editFromTimeline?: boolean;
}
