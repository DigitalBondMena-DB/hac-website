import { isPlatformBrowser } from '@angular/common';
import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Output,
  PLATFORM_ID,
} from '@angular/core';

@Directive({
  selector: '[clickOutside]',
  standalone: true,
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<void>();

  private elementRef = inject(ElementRef);
  private platformId = inject(PLATFORM_ID);

  @HostListener('document:click', ['$event.target'])
  public onClick(target: any): void {
    if (isPlatformBrowser(this.platformId)) {
      const clickedInside = this.elementRef.nativeElement.contains(target);
      if (!clickedInside) {
        this.clickOutside.emit();
      }
    }
  }
}
