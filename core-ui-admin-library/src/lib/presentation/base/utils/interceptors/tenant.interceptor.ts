import {HttpInterceptorFn} from "@angular/common/http";
import {inject} from "@angular/core";
import { LocalStorageService } from "../../../services/local-storage.service";
import { LocalStorageKeys } from "core-ui-admin-library/src/lib/data/repositories/access/local-storage-keys";

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
    const localStorage = inject(LocalStorageService);
    const tenantId = localStorage.get<string>(LocalStorageKeys.TENANT_ID);
    const ServiceProviderId = localStorage.get<number>(LocalStorageKeys.SERVICE_PROVIDER_ID);
    const request = req.clone({
        setHeaders: {
            "tenantId": tenantId ?? "",
            "ServiceProviderId": ServiceProviderId?.toString() ?? ""
        }
    });
    return next(request);
};
