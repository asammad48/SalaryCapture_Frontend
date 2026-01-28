import { Injectable } from '@angular/core';
import { Client } from '../../api-clients/admin-api.client';
import { map } from 'rxjs';
import { mapLastSyncDto } from 'core-ui-admin-library/src/lib/core/mappers';


@Injectable({ providedIn: 'root' })
export class SettingsNswagRepository {

    constructor(
        private client: Client
    ) {}

    syncUsers() {
        return this.client.syncUsers().pipe(
        map(res => {
            if (res.success) {
            return res.data; // usually boolean
            }
            throw new Error(res.message);
        })
        );
    }

    syncServiceWorkers() {
        return this.client.syncServiceWorkers().pipe(
        map(res => {
            if (res.success) {
            return res.data; // boolean
            }
            throw new Error(res.message);
        })
        );
    }

    syncVehicles() {
        return this.client.syncVehicles().pipe(
        map(res => {
            if (res.success) {
            return res.data; // boolean
            }
            throw new Error(res.message);
        })
        );
    }

    getLastSyncTime() {
    return this.client.getLastSyncTime().pipe(
        map(res => {
        if (res.success && res.data) {
            return res.data.map(mapLastSyncDto);
        }
        throw new Error(res.message);
        })
    );
    }

}