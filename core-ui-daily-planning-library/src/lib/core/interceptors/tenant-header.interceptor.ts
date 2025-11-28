import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LocalStorageService } from '../../presentation/services/local-storage.service';
import { LocalStorageKeys } from '../../data/shared/local-storage-keys';

export const tenantHeaderInterceptor: HttpInterceptorFn = (req, next) => {
  const localStorageService = inject(LocalStorageService);
  const tenantId = localStorageService.get<string>(LocalStorageKeys.TENANT_ID);
  const serviceProviderId = localStorageService.get<number>(LocalStorageKeys.SERVICE_PROVIDER_ID);

  const request = req.clone({
    setHeaders: {
      'tenantId': tenantId ?? '',
      'ServiceProviderId': serviceProviderId?.toString() ?? ''
    }
  });

  return next(request);
};
