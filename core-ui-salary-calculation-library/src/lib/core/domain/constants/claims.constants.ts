export const Permissions = {
  // Salary Capture
  SALARY_CAPTURE_ACCESS: 'SalaryCapture_Access',
  SALARY_CAPTURE_SELECT_AREA_FILTER: 'SalaryCapture_Select_Area_Filter',
  SALARY_CAPTURE_SELECT_REGION_FILTER: 'SalaryCapture_Select_Region_Filter',
  SALARY_CAPTURE_SELECT_DURATION_FILTER: 'SalaryCapture_Select_Duration_Filter',
  SALARY_CAPTURE_SELECT_PAYMENTSTATUS_FILTER: 'SalaryCapture_Select_PaymentStatus_Filter',
  SALARY_CAPTURE_SELECT_ROLES_FILTER: 'SalaryCapture_Select_Roles_Filter',
  SALARY_CAPTURE_SELECT_SALARYLINE_FILTER: 'SalaryCapture_Select_SalaryLine_Filter',
  SALARY_CAPTURE_APPLY_FILTERS_BUTTON: 'SalaryCapture_Apply_Filters_Button',
  SALARY_CAPTURE_ADD_SALARYLINE_BUTTON: 'SalaryCapture_Add_SalaryLine_Button',
  SALARY_CAPTURE_ADD_SALARYLINE_KMLINE_RADIO_BUTTON: 'SalaryCapture_Add_SalaryLine_KMLine_Radio_Button',
  SALARY_CAPTURE_ADD_SALARYLINE_TASKLINE_RADIO_BUTTON: 'SalaryCapture_Add_SalaryLine_TaskLine_Radio_Button',
  SALARY_CAPTURE_ADD_SALARYLINE_TOPUPLINE_RADIO_BUTTON: 'SalaryCapture_Add_SalaryLine_TopUpLine_Radio_Button',
  SALARY_CAPTURE_REJECT_BUTTON: 'SalaryCapture_Reject_Button',
  SALARY_CAPTURE_REJECT_SALARY_BUTTON: 'SalaryCapture_Reject_Salary_Button',
  SALARY_CAPTURE_REJECT_SALARYLINE_BUTTON: 'SalaryCapture_Reject_Salaryline_Button',
  SALARY_CAPTURE_REJECT_WORKER_SALARY_AND_SALARYLINES_BUTTON: 'SalaryCapture_Reject_Worker_Salary_And_Salarylines_Button',
  SALARY_CAPTURE_APPROVE_BUTTON: 'SalaryCapture_Approve_Button',
  SALARY_CAPTURE_APPROVE_SALARY_BUTTON: 'SalaryCapture_Approve_Salary_Button',
  SALARY_CAPTURE_APPROVE_SALARYLINE_BUTTON: 'SalaryCapture_Approve_Salaryline_Button',
  SALARY_CAPTURE_APPROVE_WORKER_SALARY_AND_SALARYLINES_BUTTON: 'SalaryCapture_Approve_Worker_Salary_And_Salarylines_Button',
  SALARY_CAPTURE_BACKDATE_SALARY_APPROVAL: 'SalaryCapture_BackDate_Salary_Approval',
  SALARY_CAPTURE_BACKDATE_SALARY_REJECTION: 'SalaryCapture_BackDate_Salary_Rejection',
  SALARY_CAPTURE_EDIT_BUTTON: 'SalaryCapture_Edit_Button',
  SALARY_CAPTURE_EDIT_SALARYLINE_SALARYAMOUNT: 'SalaryCapture_Edit_Salaryline_SalaryAmount',
  SALARY_CAPTURE_EDIT_SALARYLINE_SALARYAMOUNT_BUTTON: 'SalaryCapture_Edit_Salaryline_SalaryAmount_Button',
  SALARY_CAPTURE_EDIT_SALARYLINE_SALARYDESCRIPTION: 'SalaryCapture_Edit_Salaryline_SalaryDescription',
  SALARY_CAPTURE_EDIT_SALARYLINE_SALARYDESCRIPTION_BUTTON: 'SalaryCapture_Edit_Salaryline_SalaryDescription_Button',
  SALARY_CAPTURE_RESET_BUTTON: 'SalaryCapture_Reset_Button',
  SALARY_CAPTURE_REMOVEENTRY_SALARY_BUTTON: 'SalaryCapture_RemoveEntry_Salary_Button',
  SALARY_CAPTURE_REMOVEENTRY_SALARYLINE_BUTTON: 'SalaryCapture_RemoveEntry_Salaryline_Button',
  SALARY_CAPTURE_UNDOREJECTION_SALARY_BUTTON: 'SalaryCapture_UndoRejection_Salary_Button',
  SALARY_CAPTURE_UNDOREJECTION_SALARYLINE_BUTTON: 'SalaryCapture_UndoRejection_Salaryline_Button',
  SALARY_CAPTURE_EXPORT_BUTTON: 'SalaryCapture_Export_Button',
  SALARY_CAPTURE_VIEWDETAILS: 'SalaryCapture_ViewDetails',
  SALARY_CAPTURE_AFTERAPPROVE_EDIT_SALARY_LINE: 'SalaryCapture_AfterApprove_Edit_Salary_Line',
  SALARYCAPTURE_AFTERAPPROVE_REMOVE_SALARY_LINE: 'SalaryCapture_AfterApprove_Remove_Salary_Line',

  // Salary Report
  SALARY_REPORT_PAGE_ACCESS: 'SalaryReport_Page_Access',
  SALARY_REPORT_HISTORY_PAGE_ACCESS: 'SalaryReport_HistoryPage_Access',

  // User Management
  USER_MANAGEMENT_PAGE_ACCESS: 'UserManagement_Page_Access',
  USER_MANAGEMENT_PAGE_VIEWDETAILS: 'UserManagement_Page_ViewDetails',
  USER_MANAGEMENT_EDIT_USER: 'UserManagement_EditUser',
  USER_MANAGEMENT_DISABLE_USER: 'UserManagement_DisableUser',
  USER_MANAGEMENT_ENABLE_USER: 'UserManagement_EnableUser',
  USER_MANAGEMENT_DELETE_USER: 'UserManagement_DeleteUser',
  USER_MANAGEMENT_EDIT_USER_ROLE: 'UserManagement_EditUser_role',
  USER_MANAGEMENT_ASSIGN_AREAS_SUBAREAS: 'UserManagement_AssignAreas_SubAreas',

  // Settings
  SETTINGS_PAGE_ACCESS: 'Settings_Page_Access',
  SETTINGS_PAGE_VIEWDETAILS: 'Settings_Page_ViewDetails',
  SETTINGS_PAGE_SYNCING_VIEW_DETAILS: 'Settings_Page_Syncing_ViewDetails',

  // Sync
  SYNC_ELIGA_WORKERS: 'Sync_ELIGA_Workers',
  SYNC_EKL_WORKERS: 'Sync_EKL_Workers',
  SYNC_USERS: 'Sync_Users',
  SYNC_CARRIERS: 'Sync_Carriers',
  SYNC_VEHICLES: 'Sync_Vehicles',

  // Daily Jobs
  DAILY_JOBS_PAGE_ACCESS: 'DailyJobs_Page_Access',
} as const;


export type PermissionsType = typeof Permissions[keyof typeof Permissions];
