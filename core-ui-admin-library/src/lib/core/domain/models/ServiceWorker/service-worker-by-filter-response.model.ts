export interface ServiceWorkersByFilterResponse {
  id: string;
  firstName: string;
  lastName?: string | null;
  userName: string;
  profilePicture?: string | null;
  displayName?: string | null;
}

export interface RegionalWorkerResponse {
  label: string;
  items: ServiceWorkersByFilterResponse[];
}

