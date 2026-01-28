import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AccessService {
  hasPermission(permission: string): boolean {
    return true;
  }
}
