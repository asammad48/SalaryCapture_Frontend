import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DragAndDropService {
  constructor() {
  }

  selectedItem = new BehaviorSubject<any>('');
  eventGrab = new BehaviorSubject<any>(null);
  isDragging = new BehaviorSubject<any>('');
  
}
