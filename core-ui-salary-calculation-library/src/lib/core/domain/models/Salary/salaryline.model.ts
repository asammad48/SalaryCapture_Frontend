import { VehicleTypeOption } from "../SalaryLine/vehicle-type.model";

export interface SalaryLine {
    serviceWorkerId: string,
    productionDate: string,
    OrganizationUnitId: string,
    jobNumber: string,
    tenantId: string,
    vehicleTypeId: number,
    salaryDescription: string,
    uiTemplate: string,
    startTime : string,
    endTime: string,
    totalTime: string,
    kilometers: number,
    expectedHours: number,
    expectedMinutes: number,
    trackedHours: number,
    trackedMinutes: number,
    salaryAmount: number,
    lineTypeId: string,
    statusId: number,
    id: string,
    salaryCodeId: string,
    salaryCodeUnit: string,
    line: string,
    payer: string,
    startLocation: string,
    endLocation: string,
    kmTime: string,
    isOverLapping ?: boolean,
    originalAmount ?: number
    originalDescription ?: string
    salaryCodeValue: number,
    salaryCode: string,
    vehicleType: VehicleTypeOption,
    description?: string
    isManual?: boolean
}

export interface PerformSingleSalaryLineRequest{
  id: string
  salaryId: string
  statusId: number
}

export interface EditSalaryLineRequest{
  id: string
  salaryId: string
  salaryAmount: number,
  description: string,
  startTime : string,
  endTime : string
}

export interface CalculateRouteRequest{
  startLocationLatitude: number,
  startLocationLongitude: number,
  endLocationLatitude: number,
  endLocationLongitude: number,
  vehicleTypeId: number,
  vehicleTypeName: string
}
