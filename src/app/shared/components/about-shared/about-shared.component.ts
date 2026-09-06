import { AsyncPipe, NgClass } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { IAboutUsOne } from 'src/app/pages/about-us/res/about-us.interface';
import { Counter } from 'src/app/pages/home/res/home.interfaces';
import { AboutSkeletonComponent } from '../skeleton/about-skeleton/about-skeleton.component';
import { SloganComponent } from '../slogan/slogan.component';
@Component({
  selector: 'app-about-shared',
  standalone: true,
  imports: [
    NgClass,
    SloganComponent,
    TranslateModule,
    CustomTranslatePipe,
    RouterLink,
    ImageUrlDirective,
    AsyncPipe,
    AboutSkeletonComponent,
  ],
  templateUrl: './about-shared.component.html',
  styleUrl: './about-shared.component.css',
})
export class AboutSharedComponent implements OnInit {
  /* Static Inputs Properties */
  @Input({ required: true }) showBgImage: boolean = false;
  @Input({ required: true }) sloganText: string = '';
  @Input({ required: true }) showSloganText: boolean = true;

  /* Dynamic Inputs Properties */
  @Input({ required: true }) aboutUs!: IAboutUsOne['aboutUs'];
  @Input({ required: true }) counters!: Counter[];

  @Input() mainImage!: string;

  currentImage: string | null = null;
  currentLang$ = inject(LanguageService).getLanguage();
  currentLang = 'en';

  ngOnInit(): void {
    this.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });
  }

  /**
   * Returns all words except the last one from the main_title
   */
  getMainTitleWithoutLastWord(): string {
    const titleField =
      this.currentLang === 'en' ? 'en_main_title' : 'ar_main_title';
    const mainTitle = this.aboutUs?.[titleField] || '';
    const words = mainTitle.trim().split(' ');

    if (words.length <= 1) {
      return '';
    }

    return words.slice(0, -1).join(' ');
  }

  /**
   * Returns only the last word from the main_title
   */
  getLastWordOfMainTitle(): string {
    const titleField =
      this.currentLang === 'en' ? 'en_main_title' : 'ar_main_title';
    const mainTitle = this.aboutUs?.[titleField] || '';
    const words = mainTitle.trim().split(' ');

    if (words.length === 0) {
      return '';
    }

    return words[words.length - 1];
  }
}
