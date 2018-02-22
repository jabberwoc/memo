import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material';
import { LoginComponent } from '../authentication/login/login.component';
import { AuthenticationService } from '../authentication/authentication.service';
import { NavigationItem } from './navigation-item';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  user: Observable<string>;
  private navigationItems: Array<NavigationItem> = [
    new NavigationItem('notes', 'sticky-note', '/notes', true),
    new NavigationItem('books', 'book', '/books'),
    new NavigationItem('settings', 'cog', '/settings')
  ];
  visibleNavigationItems: Array<NavigationItem> = this.navigationItems.filter(
    _ => _.isSelected || !_.isInfo
  );

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit() {
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        console.log('navigation event url: ' + e.urlAfterRedirects);

        this.setNavigationItem(e.urlAfterRedirects);
      }
    });

    this.user = this.authenticationService.loggedInUser;
  }

  private setNavigationItem(path: string): void {
    // reset
    this.navigationItems.forEach(_ => (_.isSelected = false));
    const currentItem = this.navigationItems.find(_ => path.startsWith(_.routerLink));
    // and set
    if (currentItem) {
      currentItem.isSelected = true;
      console.log(currentItem);
    }

    // filter visible
    console.log('filtering navigation items...');
    this.visibleNavigationItems = this.navigationItems.filter(_ => _.isSelected || !_.isInfo);
  }

  public login(): void {
    const dialogRef = this.dialog.open(LoginComponent);

    // dialogRef.afterClosed().subscribe(() => {
    //   // TODO ?
    // });
  }

  public logout(): void {
    this.authenticationService.logout();
  }
}
