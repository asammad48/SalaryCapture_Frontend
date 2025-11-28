export enum DayOfWeek {
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
  Sunday = 7
}

export enum JobPackageStatus {
  All = 0,
  AssignedOnly = 1,
  UnassignedOnly = 2
}

export const DAYS_OF_WEEK = [
  { label: 'Mon', value: DayOfWeek.Monday },
  { label: 'Tue', value: DayOfWeek.Tuesday },
  { label: 'Wed', value: DayOfWeek.Wednesday },
  { label: 'Thu', value: DayOfWeek.Thursday },
  { label: 'Fri', value: DayOfWeek.Friday },
  { label: 'Sat', value: DayOfWeek.Saturday },
  { label: 'Sun', value: DayOfWeek.Sunday }
];

export const JOB_PACKAGE_STATUS_LIST = [
  { value: JobPackageStatus.All, label: 'All job packages' },
  { value: JobPackageStatus.AssignedOnly, label: 'Assigned only' },
  { value: JobPackageStatus.UnassignedOnly, label: 'Unassigned only' }
];
