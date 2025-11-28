export interface RouteSegment {
  start: L.LatLng;
  end: L.LatLng;
  distance: number;
  isDashed: boolean; // true for same job (start->end), false for between jobs
}