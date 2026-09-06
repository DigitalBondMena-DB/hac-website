import { Component, Input, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { ICategory } from '@core/interfaces/common.model';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { CategoriesSkeletonComponent } from '@shared/components/skeleton/categories-skeleton/categories-skeleton.component';
interface Category {
  id: number;
  subcategoryId: number;
  en_name: string;
  ar_name?: string;
  en_slug?: string;
  ar_slug?: string;
  active_status?: number;
  order_view?: number;
  created_at?: string;
  updated_at?: string;
  imgPath?: string;
}
@Component({
  selector: 'app-sections',
  standalone: true,
  imports: [TranslateModule, RouterModule, CategoriesSkeletonComponent, ImageUrlDirective],
  templateUrl: './sections.component.html',
  styleUrl: './sections.component.css',
})
export class SectionsComponent implements OnInit {
  @Input({ required: true }) categories: ICategory[] = [];

  private languageService = inject(LanguageService);

  currentLang = 'en';

  ngOnInit() {
    this.languageService.getLanguage().subscribe((lang) => {
      this.currentLang = lang;
    });
  }
}
