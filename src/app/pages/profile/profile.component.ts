import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ArticlesHeaderComponent } from '../articles/components/articles-header/articles-header.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    RouterOutlet,
    ArticlesHeaderComponent,
    TranslateModule,
    RouterLink,
    RouterLinkActive,
    AsyncPipe,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  animations: [
    trigger('routeAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('buttonHover', [
      state(
        'inactive',
        style({
          transform: 'scale(1)',
        })
      ),
      state(
        'active',
        style({
          transform: 'scale(1.02)',
          backgroundColor: '#cbac8d',
          color: 'white',
        })
      ),
      transition('inactive => active', [animate('200ms ease-out')]),
      transition('active => inactive', [animate('150ms ease-in')]),
    ]),
    trigger('routeContentAnimation', [
      transition('* <=> *', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
  ],
})
export class ProfileComponent implements OnInit {
  _languageService = inject(LanguageService);

  isProfileDetailsRoute$!: Observable<boolean>;

  currentLang$ = this._languageService.getLanguage();

  activeTab = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.isProfileDetailsRoute$ = this.router.events.pipe(
      map(() => {
        const url = this.router.url;
        // Update active tab based on current route
        if (url.includes('/personal')) {
          this.activeTab = 'personal';
        } else if (url.includes('/orders')) {
          this.activeTab = 'orders';
        } else if (url.includes('/address')) {
          this.activeTab = 'address';
        } else if (url.includes('/password')) {
          this.activeTab = 'password';
        } else if (url.includes('/account-management')) {
          this.activeTab = 'account-management';
        }

        return ['/profile/address', '/profile/orders'].some((path) =>
          url.includes(path)
        );
      })
    );
  }

  getButtonState(tab: string): string {
    return this.activeTab === tab ? 'active' : 'inactive';
  }
}
