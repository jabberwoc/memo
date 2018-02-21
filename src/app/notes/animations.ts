import { animate, AnimationEntryMetadata, state, style, transition, trigger } from '@angular/core';

// Busy animation
export const readyAnimation: AnimationEntryMetadata = trigger('saveState', [
  state(
    'inactive',
    style({
      visibility: 'hidden'
    })
  ),
  state(
    'active',
    style({
      visibility: 'visible'
    })
  ),
  // transition('inactive => active', animate('1000ms ease-in')),
  transition(
    'active => inactive',
    animate(
      1000,
      style({
        opacity: 0
      })
    )
  )
]);

// Component transition animations
export const slideInDownAnimation: AnimationEntryMetadata = trigger('routeAnimation', [
  state(
    '*',
    style({
      opacity: 1
      // transform: 'translateX(0)'
    })
  ),
  transition(':enter', [
    style({
      opacity: 0
      // transform: 'translateX(-100%)'
    }),
    animate('0.2s ease-in')
  ]),
  transition(':leave', [
    animate(
      '0.2s ease-out',
      style({
        opacity: 0
        // transform: 'translateY(100%)'
      })
    )
  ])
]);
