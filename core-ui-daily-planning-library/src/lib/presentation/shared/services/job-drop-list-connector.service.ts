import { Injectable } from '@angular/core';
import { CdkDropList } from '@angular/cdk/drag-drop';

@Injectable({ providedIn: 'root' })
export class DropListConnectorService {
  private lists: { list: CdkDropList; group: string }[] = [];

  register(list: CdkDropList, group: string) {
    this.lists.push({ list, group });
    this.connectAll();
  }

  private connectAll() {
    this.lists.forEach((current) => {
      const connectedLists = this.lists
        .filter((other) => other !== current && other.group === current.group)
        .map((x) => x.list);

      current.list.connectedTo = connectedLists;
    });
  }

  clear() {
    this.lists = [];
  }
}
