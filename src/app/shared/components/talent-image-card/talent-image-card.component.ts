import { Component, Input } from '@angular/core';
import { isRamadanMonth } from '@core/services/conf/api.config';

@Component({
  selector: 'app-talent-image-card',
  standalone: true,
  imports: [],
  templateUrl: './talent-image-card.component.html',
  styleUrl: './talent-image-card.component.css',
})
export class TalentImageCardComponent {
  @Input({ required: true }) imagePath!: string;
  isRamadanMonth = isRamadanMonth;
}
