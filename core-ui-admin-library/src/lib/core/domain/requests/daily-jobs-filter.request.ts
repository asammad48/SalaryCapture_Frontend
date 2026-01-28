export interface DailyJobsFilterRequest {
    productionDate: string | null;
    regionName: string | null;
    areaName: string | null;
    workerSearchTerm: string | null;
    jobNumber: string | null;
    statuses: string[] | null;
}