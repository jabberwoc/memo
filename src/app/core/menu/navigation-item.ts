export class NavigationItem {
  readonly name: string;
  readonly routerLink: string;
  readonly icon: string;
  readonly isInfo: boolean;
  isSelected: boolean;

  constructor(name: string, icon: string, routerLink: string, isInfo: boolean = false) {
    this.name = name;
    this.icon = icon;
    this.routerLink = routerLink;
    this.isInfo = isInfo;
  }
}
