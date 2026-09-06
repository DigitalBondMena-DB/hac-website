import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-base-banner',
  template: '',
  styles: '',
})
export class BaseBannerComponent {
  @Input({ required: true }) bannerText: string = '';
  @Input({ required: true }) showLeftSideImage: boolean = true;
  @Input({ required: true }) showRightSideImage: boolean = true;
  @Input({ required: true }) bgBanner: boolean = false;
}
