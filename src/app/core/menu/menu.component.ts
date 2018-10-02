import { Component, OnInit } from '@angular/core';
import { NavigationEnd } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';
import { NavigationItem } from './navigation-item';
import { Observable } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { MenuService } from './menu.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatDialog } from '@angular/material';
import { LoginComponent } from '../authentication/login/login.component';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  animations: [
    trigger('growIn', [
      transition('void => *', [style({ height: 0 }), animate(300, style({ height: '*' }))])
    ])
  ]
})
export class MenuComponent implements OnInit {
  user: Observable<string>;
  isSyncing = false;

  private navigationItems: Array<NavigationItem>;
  visibleNavigationItems: Array<NavigationItem>;
  selectedNavigationItem: NavigationItem;

  constructor(
    private menuService: MenuService,
    private authenticationService: AuthenticationService,
    private dialog: MatDialog
  ) {
    this.navigationItems = this.menuService.navigationItems;
    this.visibleNavigationItems = this.navigationItems.filter(_ => _.isSelected || !_.isInfo);
  }

  ngOnInit() {
    this.menuService.OnNavigated.subscribe(e => {
      if (e instanceof NavigationEnd) {
        console.log('navigation event url: ' + e.urlAfterRedirects);

        this.selectNavigationItem(e.urlAfterRedirects);
      }
    });

    this.user = this.authenticationService.loggedInUser;

    this.authenticationService.syncChanges.pipe(throttleTime(2000)).subscribe(_ => {
      this.isSyncing = true;
      setTimeout(() => (this.isSyncing = false), 0);
    });
  }

  private selectNavigationItem(path: string): void {
    // reset
    this.navigationItems.forEach(_ => (_.isSelected = false));
    const targetItem = this.navigationItems.find(_ => path.startsWith(_.routerLink));
    // and set
    if (targetItem) {
      targetItem.isSelected = true;
      this.selectedNavigationItem = targetItem;
    }

    // filter visible
    this.visibleNavigationItems = this.navigationItems.filter(_ => _.isSelected || !_.isInfo);
  }

  login(): void {
    const dialogRef = this.dialog.open(LoginComponent);
    dialogRef.afterClosed().subscribe(() => {
      // TODO notification
    });
  }

  logout(): void {
    this.authenticationService.logout();
  }

  executeAddAction(navigationItem: NavigationItem): void {
    const target = this.navigationItems.find(_ => _ === navigationItem);
    if (target && target.action) {
      target.action();
    }
  }
}
