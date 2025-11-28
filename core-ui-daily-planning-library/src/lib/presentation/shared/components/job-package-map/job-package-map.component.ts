import { MarkerConfig } from './../../../../core/domain/models/job-package-map/marker-config.model';
import { MarkerType } from './../../../../core/domain/constants/job-package-map/marker-type.enum';
import { RouteSegment } from './../../../../core/domain/models/job-package-map/route-segment.model';
import { MARKER_STYLES } from './../../../../core/domain/constants/job-package-map/marker-styles.enum';
import { MapPoint } from './../../../../core/domain/models/job-package-map/map-point.model';
import { MAP_CONFIG } from './../../../../core/domain/constants/job-package-map/map-config.enum';
// job-package-map.component.ts
import { Component, Input, OnDestroy, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { 
  PackageResponseDto, 
  PackageAssignedJob 
} from '../../../../data/api-clients/daily-planning-api.client';

@Component({
  selector: 'app-job-package-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-package-map.component.html',
  styleUrls: ['./job-package-map.component.scss']
})

export class JobPackageMapComponent implements AfterViewInit, OnDestroy, OnChanges {

  @Input() packageDetails?: PackageResponseDto;
  @Input() height: string = '100%';
  @Input() mapId: string = `job-map-${Math.random().toString(36).substr(2, 9)}`;

  private map?: L.Map;
  private mapMarkersLayer?: L.LayerGroup;
  private mapLinesLayer?: L.LayerGroup;
  private distanceTooltips: L.Tooltip[] = [];

  ngAfterViewInit(): void {
    setTimeout(() => this.initializeMap(), 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['packageDetails'] && !changes['packageDetails'].firstChange) {
      this.renderMapData();
    }
  }

  ngOnDestroy(): void {
    this.destroyMap();
  }

  private initializeMap(): void {
    
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    });

    this.map = L.map(this.mapId, {
      center: [MAP_CONFIG.DEFAULT_CENTER.lat, MAP_CONFIG.DEFAULT_CENTER.lng],
      zoom: MAP_CONFIG.DEFAULT_ZOOM,
      attributionControl: false,
      layers: [tileLayer],
      zoomControl: true
    });

    this.mapMarkersLayer = L.layerGroup().addTo(this.map);
    this.mapLinesLayer = L.layerGroup().addTo(this.map);

    this.setupMapEvents();
    this.renderMapData();
  }

  private setupMapEvents(): void {

    if (!this.map) return;

    this.map.on('zoomend', () => {
      this.updateDistanceLabelVisibility();
    });

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      L.DomEvent.stopPropagation(e);
    });

  }

  private renderMapData(): void {

    if (!this.map || !this.packageDetails) return;

    this.clearLayers();

    const mapPoints = this.buildMapPoints();
    const routeSegments = this.buildRouteSegments(mapPoints);

    this.drawRouteLines(routeSegments);
    this.drawMarkers(mapPoints);
    this.fitMapBounds(mapPoints);

    setTimeout(() => this.updateDistanceLabelVisibility(), 100);
  }

  private buildMapPoints(): MapPoint[] {

    const points: MapPoint[] = [];

    if (!this.packageDetails) return points;

    // Start terminal
    if (this.packageDetails.startTerminal?.latitude && this.packageDetails.startTerminal?.longitude) {

      points.push({
        latitude: this.packageDetails.startTerminal.latitude,
        longitude: this.packageDetails.startTerminal.longitude,
        type: MarkerType.START_TERMINAL,
        label: this.packageDetails.startTerminal.name || 'Start Terminal'
      });

    }

    // Default jobs
    const defaultJobs = this.packageDetails.defaultJobs || [];

    defaultJobs.forEach((job, index) => {
      this.addJobPoints(points, job, index + 1);
    });

    // Other jobs (child packages)
    const otherJobs = this.packageDetails.otherJobs || [];
    const startIndex = defaultJobs.length + 1;

    otherJobs.forEach((childPackage, index) => {
      if (childPackage.defaultJobs && childPackage.defaultJobs.length > 0) {
        this.addJobPoints(points, childPackage.defaultJobs[0], startIndex + index);
      }
    });

    // End terminal
    if (this.packageDetails.endTerminal?.latitude && this.packageDetails.endTerminal?.longitude) {
      points.push({
        latitude: this.packageDetails.endTerminal.latitude,
        longitude: this.packageDetails.endTerminal.longitude,
        type: MarkerType.END_TERMINAL,
        label: this.packageDetails.endTerminal.name || 'End Terminal'
      });
    }

    return points;
  }

  private addJobPoints(points: MapPoint[], job: PackageAssignedJob, jobIndex: number): void {

    if (job.startLocation?.latitude && job.startLocation?.longitude) {
      points.push({
        latitude: job.startLocation.latitude,
        longitude: job.startLocation.longitude,
        type: MarkerType.JOB_START,
        jobIndex,
        jobName: job.jobName,
        locationCount: job.totalLocations
      });
    }

    if (job.endLocation?.latitude && job.endLocation?.longitude) {
      points.push({
        latitude: job.endLocation.latitude,
        longitude: job.endLocation.longitude,
        type: MarkerType.JOB_END,
        jobIndex,
        jobName: job.jobName,
        locationCount: job.totalLocations
      });
    }
    
  }

  private buildRouteSegments(points: MapPoint[]): RouteSegment[] {

    const segments: RouteSegment[] = [];

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];

      const start = L.latLng(current.latitude, current.longitude);
      const end = L.latLng(next.latitude, next.longitude);
      const distance = start.distanceTo(end);

      // Dashed line if same job (start to end of same job)
      const isDashed = current.jobIndex === next.jobIndex && current.jobIndex !== undefined;

      segments.push({ start, end, distance, isDashed });
    }

    return segments;
  }

  private drawRouteLines(segments: RouteSegment[]): void {

    if (!this.map || !this.mapLinesLayer) return;

    segments.forEach(segment => {

      const lineStyle: L.PolylineOptions = {
        color: '#444',
        weight: MAP_CONFIG.LINE_WEIGHT,
        opacity: MAP_CONFIG.LINE_OPACITY,
        dashArray: segment.isDashed ? MAP_CONFIG.DASH_PATTERN : undefined
      };

      const polyline = L.polyline([segment.start, segment.end], lineStyle);
      this.mapLinesLayer!.addLayer(polyline);

      // Add distance label only between different jobs (not dashed)
      if (!segment.isDashed) {
        this.addDistanceLabel(segment);
      }

    });

  }

  private addDistanceLabel(segment: RouteSegment): void {
    if (!this.map) return;

    const midpoint = L.latLng(
      (segment.start.lat + segment.end.lat) / 2,
      (segment.start.lng + segment.end.lng) / 2
    );

    const distanceText = this.formatDistance(segment.distance);

    const tooltip = L.tooltip({
      permanent: true,
      direction: 'center',
      className: 'distance-label'
    })
      .setContent(distanceText)
      .setLatLng(midpoint)
      .addTo(this.map);

    this.distanceTooltips.push(tooltip);
  }

  private drawMarkers(points: MapPoint[]): void {
    if (!this.map || !this.mapMarkersLayer) return;

    points.forEach(point => {
      const config = this.getMarkerConfig(point);
      const position = L.latLng(point.latitude, point.longitude);

      const icon = L.divIcon({
        className: 'custom-marker-icon',
        html: config.html,
        iconSize: config.iconSize,
        iconAnchor: config.iconAnchor
      });

      const marker = L.marker(position, { icon })
        .bindTooltip(config.tooltip, {
          permanent: false,
          direction: 'top',
          offset: [0, -20],
          className: 'marker-tooltip'
        });

      this.mapMarkersLayer!.addLayer(marker);
    });
  }

  private getMarkerConfig(point: MapPoint): MarkerConfig {
    const { type, jobIndex, jobName, locationCount, label } = point;

    switch (type) {
      case MarkerType.START_TERMINAL:
        return {
          html: '<div class="marker-terminal marker-terminal-start"><i class="fa fa-home"></i></div>',
          tooltip: `<strong>Start Terminal</strong><br>${label || 'Start'}`,
          iconSize: [MARKER_STYLES.TERMINAL.SIZE, MARKER_STYLES.TERMINAL.SIZE],
          iconAnchor: [MARKER_STYLES.TERMINAL.SIZE / 2, MARKER_STYLES.TERMINAL.SIZE / 2]
        };

      case MarkerType.END_TERMINAL:
        return {
          html: '<div class="marker-terminal marker-terminal-end"><i class="fa fa-home"></i></div>',
          tooltip: `<strong>End Terminal</strong><br>${label || 'End'}`,
          iconSize: [MARKER_STYLES.TERMINAL.SIZE, MARKER_STYLES.TERMINAL.SIZE],
          iconAnchor: [MARKER_STYLES.TERMINAL.SIZE / 2, MARKER_STYLES.TERMINAL.SIZE / 2]
        };

      case MarkerType.JOB_START:
        return {
          html: `<div class="marker-job marker-job-start">${jobIndex}</div>`,
          tooltip: `<strong>Job ${jobIndex} - Start</strong><br>${jobName}<br>${locationCount} Locations`,
          iconSize: [MARKER_STYLES.JOB.SIZE, MARKER_STYLES.JOB.SIZE],
          iconAnchor: [MARKER_STYLES.JOB.SIZE / 2, MARKER_STYLES.JOB.SIZE / 2]
        };

      case MarkerType.JOB_END:
        return {
          html: `<div class="marker-job marker-job-end">${jobIndex}</div>`,
          tooltip: `<strong>Job ${jobIndex} - End</strong><br>${jobName}<br>${locationCount} Locations`,
          iconSize: [MARKER_STYLES.JOB.SIZE, MARKER_STYLES.JOB.SIZE],
          iconAnchor: [MARKER_STYLES.JOB.SIZE / 2, MARKER_STYLES.JOB.SIZE / 2]
        };

      default:
        throw new Error(`Unknown marker type: ${type}`);
    }
  }

  private fitMapBounds(points: MapPoint[]): void {

    if (!this.map || points.length === 0) return;

    const latLngs = points.map(p => L.latLng(p.latitude, p.longitude));

    if (latLngs.length === 1) {
      this.map.setView(latLngs[0], 14);

    } else {
      const bounds = L.latLngBounds(latLngs);
      this.map.fitBounds(bounds, { padding: MAP_CONFIG.FIT_PADDING });
    }

  }

  private updateDistanceLabelVisibility(): void {

    if (!this.map) return;

    const currentZoom = this.map.getZoom();
    const shouldShow = currentZoom > MAP_CONFIG.MIN_ZOOM_FOR_LABELS;

    this.distanceTooltips.forEach(tooltip => {

      const element = tooltip.getElement();

      if (element) {
        
        if (shouldShow) {
          element.classList.remove('distance-hidden');

        } else {
          element.classList.add('distance-hidden');
        }

      }

    });
  }

  private formatDistance(distanceInMeters: number): string {

    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)} m`;
    }

    return `${(distanceInMeters / 1000).toFixed(2)} km`;
  }

  private clearLayers(): void {
    this.mapMarkersLayer?.clearLayers();
    this.mapLinesLayer?.clearLayers();
    this.distanceTooltips.forEach(tooltip => tooltip.remove());
    this.distanceTooltips = [];
  }

  private destroyMap(): void {

    if (this.map) {
      this.map.off();
      this.map.remove();
      this.map = undefined;
    }

  }

  public refreshMap(packageDetails: PackageResponseDto): void {
    this.packageDetails = packageDetails;
    this.renderMapData();
  }

}