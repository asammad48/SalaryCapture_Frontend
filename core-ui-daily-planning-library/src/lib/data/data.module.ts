import { NgModule } from '@angular/core';
import { Client, API_BASE_URL } from './api-clients/daily-planning-api.client';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { tokenInterceptor } from '../../../../core-ui-salary-calculation-library/src/lib/presentation/base/utils/interceptors/token.interceptor';
import { httpErrorInterceptor } from '../core/interceptors';
import { DailyPlanningAccessService } from './repositories/access/daily-planning-access.service';
import { AccessService } from '../../../../core-ui-salary-calculation-library/src/lib/data/repositories/access/access.service';
import { defaultInterceptor, tenantInterceptor } from '../../../../core-ui-salary-calculation-library/src/lib/presentation/base/utils/interceptors';


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


