import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusyComponent } from './busy.component';

@NgModule({
  imports: [CommonModule],
  declarations: [BusyComponent],
  exports: [BusyComponent]
})
export class BusyModule {}
