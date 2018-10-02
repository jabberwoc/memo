import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoutingInterceptorService implements CanActivate {
  private previousRouteName = 'previousRoute';
  private defaultRoute = '/books';

  constructor(private router: Router) {}

  canActivate(_: ActivatedRouteSnapshot, __: RouterStateSnapshot) {
    const previousRoute = localStorage.getItem(this.previousRouteName);
    console.log('previousRoute: ' + previousRoute);
    if (!previousRoute) {
      console.log('navigating to default route url: ' + this.defaultRoute);
      this.router.navigate([this.defaultRoute]);
    } else {
      console.log('navigating to previous route url: ' + previousRoute);
      this.router.navigate([previousRoute]);
    }
    return false;
  }
}
