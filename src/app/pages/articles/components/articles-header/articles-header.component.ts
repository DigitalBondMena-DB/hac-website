import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-articles-header',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './articles-header.component.html',
  styleUrl: './articles-header.component.css',
})
export class ArticlesHeaderComponent {
  @Input({ required: true }) title: string = '';
  @Input({ required: true }) subTitle: string = '';
  @Input({ required: true }) showRotateImage: boolean = false;
  @Input({ required: true }) marginBottom: string = '';
  @Input() headingId: string = 'section-title';
}
