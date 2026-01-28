interface VehicleTypeOption {
  id: string;
  name: string;
}

export interface AddEditSalaryLineDto {
  id?: string | null;
  tenantId?: string | null;
  serviceProviderId?: string | null;
  organizationUnitId?: string;
  productionDate?: string;
  serviceWorkerIds: string[];
  jobNumber?: string;
  salaryCodeId: string;
  salaryCodeValue?: number;
  startTime?: string | null;
  endTime?: string | null;
  startLocation?: string | null;
  endLocation?: string | null;
  kilometers?: number | null;
  totalTime?: string | null;
  vehicleType?: VehicleTypeOption | null;
  forceSaveJobEventConflict?: boolean;
}

