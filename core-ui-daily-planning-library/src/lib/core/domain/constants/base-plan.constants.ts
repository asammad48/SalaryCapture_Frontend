
export enum BasePlanStatus {
    Uploaded = 1,
    Processing = 2,
    Error = 3,
    Scheduled = 4,
    InProgress = 5,
    Completed = 6
}

export const BASE_PLAN_STATUS_REVERSE_MAP: { [key: string]: BasePlanStatus } = {
  Uploaded: BasePlanStatus.Uploaded,
  Processing: BasePlanStatus.Processing,
  Error: BasePlanStatus.Error,
  Scheduled: BasePlanStatus.Scheduled,
  InProgress: BasePlanStatus.InProgress,
  Completed: BasePlanStatus.Completed
};