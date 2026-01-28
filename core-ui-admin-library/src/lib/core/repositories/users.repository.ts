import { Observable } from 'rxjs';
import { User } from '../domain/models/user.model';

export abstract class UsersRepository {
  abstract getUsers(filters: any): Observable<User[]>;
}
