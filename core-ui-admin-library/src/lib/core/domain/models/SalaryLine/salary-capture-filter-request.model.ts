export interface SalaryCaptureFilterRequest {
  organizationUnitId: string;
  regionId?: string | null;
  durationId: number | null;
  salaryCodeId?: string[] | null;
  statusId?: number[] | null;
  startDate?: string | null;
  endDate?: string | null;
  isRegionalScope?: boolean | null;
}
