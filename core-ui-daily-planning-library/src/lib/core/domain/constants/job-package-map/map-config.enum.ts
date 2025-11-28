export const MAP_CONFIG = {
  DEFAULT_CENTER: { lat: 55.8403369, lng: 12.4287796 } as const,
  DEFAULT_ZOOM: 12,
  FIT_PADDING: [50, 50] as [number, number],
  LINE_WEIGHT: 2,
  LINE_OPACITY: 0.8,
  DASH_PATTERN: '5,5',
  MIN_ZOOM_FOR_LABELS: 11
} as const;