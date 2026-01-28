interface DailyJobsTab {
  path: string;
  label: string;
  icon: string;
}

export const SegmentConstant = 'Segment';

export const USER_ROLES = {
  ADMIN: 'Admin',
  SUPER_USER: 'SuperUser',
  DAILY_USER: 'DailyUser',
  APPROVER: 'Approver'
} as const;

export type UserRoleType = typeof USER_ROLES[keyof typeof USER_ROLES];

export const SALARY_LINE_STATUS = {
  Pending: 1,
  Rejected: 2,
  Approved: 3
} as const;


export const DEADLINE_DURATION =  {
  Today: 1,
  Yesterday: 2,
  Last_3_days: 3,
  Last_week: 4,
  last_2_weeks: 5,
  Last_Salary_Period: 6,
  Upcoming_Deadline_Period: 7,
  Current_Deadline_Period: 8,
  Custom: 9
} as const;

export const ADMIN_ROLES = [USER_ROLES.ADMIN, USER_ROLES.SUPER_USER] as const;

export const ALL_USER_ROLES = [USER_ROLES.ADMIN, USER_ROLES.SUPER_USER, USER_ROLES.DAILY_USER, USER_ROLES.APPROVER] as const;

export const VALIDATION_ERROR_MESSAGES = {
  TIMELINE_RANGE: 'To time must be greater than From time.'
} as const;

export const allowedDeadlineFileTypes = [
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/octet-stream"
];

export const allowedDeadlineFileExtensions = [".csv", ".xlsx", ".xls"];

export const DailyJobsLabels = {
  DAILY_JOBS: 'Daily Jobs',
  DAILY_JOBS_REPORT: 'Daily Jobs Report'
} as const;

export const DailyJobsPaths = {
  DAILY_JOBS_REPORT: 'daily-jobs-report',
  DAILY_JOBS: 'daily-jobs'
} as const;

export const DailyJobsTabs : DailyJobsTab[] = [
  { path: DailyJobsPaths.DAILY_JOBS_REPORT, label: DailyJobsLabels.DAILY_JOBS_REPORT, icon: 'settings' },
  { path: DailyJobsPaths.DAILY_JOBS, label: DailyJobsLabels.DAILY_JOBS, icon: 'settings' }
] as const;

export const MenuActions = {
  REMOVE: 'Remove',
  RESET: 'Reset'
} as const;

export type MenuActionKey = typeof MenuActions[keyof typeof MenuActions];