import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private readonly prefix = 'ls_';

  add(key: string, value: any, expiresInHours?: number): boolean {
    return this.set(key, value, expiresInHours);
  }

  get<T>(key: string): T | null {
    const item = localStorage.getItem(this.prefix + key);
    
    if (!item || item === 'null') {
      return null;
    }

    try {
      const data = JSON.parse(atob(item));
      
      if (data.expire) {
        const now = Date.now();
        
        if (data.expire < now) {
          this.remove(key);
          return null;
        }
        
        return data.data;
      }
      
      return data;
    } catch (error) {
      return null;
    }
  }

  remove(...keys: string[]): boolean {
    let result = true;
    
    keys.forEach((key: string) => {
      try {
        localStorage.removeItem(this.prefix + key);
      } catch (error) {
        result = false;
      }
    });
    
    return result;
  }

  keys(): string[] {
    const prefixLength = this.prefix.length;
    const keys: string[] = [];
    
    for (const key in localStorage) {
      if (key.substring(0, prefixLength) === this.prefix) {
        keys.push(key.substring(prefixLength));
      }
    }
    
    return keys;
  }

  private set(key: string, value: any, expiresInHours?: number): boolean {
    let storageValue = value === undefined ? null : value;

    if (expiresInHours) {
      const expiryDate = Date.now() + (1000 * 60 * 60 * expiresInHours);
      storageValue = JSON.stringify({ data: storageValue, expire: expiryDate });
    } else {
      storageValue = JSON.stringify(storageValue);
    }

    const encodedValue = btoa(storageValue);

    try {
      localStorage.setItem(this.prefix + key, encodedValue);
      return true;
    } catch (error) {
      return false;
    }
  }
}
