import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationUnitDeadlinesWebRepository} from './repositories';
import { OrganizationUnitsDeadLineRepository } from '../core/repositories';
import { HttpClientModule } from '@angular/common/http';
import { UsersRepository } from '../core/repositories/users.repository';
import { UsersWebRepository } from './repositories/usersManagement/users.web-repository';
import { AccessRepository } from '../core/repositories/access.repository';
import { AccessWebRepository } from './repositories/access/accesss.wb-repository';
import { ServiceWorkerService } from './repositories/service-worker/service-worker-web.repository/serviceworker.service';
import { UsersService } from './repositories/usersManagement/users.service';
import { AccessService } from './repositories/access/access.service';
import { ImportService } from './repositories/imports/imports-web.repository/imports.service';
import { DailyJobsService } from './repositories/daily-jobs/daily-jobs.service';

@NgModule({
  imports: [CommonModule, HttpClientModule],
  providers: [
    {provide: UsersRepository, useClass: UsersWebRepository},
    {provide: AccessRepository, useClass:AccessWebRepository},
    {provide: ServiceWorkerService, useClass: ServiceWorkerService},
    {provide: UsersService, useClass: UsersService},
    {provide: AccessService, useClass: AccessService},
    {provide: OrganizationUnitsDeadLineRepository, useClass: OrganizationUnitDeadlinesWebRepository},
    {provide: ImportService, useClass: ImportService },
    {provide: DailyJobsService, useClass: DailyJobsService }
  ],
})
export class DataModule { }
