import { JobPackageStatus } from "../../constants/filters.constants";
import { DayOfWeek } from "../add-edit-job-package/day-of-week.model";

export interface JobPackageFilters {
  area: string | null;
  areaName?: string | null;
  day?: DayOfWeek | null;
  date?: Date | null;
  status: JobPackageStatus;
}