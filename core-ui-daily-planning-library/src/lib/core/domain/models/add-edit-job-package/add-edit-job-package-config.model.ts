import { DialogMode } from "../../constants/dialog-mode.enum";
import { PlanningMode } from "../../constants/planning-mode.enum";
import { JobPackageFilters } from "../job-package/job-package-filters.model";
import { EditJobPackageData } from "./edit-job-package-data.model";

export interface AddEditJobPackageConfig {
    mode: DialogMode;
    jobPackage?: EditJobPackageData
    path: PlanningMode;
    dayOfWeek?: string | undefined;
    onSubmit?: (formData: any) => void;
}