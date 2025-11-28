import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoaderService } from '../../../../data/shared/loader.service';

@Component({
  selector: 'dp-progress-loading',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  templateUrl: './progress-loading.component.html',
  styleUrls: ['./progress-loading.component.scss']
})
export class ProgressLoadingComponent {
  @Input() loaderKey!: string;

  constructor(public loaderService: LoaderService) {}

  get isLoading$() {
    if (!this.loaderKey) {
      console.warn('ProgressLoadingComponent: loaderKey is required but not provided');
      return this.loaderService.getLoader('default');
    }
    return this.loaderService.getLoader(this.loaderKey);
  }
}
