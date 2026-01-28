import { Injectable } from '@angular/core';
import { Client } from '../../api-clients/admin-api.client';

@Injectable({ providedIn: 'root' })
export class AuthRepository {

    constructor(private client: Client) {}

    login(payload: any) {
        return this.client.login(payload);
    }

    getRoles() {
        return this.client.getRoleClaims();
    }
}
