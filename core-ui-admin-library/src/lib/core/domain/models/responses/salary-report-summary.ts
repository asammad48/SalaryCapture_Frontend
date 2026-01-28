export interface SalaryReportSummary {
  organizationUnitId?: string;
  toDate?: Date;
  fromDate?: Date;
  totalServiceWorkers?: number;
  totalSalaryLines?: number;
  approvedSalaryLines?: number;
  rejectedSalaryLines?: number;
  pendingSalaryLines?: number;
  lastExportTime?: Date;
  jobSalaryLines?: number;
  approvedProcessed?: number;
  approvedUnprocessed?: number;
}
