// loader.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private counters = new Map<string, number>();
  private loaders = new Map<string, BehaviorSubject<boolean>>();

  private getLoaderSubject(key: string) {
    if (!this.loaders.has(key)) {
      this.loaders.set(key, new BehaviorSubject<boolean>(false));
      this.counters.set(key, 0);
    }
    return this.loaders.get(key)!;
  }

  getLoader(key: string) {
    return this.getLoaderSubject(key).asObservable();
  }

  show(key: string) {
    const subject = this.getLoaderSubject(key);
    const count = (this.counters.get(key) || 0) + 1;
    this.counters.set(key, count);
    subject.next(true);
  }

  hide(key: string) {
    const subject = this.getLoaderSubject(key);
    const count = Math.max((this.counters.get(key) || 1) - 1, 0);
    this.counters.set(key, count);
    if (count === 0) {
      subject.next(false);
    }
  }
}
