import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material';
import { LoginComponent } from '../authentication/login/login.component';
import { AuthenticationService } from '../authentication/authentication.service';
import { NavigationItem } from './navigation-item';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  navigationItems: Array<NavigationItem> = [
    new NavigationItem('books', '/books', 'book'),
    new NavigationItem('settings', '/settings', 'cog')
  ];

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
  }

  setNavigationItem(path: string): void {
    // reset
    this.navigationItems.forEach(_ => (_.isActive = false));
    // TODO /notes path
    const currentItem = this.navigationItems.find(_ => path.startsWith(_.routerLink));
    // and set
    if (currentItem) {
      currentItem.isActive = true;
    }
  }

  openBooks(): void {
    this.router.navigate(['books']);
  }

  openSettings(): void {
    this.router.navigate(['settings']);
  }

  login(): void {
    const dialogRef = this.dialog.open(LoginComponent);

    // dialogRef.afterClosed().subscribe(() => {
    //   // TODO ?
    // });
  }
}
