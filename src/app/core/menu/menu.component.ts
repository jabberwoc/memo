import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { AuthenticationService } from '../authentication/authentication.service';
import { NavigationItem } from './navigation-item';
import { Observable, Subscription } from 'rxjs';
import { throttleTime, combineLatest } from 'rxjs/operators';
import { MenuService } from './menu.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LoginComponent } from '../authentication/login/login.component';
import { MemoUser } from '../data/model/memo-user';
import { RemoteState } from '../authentication/remote-state';
import { NotifierService } from 'angular-notifier';
import { NGXLogger } from 'ngx-logger';

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
export class MenuComponent implements OnInit, OnDestroy {
  user: Observable<MemoUser>;
  isSyncing = false;

  private navigationItems: Array<NavigationItem>;
  visibleNavigationItems: Array<NavigationItem>;
  selectedNavigationItem: NavigationItem;
  private syncSub: Subscription;
  state: Observable<RemoteState>;
  REMOTE_STATES = RemoteState;
  isUserSessionAlive: Observable<boolean>;

  constructor(
    private menuService: MenuService,
    private authenticationService: AuthenticationService,
    private dialog: MatDialog,
    private logger: NGXLogger
  ) {
    this.navigationItems = this.menuService.navigationItems;
    this.visibleNavigationItems = this.navigationItems.filter(_ => _.isSelected || !_.isInfo);
    this.user = this.authenticationService.currentUser;
    this.user
      .pipe(
        combineLatest(this.menuService.OnNavigated, (user, ne) =>
          this.saveRoutingUrl(user ? user.name : 'local', ne.urlAfterRedirects)
        )
      )
      .subscribe();
    this.isUserSessionAlive = this.user.pipe(
      combineLatest(
        this.authenticationService.isAlive,
        (user, alive) => user !== null && user.isLoggedIn && alive
      )
    );
    this.syncSub = this.authenticationService.syncChanges.pipe(throttleTime(2000)).subscribe(_ => {
      this.isSyncing = true;
      setTimeout(() => (this.isSyncing = false), 0);
    });
  }

  ngOnInit() {
    this.menuService.OnNavigated.subscribe(e => this.selectNavigationItem(e.urlAfterRedirects));
  }

  ngOnDestroy(): void {
    if (this.syncSub) {
      this.syncSub.unsubscribe();
    }
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
    const dialogRef: MatDialogRef<LoginComponent, MemoUser> = this.dialog.open(LoginComponent);
    // dialogRef.afterClosed().subscribe(..);
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

  private saveRoutingUrl(user: string, url: string): void {
    this.logger.debug(`[routing] saving ${url} (user: ${user})`);
    const storage = localStorage.getItem('previousRoutes');
    const previousRoutes = storage ? JSON.parse(storage) : {};
    previousRoutes[user] = url;
    localStorage.setItem('previousRoutes', JSON.stringify(previousRoutes));
  }
}
