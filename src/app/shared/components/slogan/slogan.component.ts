import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-slogan',
  standalone: true,
  imports: [NgClass],
  templateUrl: './slogan.component.html',
  styleUrl: './slogan.component.css',
})
export class SloganComponent {
  @Input({ required: true }) sloganTitle: string = '';
  @Input({ required: true }) sloganImage: string = '';
  @Input({ required: true }) haveBg: boolean = false;
}
