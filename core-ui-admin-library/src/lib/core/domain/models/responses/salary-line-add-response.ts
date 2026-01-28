import { SalaryLineWorkerDto } from "../SalaryLine/salary-line-worker-dto";

export interface AddSalaryLineResponse {
  approvedSalaryLines: SalaryLineWorkerDto[];
  conflictedSalaryLines: SalaryLineWorkerDto[];
}
