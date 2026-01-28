export interface SalaryReportRow {
  label: string;
  total?: number | null;
  pending?: number | null;
  approved?: number | null;
  rejected?: number | null;
}
