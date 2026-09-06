import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { ApiService } from '@core/services/conf/api.service';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { RelatedBlogsSkeletonComponent } from '@shared/components/skeleton/related-blogs-skeleton/related-blogs-skeleton.component';
import { SafeHtmlComponent } from '../../../../core/safe-html/safe-html.component';
import { IRelatedBlogs } from '../../res/interfaces/singleBlog';

@Component({
  selector: 'app-related-blogs',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    SafeHtmlComponent,
    ImageUrlDirective,
    CustomTranslatePipe,
    RelatedBlogsSkeletonComponent,
  ],
  templateUrl: './related-blogs.component.html',
  styleUrl: './related-blogs.component.css',
})
export class RelatedBlogsComponent {
  _languageService = inject(LanguageService);

  _apiService = inject(ApiService);

  currentLang$ = this._languageService.getLanguage();

  getCurrentLang: string = '';

  lang = this._languageService.getIsArabic().subscribe((next) => {
    this.getCurrentLang = next ? 'ar' : 'en';
  });

  @Input({ required: true }) lightLabel: boolean = true;

  @Input({ required: true }) relatedBlogs: IRelatedBlogs[] = [];
}
