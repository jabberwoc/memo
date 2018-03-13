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
    return this.busyState !== this.inactiveState;
  }
  @Input()
  set isBusy(value: boolean) {
    if (value) {
      this.busyState = this.activeState;
    } else {
      if (this.fadeOut) {
        this.busyState = this.fadeOutState;
        setTimeout(() => (this.busyState = this.inactiveState), 0);
      } else {
        this.busyState = this.inactiveState;
      }
    }
  }

  constructor() {}

  get activeState(): BusyState {
    return BusyState.ACTIVE;
  }

  get fadeOutState(): BusyState {
    return BusyState.FADE_OUT;
  }

  get inactiveState(): BusyState {
    return BusyState.INACTIVE;
  }
}
