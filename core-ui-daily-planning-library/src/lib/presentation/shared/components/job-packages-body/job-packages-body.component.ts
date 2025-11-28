import { Component } from '@angular/core';
import { JobPackageAccordionComponent } from '../job-package-accordion/job-package-accordion.component';

@Component({
  standalone: true,
  selector: 'app-job-packages-body',
  templateUrl: './job-packages-body.component.html',
  styleUrls: ['./job-packages-body.component.scss'],
  imports: [JobPackageAccordionComponent]
})
export class JobPackagesBodyComponent {}
