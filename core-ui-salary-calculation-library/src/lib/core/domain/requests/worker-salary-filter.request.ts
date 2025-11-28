export interface WorkerSalaryFilterRequest {
    code: string | null;
    job: string | null;
    date: Date | null;
    serviceWorker: string | null;
    type: string | null;
    status: number | null;
}