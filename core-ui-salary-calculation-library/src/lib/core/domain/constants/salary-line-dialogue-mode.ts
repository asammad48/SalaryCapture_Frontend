export const SALARY_LINE_DIALOG_MODE = {
  ADD: 'add',
  EDIT: 'edit',
} as const;

export type SalaryLineDialogMode = (typeof SALARY_LINE_DIALOG_MODE)[keyof typeof SALARY_LINE_DIALOG_MODE];
