import { Injectable, OnInit } from '@angular/core';
import { NavigationItem } from './navigation-item';
import { Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, skip } from 'rxjs/operators';
import { NGXLogger } from 'ngx-logger';

@Injectable()
export class MenuService {
  navigationItems: Array<NavigationItem> = [
    new NavigationItem(MenuName.NOTES, 'sticky-note', '/notes', true),
    new NavigationItem(MenuName.BOOKS, 'book', '/books'),
    new NavigationItem(MenuName.SETTINGS, 'cog', '/settings')
  ];
  OnNavigated: Observable<NavigationEnd>;

  constructor(private router: Router, private logger: NGXLogger) {
    this.OnNavigated = this.router.events.pipe(
      skip(1),
      filter(e => e instanceof NavigationEnd),
      map(ne => <NavigationEnd>ne)
    );

    this.OnNavigated.subscribe(e => {
      this.saveRoutingUrl(e.urlAfterRedirects);
    });
  }

  registerMenuAction(name: MenuName, action: () => void): void {
    const target = this.navigationItems.find(_ => _.name === name);
    if (target) {
      target.action = action;
    }
  }

  saveRoutingUrl(url: string): void {
    this.logger.debug('[routing] saving ' + url);
    localStorage.setItem('previousRoute', url);
  }
}

export enum MenuName {
  NOTES = 'notes',
  BOOKS = 'books',
  SETTINGS = 'settings'
}
