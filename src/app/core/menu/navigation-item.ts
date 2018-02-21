export class NavigationItem {
  name: string;
  routerLink: string;
  icon: string;
  isActive = false;

  // TODO context actions
  constructor(name: string, routerLink: string, icon: string) {
    this.name = name;
    this.routerLink = routerLink;
    this.icon = icon;
  }
}
