export interface DailyJobsReportDto {
  productionDate: string;
  totalJobs: number;
  completedJobs: number;
  pendingJobs: number;
  totalSalaryLines: number;
  processedSalaryLines: number;
  pendingSalaryLines: number;
  areas: DailyJobsAreaDto[];
}

export interface DailyJobsAreaDto {
  organizationUnitName?: string;
  totalJobs: number;
  completedJobs: number;
  pendingJobs: number;
  totalSalaryLines: number;
  processedSalaryLines: number;
  pendingSalaryLines: number;
}