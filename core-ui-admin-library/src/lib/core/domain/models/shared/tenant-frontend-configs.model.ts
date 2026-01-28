export const TenantConfigKeys = {
  CALENDAR_MOVEMENT_INTERVAL: 'CalendarMovementInterval',
} as const;

export type TenantConfigKey = typeof TenantConfigKeys[keyof typeof TenantConfigKeys];

export interface TenantFrontEndConfigs {
  [TenantConfigKeys.CALENDAR_MOVEMENT_INTERVAL]?: string;
}

export const TenantConfigDefaults = {
  CALENDAR_MOVEMENT_INTERVAL: 1,
} as const;
