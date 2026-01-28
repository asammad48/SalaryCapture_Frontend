export interface DailyJobResponse {
  productionDate: string;          
  regionName: string;
  areaName: string;
  serviceWorkerName: string;
  serviceWorkerUserName: string;
  jobNumber: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
}