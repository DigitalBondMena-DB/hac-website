import { AsyncPipe } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '@core/services/lang/language.service';
@Component({
  selector: 'app-arrow-button',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
  templateUrl: './arrow-button.component.html',
  styleUrl: './arrow-button.component.css',
})
export class ArrowButtonComponent {
  @Input({ required: true }) title: string = '';
  @Input({ required: true }) px: string = '';
  @Input({ required: true }) py: string = '';
  @Input({ required: true }) type: string = '';
  @Input({ required: true }) gap: string = '';
  @Input({ required: true }) border: string = '';
  @Input({ required: true }) bg: string = '';
  @Input({ required: true }) color: string = '';
  @Input({ required: true }) image: string = '';
  @Input() disabled: boolean = false;

  @Input() pathLink: string = '';

  currentLang$ = inject(LanguageService).getLanguage();
}
