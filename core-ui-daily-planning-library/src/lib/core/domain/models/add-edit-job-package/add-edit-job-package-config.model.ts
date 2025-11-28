import { DialogMode } from "../../constants/dialog-mode.enum";
import { PlanningMode } from "../../constants/planning-mode.enum";
import { EditJobPackageData } from "./edit-job-package-data.model";

export interface AddEditJobPackageConfig {
    mode: DialogMode;
    jobPackage?: EditJobPackageData
    path: PlanningMode;
    onSubmit?: (formData: any) => void;
}