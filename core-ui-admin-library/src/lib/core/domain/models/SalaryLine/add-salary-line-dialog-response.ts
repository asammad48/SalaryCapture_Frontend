import { SalaryLineWorkerDto } from "./salary-line-worker-dto";

export interface AddSalaryLineDialogResponse {
  success: boolean;
  salaryLines: SalaryLineWorkerDto[];
  isEdit: boolean;
}
