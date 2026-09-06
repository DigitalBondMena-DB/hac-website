import { Component, Input } from '@angular/core';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { SafeHtmlComponent } from '../../../../core/safe-html/safe-html.component';
@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [ImageUrlDirective, SafeHtmlComponent],
  templateUrl: './service-card.component.html',
  styleUrl: './service-card.component.css',
})
export class ServiceCardComponent {
  @Input({ required: true }) cardTitle: string = '';
  @Input({ required: true }) cardDescription: string = '';
  @Input({ required: true }) cardImagePath: string = '';
  @Input({ required: true }) isCenter: boolean = false;
}
