export enum SalaryLineActions {
    ExportFile = 1,
    ViewSalaries = 2,
    UpdateSalaryAmount = 3,
    ApproveSalary = 4,
    RejectSalary = 5,
    ResetStatusSalaryLine = 6,
    RemoveSalaryLine = 7,
    AddSalaryLine = 8,
    ApproveSalaryLine = 9,
    RejectSalaryLine = 10,
    ApproveServiceWorker = 11,
    RejectServiceWorker = 12,
}

export enum SalaryStatus
{
    Pending = 1,
    Rejected = 2,
    Approved = 3
}
export enum SalaryLineActionsV1
{
    Pending = 1,
    Rejected = 2,
    Approved = 3,
    Reset = 6,
    Remove = 7
}
