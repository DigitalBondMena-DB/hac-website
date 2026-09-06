import { Component, Input, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [ImageUrlDirective, TranslateModule, RouterModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
})
export class CardComponent {
  @Input({ required: true }) imgPath: string = '';
  @Input({ required: false }) alt: string = '';
  @Input({ required: true }) title: string = '';
  @Input({ required: false }) categoryId: string | number | null = null;
  @Input({ required: false }) categoryName: string = '';

  private router = inject(Router);
  private languageService = inject(LanguageService);
  public currentLang = 'en';

  ngOnInit() {
    // Subscribe to language changes
    this.languageService.getLanguage().subscribe((lang) => {
      this.currentLang = lang;
    });
  }

  /**
   * Navigate to shopping page filtered by category
   */
  navigateToShopping() {
    if (this.categoryId) {
      this.router.navigate(['/', this.currentLang, 'shopping'], {
        queryParams: { categoryId: this.categoryId },
      });
    }
  }
}
