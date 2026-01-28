import { ExportStatus } from "../../enums/export-status";

export interface ExportedSalaryReportResponse {
  id: string;
  organizationUnitId: string;
  region: string;
  areaName: string;
  generatedByName: string;
  fromDate: Date;
  toDate: Date;
  exportStatus: ExportStatus;
  statusMessage?: string;
  generatedBy?: string;
  generatedByUserName?: string;
  generatedAt?: string;
}
