import {Component, Input} from "@angular/core";
import {CommonModule} from '@angular/common';
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {OverlayModule} from "primeng/overlay";
import { LoaderService } from "../../../data/shared/loader.service";

@Component({
  selector: 'progress-loading',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule, OverlayModule],
  templateUrl: './progress-loading.component.html',
  styles: []
})
export class ProgressLoadingComponent {
  @Input() loaderKey!: string;

  constructor(public loaderService: LoaderService) {}

  get isLoading$() {
    return this.loaderService.getLoader(this.loaderKey);
  }
}
