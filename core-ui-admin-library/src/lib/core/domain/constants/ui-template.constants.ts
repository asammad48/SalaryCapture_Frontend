export const UI_TEMPLATES = {
  TIME_DISTANCE_CONTROL: 'TimeDistanceControl',
  TIMELINE_INFORMATION_CONTROL: 'TimelineInformationControl'
} as const;

export type UI_TEMPLATE_TYPE = typeof UI_TEMPLATES[keyof typeof UI_TEMPLATES];



