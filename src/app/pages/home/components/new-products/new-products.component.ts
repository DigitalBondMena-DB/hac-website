import { Component, Input, inject } from '@angular/core';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TalentImageCardComponent } from '@shared/components/talent-image-card/talent-image-card.component';
import { BestProduct } from '../../res/home.interfaces';
import { SharedBestSellerComponent } from '../best-seller/components/shared-best-seller/shared-best-seller.component';

@Component({
  selector: 'app-new-products',
  standalone: true,
  imports: [
    SharedBestSellerComponent,
    TalentImageCardComponent,
    TranslateModule,
  ],
  templateUrl: './new-products.component.html',
  styleUrl: './new-products.component.css',
  host: { ngSkipHydration: 'true' },
})
export class NewProductsComponent {
  @Input() bestProducts: BestProduct[] = [];

  descriptions: string[] = [];

  _translate = inject(TranslateService);
  _languageService = inject(LanguageService);

  constructor() {
    this._languageService.getLanguage().subscribe((lang) => {
      this._translate.use(lang).subscribe(() => {
        this._translate
          .get('bestSelling.descriptions')
          .subscribe((descriptions: string[]) => {
            this.descriptions = descriptions;
          });
      });
    });
  }
}
