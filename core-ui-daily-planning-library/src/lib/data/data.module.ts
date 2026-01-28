import { NgModule } from '@angular/core';
import { Client, API_BASE_URL } from './api-clients/daily-planning-api.client';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { tokenInterceptor, defaultInterceptor, tenantInterceptor, AccessService } from '@embrace-it/admin-library';
import { httpErrorInterceptor } from '../core/interceptors';
import { DailyPlanningAccessService } from './repositories/access/daily-planning-access.service';


/**
 * Data Module
 * Contains API clients (NSwag generated) and repository implementations
 * Provides concrete implementations of repository abstractions from CoreModule
 */
@NgModule({
  imports: [],
  providers: [
    provideHttpClient(
      withInterceptors(
        [
          defaultInterceptor,
          tenantInterceptor,
          tokenInterceptor,
          httpErrorInterceptor
      ]
    )),
    Client,
    DailyPlanningAccessService,
    AccessService,
    {
      provide: API_BASE_URL,
      useValue: process.env['NX_BASE_DPS_URL']
    }
  ],
  exports: []
})
export class DataModule { }


