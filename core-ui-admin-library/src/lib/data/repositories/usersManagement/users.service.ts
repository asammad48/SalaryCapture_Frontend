import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  getUsers(): Observable<any[]> {
    return of([]);
  }
}
