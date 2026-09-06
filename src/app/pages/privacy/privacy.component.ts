import { Component, inject, OnInit } from '@angular/core';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-privacy',
  imports: [TranslateModule],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.css',
})
export class PrivacyComponent implements OnInit{
  private translate = inject(TranslateService);
  private _languageService = inject(LanguageService);
  private langSubscription!: Subscription;
  currentLang = this.translate.currentLang;
  ngOnInit(): void {
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.currentLang = this.translate.currentLang;
    })
  }
}
