import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'lib-deadline-periods',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="deadline-periods-container">
    <p>Deadline Periods Component</p>
  </div>`,
})
export class DeadlinePeriodsComponent {}
