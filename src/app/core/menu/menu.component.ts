import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material';
import { LoginComponent } from '../authentication/login/login.component';
import { AuthenticationService } from '../authentication/authentication.service';
import { NavigationItem } from './navigation-item';
import { Observable } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { DataService } from '../data/data.service';
import { MenuService, MenuName } from './menu.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  user: Observable<string>;
  isSyncing = false;

  private navigationItems: Array<NavigationItem>;
  visibleNavigationItems: Array<NavigationItem>;
  selectedNavigationItem: NavigationItem;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private menuService: MenuService,
    private authenticationService: AuthenticationService
  ) {
    this.navigationItems = menuService.navigationItems;
    this.visibleNavigationItems = this.navigationItems.filter(_ => _.isSelected || !_.isInfo);
  }

  ngOnInit() {
    this.router.events.subscribe(e => {
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

    // dialogRef.afterClosed().subscribe(() => {
    //   // TODO ?
    // });
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
