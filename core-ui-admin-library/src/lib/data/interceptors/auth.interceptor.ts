
import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocalStorageService } from '../../presentation/services';
import { LocalStorageKeys } from '../repositories/access/local-storage-keys';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private storage: LocalStorageService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    const token = this.storage.get(
      LocalStorageKeys.ACCESS_TOKEN
    );

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req);
  }
}
