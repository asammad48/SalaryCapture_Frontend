import { Time } from "@angular/common";
import { DateTime } from "luxon";
import { Tenant } from "../tenant.model";
import { VehicleType } from "../Vehicles/vehicleType.model";
import { Area } from "../area.model";
import { SalaryLine } from "./salaryline.model";
import { VehicleTypeOption } from "../SalaryLine/vehicle-type.model";
import { UI_TEMPLATE_TYPE } from "../../constants/ui-template.constants";
import { SalaryLineGroupedStatuses } from "../../enums/salary-line-grouped-by-status";
import { JobSwipeIntervalDto } from "../SalaryLine/JobSwipeIntervalDto";

export interface Salary{
    salaryLinesCount: number
    salaryJobLineTypeCount: number
    id: string
    serviceWorkerId: string
    productionDate: Date
    organizationUnitId: string
    tenantId?: string
    vehicleTypeId: string
    startTime: DateTime
    endTime: DateTime
    totalTime: string
    kilometers: number,
    sls: number,
    expectedHours: number
    expectedMinutes: number
    trackedHours: number
    trackedMinutes: number
    salaryAmount: number
    statusId: number
    tenant: Tenant
    vehicleType: VehicleType
    OrganizationUnit: Area,
    hasConflict: boolean,
    conflictCount: number,
    hasJobLines: boolean,
    salaryLine: SalaryLine[]
}

export interface PerformCompleteSingleSalaryRequest{
  id: string
  statusId: number,
  organizationUnitId ?: string,
  linetypeId ?: string,
  paymentStatusIds ?: [],
  selectedSalaryLines ?: string[]
}

export interface PerformCompleteSalaryCaptureRequest{
  statusId: number,
  selectedSalaries?: string[]
  selectedSalaryLines?: string[]
}

export interface SalaryResponseDto {
  productionDate: string; // ISO date string (e.g., '2025-04-17')
  serviceWorkerId: string;
  serviceWorkerName: string;
  userName: string;
  tenantId: string;
  vehicleType: string;
  organizationUnitId: string;
  salaryLinesCount: number;
  hasConflict?: boolean;
  conflictCount: number;
  hasJobLines?: boolean;
  statusId?: SalaryLineGroupedStatuses;
  startTime: string; // ISO datetime
  endTime: string;   // ISO datetime
  totalTime?: string; // TimeSpan as string (e.g., '03:37:45.1000000')
  kilometers: number;
  salaryAmount: number;
  salaryLines: GetSalaryLineDto[];
  salaryLinesEcgGraph: GetSalaryLineEcgGraphData[];
  jobEvents: GetSalaryLineJobEvents[];
  jobSwipeInterval: JobSwipeIntervalDto[];
  isReadOnly: boolean;
}

export interface GetSalaryLineDto {
  id: string;
  serviceWorkerId: string;
  serviceWorkerName: string;
  productionDate: string; // ISO date
  organizationUnitId: string;
  jobNumber?: string;
  salaryCode?: string;
  salaryCodeId?: string;
  salaryName?: string;
  salaryUnit?: string;
  salaryCodeUnit?: string;
  salaryCodeValue: number;
  tenantId?: string;
  salaryDescription?: string;
  startTime: string; // ISO datetime
  endTime: string;   // ISO datetime
  totalTime?: string; // Duration as string
  kilometers: number;
  salaryAmount: number;
  statusId?: number;
  startLocation?: string;
  endLocation?: string;
  vehicleType: VehicleTypeOption | null;
  reviewedBy?: string | null;
  reviewedByUserName?: string | null;
  reviewedAt: string; // ISO datetime
  isManual: boolean;
  eventType: number;
  isExported: boolean;
  uiTemplate: UI_TEMPLATE_TYPE;
  hasConflict: boolean;
  isReadOnly: boolean;
}

export interface GetAllSalariesResponse {
  id: string;
  serviceWorkerId: string;
  serviceWorkerName?: string | null;
  userName?: string | null;
  productionDate: string; 
  organizationUnitId: string;
  jobNumber?: string | null;
  salaryCodeId?: string | null;
  salaryCodeUnit?: string | null;
  salaryCode?: string | null;
  salaryName?: string | null;
  salaryUnit?: string | null;
  salaryCodeValue: number;
  tenantId?: string;
  salaryDescription?: string | null;
  startTime: string; 
  endTime: string;  
  totalTime?: string | null; 
  kilometers: number;
  salaryAmount: number;
  statusId?: number | null;
  startLocation?: string | null;
  endLocation?: string | null;
  vehicleType: VehicleTypeOption | null;
  reviewedBy?: string | null;
  reviewedByUserName?: string | null;
  reviewedAt?: string | null; 
  isManual: boolean;
  eventType: number;
  uiTemplate?: UI_TEMPLATE_TYPE | null;
  isExported: boolean;
  hasConflict: boolean;
  isReadOnly: boolean;
}

export interface TimelineJobEvent {
  id: string;
  resourceId: string;
  timelineType: string;
  title: string;
  start: string;
  end: string;
  editable: boolean;
}
export interface TimelineSalaryEvent {
  id: string;
  resourceId: string;
  statusId: number;
  timelineType: string;
  title: string;
  start: string;
  end: string;
  hasConflicts: boolean;
  editable: boolean;
  salaryCode?: string;
  salaryName?: string;
  salaryUnit?: string;
  salaryCodeValue: number;
  description?: string;
}

export interface GetSalaryLineEcgGraphData {
  id: string;
  resourceId: string;
  timelineType: string;
  title: string;
  start: string;
  end: string;
  type: string;
  editable: boolean;
  activityFrequencies: GetSalaryLineEcgActivityFrequency[];
}
export interface GetSalaryLineEcgActivityFrequency {
  start: string;
  end: string;
  count: number;   // raw count of activities
  value: number;   // normalized value 0.0–1.0
}
export interface GetSalaryLineJobEvents {
  eventTime: string;
  eventId: number;
}
