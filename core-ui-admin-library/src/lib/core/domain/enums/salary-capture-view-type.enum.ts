export const SalaryCaptureViewType = {
  WORKER_ACCORDION: 'WORKER_ACCORDION',
  WORKER_SALARY: 'WORKER_SALARY'
} as const;

export type SalaryCaptureViewType = typeof SalaryCaptureViewType[keyof typeof SalaryCaptureViewType];
