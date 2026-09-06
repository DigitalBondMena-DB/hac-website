import { Directive, HostBinding, Input, inject } from '@angular/core';
import { ApiService } from '@core/services/conf/api.service';

@Directive({
  selector: '[appImageUrl]',
  standalone: true,
})
export class ImageUrlDirective {
  private _imageService = inject(ApiService);
  private _imageName: string | null = '';
  private _endpoint: string = 'uploads/blogs'; // Default to blogs

  @Input({ required: true }) set appImageUrl(imageName: string) {
    this._imageName = imageName ?? '';
    this.updateSrc();
  }

  @Input({ required: true }) set imageEndpoint(endpoint: string) {
    this._endpoint = endpoint;
    this.updateSrc();
  }

  @HostBinding('src') src: string = '';

  private updateSrc(): void {
    if (this._imageName) {
      this.src = this._imageService.getImageUrl(this._imageName);
    } else {
      // this.src =
      //   'https://digitalbondmena.com/mesoshop/uploads/about/1744811586d5JAxZe3CX.webp';
    }
  }
}
