import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'lib-deadline-periods',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  templateUrl: './deadline-periods.component.html',
})
export class DeadlinePeriodsComponent implements OnInit {
  deadlinePeriods: any[] = [];

  ngOnInit(): void {
  }
}
