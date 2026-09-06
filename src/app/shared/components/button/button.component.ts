import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
})
export class ButtonComponent {
  @Input({ required: true }) title: string = '';
  @Input({ required: true }) px: string = '';
  @Input({ required: true }) py: string = '';
  @Input({ required: true }) type: string = '';
  @Input() disabled: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() ariaLabel: string | null = null;
}
