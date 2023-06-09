import {
  animate,
  AnimationTriggerMetadata,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';

// save state animation
export const fadeOutAnimation: AnimationTriggerMetadata = trigger('busyState', [
  state(
    'inactive',
    style({
      visibility: 'collapse'
    })
  ),
  state(
    'active',
    style({
      visibility: 'visible'
    })
  ),
  state(
    'fadeOut',
    style({
      visibility: 'visible'
    })
  ),
  transition(
    'fadeOut => inactive',
    animate(
      1000,
      style({
        opacity: 0
      })
    )
  )
]);
