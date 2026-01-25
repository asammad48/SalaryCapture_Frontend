export enum DailyPlanViewMode {
  BASE_PLAN_FALLBACK = 'BASE_PLAN_FALLBACK',  // Showing base plan (no daily plan exists)
  PREVIOUS_DATES = 'PREVIOUS_DATES',           // Past date - daily plan exists but read-only
  FUTURE_DATES = 'FUTURE_DATES'                // Future date - daily plan exists and editable
}