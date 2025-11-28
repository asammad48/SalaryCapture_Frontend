import { MarkerType } from "../../constants/job-package-map/marker-type.enum";

export interface MapPoint {
  latitude: number;
  longitude: number;
  type: MarkerType;
  jobIndex?: number;
  jobName?: string;
  locationCount?: number;
  label?: string;
}