import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const cartItemAnimations = [
  trigger('itemState', [
    state(
      'visible',
      style({
        opacity: 1,
        transform: 'translateX(0)',
        height: '*',
      })
    ),
    state(
      'fadeOut',
      style({
        opacity: 0,
        transform: 'translateX(5%)',
        height: 0,
        marginBottom: 0,
        padding: 0,
        border: 0,
        overflow: 'hidden',
      })
    ),
    transition('visible => fadeOut', [animate('0.5s ease-out')]),
  ]),

  trigger('listAnimation', [
    transition(':enter', [
      style({ transform: 'translateY(5%)', opacity: 0 }),
      animate(
        '0.3s ease-out',
        style({ transform: 'translateY(0)', opacity: 1 })
      ),
    ]),
  ]),
];
