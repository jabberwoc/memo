import { Injectable } from '@angular/core';
import { NavigationItem } from './navigation-item';

@Injectable()
export class MenuService {
  navigationItems: Array<NavigationItem> = [
    new NavigationItem(MenuName.NOTES, 'sticky-note', '/notes', true),
    new NavigationItem(MenuName.BOOKS, 'book', '/books'),
    new NavigationItem(MenuName.SETTINGS, 'cog', '/settings')
  ];

  constructor() {}

  registerMenuAction(name: MenuName, action: () => void): void {
    const target = this.navigationItems.find(_ => _.name === name);
    if (target) {
      target.action = action;
    }
  }
}

export enum MenuName {
  NOTES = 'notes',
  BOOKS = 'books',
  SETTINGS = 'settings'
}
