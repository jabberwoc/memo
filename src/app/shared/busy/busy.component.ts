import { Component, OnInit, Input } from '@angular/core';
import { BusyState } from './busy-state';
import { fadeOutAnimation } from './animations';

@Component({
  selector: 'app-busy',
  templateUrl: './busy.component.html',
  styleUrls: ['./busy.component.css'],
  animations: [fadeOutAnimation]
})
export class BusyComponent {
  @Input() size = 5;
  @Input() overlay = false;
  @Input() fadeOut = false;
  @Input() busyState: BusyState;

  get isBusy(): boolean {
    return this.busyState !== BusyState.INACTIVE;
  }
  @Input()
  set isBusy(value: boolean) {
    if (value) {
      this.busyState = BusyState.ACTIVE;
    } else {
      if (this.fadeOut) {
        this.busyState = BusyState.FADE_OUT;
        setTimeout(() => (this.busyState = BusyState.INACTIVE), 0);
      } else {
        this.busyState = BusyState.INACTIVE;
      }
    }
  }

  constructor() {}
}
