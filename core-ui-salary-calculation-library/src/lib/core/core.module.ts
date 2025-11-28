import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalaryLineService } from '../data/repositories/salary-line/salary-line.service';
import { ImportService } from '../data/repositories/imports/imports-web.repository/imports.service';

@NgModule({
  imports: [CommonModule],
  providers: [
    SalaryLineService,
    ImportService,
  ],
})
export class CoreModule {}
