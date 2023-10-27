import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { BusyState } from './busy-state';
import { fadeOutAnimation } from './animations';

@Component({
  selector: 'app-busy',
  templateUrl: './busy.component.html',
  styleUrls: ['./busy.component.css'],
  animations: [fadeOutAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusyComponent {
  @Input()
  size = 5;
  @Input()
  overlay = false;
  @Input()
  fadeOut = false;
  @Input()
  bgColor = 'transparent';
  @Input()
  busyState: BusyState = BusyState.INACTIVE;

  get isBusy(): boolean {
    return this.busyState !== BusyState.INACTIVE;
  }
  @Input()
  set isBusy(value: boolean) {
    if (value) {
      this.busyState = BusyState.ACTIVE;
    } else {
      if (this.fadeOut && this.busyState !== BusyState.INACTIVE) {
        this.busyState = BusyState.FADE_OUT;
        setTimeout(() => {
          this.busyState = BusyState.INACTIVE;
          this.cd.detectChanges();
        }, 0);
      } else {
        this.busyState = BusyState.INACTIVE;
      }
    }
  }

  constructor(private cd: ChangeDetectorRef) { }
}
