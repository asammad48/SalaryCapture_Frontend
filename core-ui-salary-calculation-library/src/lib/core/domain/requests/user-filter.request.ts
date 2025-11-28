export interface UserFilterRequest {
    name ?: string,
    userName ?: string,
    status?: boolean | null,
    roles: string[] | null,
    area ?: string,
    subArea ?: string,
    createdBy ?: string,
    createdAt ?: string,
    source ?: string,
    hasSalaryCapture ?: boolean | null,
    hasDailyPlanning ?: boolean | null
}
