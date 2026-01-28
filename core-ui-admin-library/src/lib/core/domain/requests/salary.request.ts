import { SalaryCaptureFilterRequest } from './../models/SalaryLine/salary-capture-filter-request.model';

export interface SalaryRequest extends SalaryCaptureFilterRequest {
    serviceWorkerId?: string
}
