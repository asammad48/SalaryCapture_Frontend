import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class LocalStorageService {
    private prefix = "ls_"

    public add(key: string, value: any, expires?: number): boolean {
        return this.set(key, value, expires);
    }

    public get<T>(key: string): T | null {
        const item = localStorage.getItem(this.prefix + key);
        // FIXME: not a perfect solution, since a valid 'null' string can't be stored
        if (!item || item === 'null') {
            return null;
        }

        try {
            //decode back bas64 to Json data
            const data = JSON.parse(atob(item));
            if (data.expire) {
                const now = Date.now();

                // delete the key if it timed out
                if (data.expire < now) {
                    this.remove(key);
                    return null;
                }

                return data.data;
            }
            return data;
        } catch (e) {
            return null;
        }
    }

    public length(): number {
        let count = 0;
        const storage = localStorage;
        for (let i = 0; i < storage.length; i++) {
            if (storage.key(i)?.indexOf(this.prefix) === 0) {
                count += 1;
            }
        }
        return count;
    }

    public keys(): Array<string> {

        const prefixLength = this.prefix.length;
        const keys: Array<string> = [];
        for (const key in localStorage) {
            // Only return keys that are for this app
            if (key.substr(0, prefixLength) === this.prefix) {
                try {
                    keys.push(key.substr(prefixLength));
                } catch (e) {
                    return [];
                }
            }
        }
        return keys;
    }

    public remove(...keys: Array<string>): boolean {
        let result = true;
        keys.forEach((key: string) => {

            try {
               localStorage.removeItem(this.prefix + key);
            } catch (e) {
                result = false;
            }
        });
        return result;
    }

    public removeSingle(key: string): boolean {
      let result = true;
      try {
        localStorage.removeItem(key);
     } catch (e) {
         result = false;
     }
      return result;
  }

    private set(key: string, value: any, expires?: number): boolean {
        // Let's convert `undefined` values to `null` to get the value consistent
        if (value === undefined) {
            value = null;
        } else {
            if (expires) {
                const expiryDate = Date.now() + (1000 * 60 * 60 * expires); //convert into Milliseconds
                value = JSON.stringify({ data: value, expire: expiryDate })
            }
            else {
                value = JSON.stringify(value);
            }
        }

        //Encode JSON data into base64
        value = btoa(value);

        try {
            localStorage.setItem(this.prefix + key, value);
        } catch (e) {
            return false;
        }
        return true;
    }
}
