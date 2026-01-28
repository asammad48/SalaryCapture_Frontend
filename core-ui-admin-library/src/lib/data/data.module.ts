import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ServiceWorkerService } from './repositories/service-worker/service-worker-web.repository/serviceworker.service';
import { UsersService } from './repositories/usersManagement/users.service';
import { AccessService } from './repositories/access/access.service';
import { ImportService } from './repositories/imports/imports-web.repository/imports.service';

@NgModule({
  imports: [CommonModule, HttpClientModule],
  providers: [
    ServiceWorkerService,
    UsersService,
    AccessService,
    ImportService
  ],
})
export class DataModule { }
