import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportService } from '../data/repositories/imports/imports-web.repository/imports.service';

@NgModule({
  imports: [CommonModule],
  providers: [
    ImportService,
  ],
})
export class CoreModule {}
