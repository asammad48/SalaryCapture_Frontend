/**
 * Constants for Salary Line Action Messages
 * Maps action IDs to their corresponding action words and status transitions
 */

export interface SalaryLineActionConfig {
  action: string;
  successAction: string;
  failAction: string;
  fromStatus: string;      // Status required to perform action
  toStatus: string;        // Status after action completes
}

export const SALARY_LINE_ACTION_MESSAGES: Record<number, SalaryLineActionConfig> = {
  2: { 
    action: 'rejected', 
    successAction: 'rejected', 
    failAction: 'reject',
    fromStatus: 'pending',
    toStatus: 'reject'
  },      // Reject - only from pending
  3: { 
    action: 'approved', 
    successAction: 'approved', 
    failAction: 'approve',
    fromStatus: 'pending',
    toStatus: 'approve'
  },     // Approve - only from pending
  6: { 
    action: 'reset', 
    successAction: 'reset', 
    failAction: 'reset',
    fromStatus: 'approved/rejected',
    toStatus: 'reset'
  },             // Reset - only from approved or rejected
  7: { 
    action: 'removed', 
    successAction: 'removed', 
    failAction: 'remove',
    fromStatus: 'pending',
    toStatus: 'remove'
  },        // Remove/Delete - only from pending
};

export const SALARY_LINE_ACTION_TRANSLATION_KEYS = {
  SUCCESS: 'SALARY_LINE_ACTION_SUCCESS',
  FAILED: 'SALARY_LINE_ACTION_FAILED',
} as const;

/**
 * Gets the action word for a given salary line action
 * @param action - Action ID (2: Reject, 3: Approve, 6: Reset, 7: Remove)
 * @param isSuccess - Whether the action was successful
 * @returns The action word to be used in the message
 */
export function getSalaryLineActionWord(action: number, isSuccess: boolean): string {
  const actionConfig = SALARY_LINE_ACTION_MESSAGES[action];
  
  if (!actionConfig) {
    return isSuccess ? 'completed' : 'process';
  }

  return isSuccess ? actionConfig.successAction : actionConfig.failAction;
}

/**
 * Gets the translation key for a salary line action
 * @param isSuccess - Whether the action was successful
 * @returns The translation key to be used
 */
export function getSalaryLineActionTranslationKey(isSuccess: boolean): string {
  return isSuccess ? SALARY_LINE_ACTION_TRANSLATION_KEYS.SUCCESS : SALARY_LINE_ACTION_TRANSLATION_KEYS.FAILED;
}

/**
 * Gets the from and to status for a salary line action
 * @param action - Action ID (2: Reject, 3: Approve, 6: Reset, 7: Remove)
 * @returns Object with fromStatus and toStatus
 */
export function getSalaryLineActionStatuses(action: number): { from: string; to: string } {
  const actionConfig = SALARY_LINE_ACTION_MESSAGES[action];
  
  if (!actionConfig) {
    return { from: 'unknown', to: 'unknown' };
  }

  return {
    from: actionConfig.fromStatus,
    to: actionConfig.toStatus
  };
}
