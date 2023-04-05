import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusyComponent } from './busy/busy.component';

@NgModule({
  imports: [CommonModule],
  declarations: [BusyComponent],
  exports: [BusyComponent]
})
export class SharedModule { }
