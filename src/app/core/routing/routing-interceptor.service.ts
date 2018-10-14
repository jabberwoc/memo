import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';

@Injectable({
  providedIn: 'root'
})
export class RoutingInterceptorService implements CanActivate {
  private previousRouteName = 'previousRoute';
  private defaultRoute = '/books';

  constructor(private router: Router, private logger: NGXLogger) {}

  canActivate(_: ActivatedRouteSnapshot, __: RouterStateSnapshot) {
    const previousRoute = localStorage.getItem(this.previousRouteName);
    if (!previousRoute) {
      this.logger.debug(`[routing] to ${this.defaultRoute} (default)`);
      this.router.navigateByUrl(this.router.parseUrl(this.defaultRoute));
    } else {
      this.logger.debug(`[routing] to ${previousRoute} (previous route)`);
      this.router.navigateByUrl(this.router.parseUrl(previousRoute));
    }
    return false;
  }
}
