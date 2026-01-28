import { CommonModule, NgClass, NgForOf } from '@angular/common';
import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { AppPortalBase } from '../../base/app-base/app.base';
import { Subscription } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { RouterLinkActive, RouterLinkWithHref } from '@angular/router';
import { CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { MenuItemService } from '../menu-item.service';
@Component({
    selector: 'app-sidebar-start',
    imports: [
        CdkDropList,
        RouterLinkWithHref,
        RouterLinkActive,
        NgForOf,
        CommonModule
    ],
    templateUrl: './sidebar-start.component.html',
    styleUrls: [],
    providers: [MenuItemService]
})
export class SidebarStartComponent
  extends AppPortalBase
  implements OnInit, OnDestroy
{
  subscriptions: Subscription[] = [];
  updatedList: any[] = [];
  routeDetails: MenuItem[] | undefined;

  constructor(inject: Injector,private menuItemService: MenuItemService) {
    super(inject);
  }

  ngOnInit(): void {
    const getMainMenuSub = this.menuItemService
      .getMainMenu()
      .subscribe((menuItems: any[]) => {
        if (menuItems) {
          this.routeDetails = [...menuItems];
        } else {
          this.routeDetails = [];
        }
      });
    this.subscriptions.push(getMainMenuSub);
  }

  drop(event: any) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.updatedList = event.container.data;
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
