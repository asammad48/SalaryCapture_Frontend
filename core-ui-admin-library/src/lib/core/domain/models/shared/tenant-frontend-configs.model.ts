export const TenantConfigKeys = {
  CALENDAR_MOVEMENT_INTERVAL: 'CalendarMovementInterval',
  SALARY_LINE_ACCORDION_PAGE_SIZE: 'SalaryLineAccordionPageSize',
  SALARY_LINE_GRID_PAGE_SIZE: 'SalaryLineGridPageSize',
} as const;

export type TenantConfigKey = typeof TenantConfigKeys[keyof typeof TenantConfigKeys];

export interface TenantFrontEndConfigs {
  [TenantConfigKeys.CALENDAR_MOVEMENT_INTERVAL]?: string;
  [TenantConfigKeys.SALARY_LINE_ACCORDION_PAGE_SIZE]?: string;
  [TenantConfigKeys.SALARY_LINE_GRID_PAGE_SIZE]?: string;
}

export const TenantConfigDefaults = {
  CALENDAR_MOVEMENT_INTERVAL: 1,
  SALARY_LINE_ACCORDION_PAGE_SIZE: 200,
  SALARY_LINE_GRID_PAGE_SIZE: 200,
} as const;