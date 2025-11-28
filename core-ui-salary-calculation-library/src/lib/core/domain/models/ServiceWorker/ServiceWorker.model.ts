import { DateTime } from "luxon";
export interface ServiceWorkerResponse {
    id: string,
    firstName: string,
    lastName?: string,
    authCode: string,
    authCodeGeneratedOn: DateTime,
    userType: number,
    statusId: number,
    carrierId?: string,
    lastLoginDeviceId?: string,
    lastActive?: DateTime,
    userName: string,
    email: string,
    passwordHash: string,
    profilePicture: string,
    hasConflict: boolean,
    isAllSalariesCompleted: boolean,
    hasRemainingSalaries: boolean,
    conflictCount: number
}
export interface PerformServiceWorkerSalariesAndSalaryLinesRequest{
  id: string
  statusId: number,
  selectedSalaries?: string[]
  selectedSalaryLines?: string[]
}
