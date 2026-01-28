export interface GetServiceWorkerAgainstSalariesResponse {
  id: string;
  firstName: string;
  lastName?: string | null;
  userName: string;
  hasConflict?: boolean | null;
  conflictCount: number;
  isExternal: boolean;
}
