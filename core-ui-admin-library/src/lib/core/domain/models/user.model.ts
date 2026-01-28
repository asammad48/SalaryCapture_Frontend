import { DateTime } from "luxon"

export interface User{
    userId: string
    name: string
    userName?: string
    status?: string
    role?: string
    roleId?: string
    createdBy?: string
    createdAt: DateTime
    areasCount: number
    regionsCount: number
    areas?: UserAreas[]
    regions?: string[]
    isActive: boolean
    id: string,
    hasSalaryCapture : boolean,
    hasDailyPlanning : boolean
  }

  export interface UserAreas{
    areaRole?: string
    areaName?: string
    subareaName?: string
    subAreaDisplayName?: string
    subareaId: string
    subareaRoleId: string
  }
