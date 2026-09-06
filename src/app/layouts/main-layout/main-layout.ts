import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  Event,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterEvent,
  RouterOutlet,
} from '@angular/router';
import { LoadingService } from '@core/services/loading/loading.service';
import { TranslateModule } from '@ngx-translate/core';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TranslateModule],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.css'],
})
export class MainLayout implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  readonly loadingService = inject(LoadingService);
  private subs = new SubSink();

  ngOnInit(): void {
    this.setupNavigationEvents();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private setupNavigationEvents(): void {
    this.subs.sink = this.router.events.subscribe((event: Event) => {
      if (event instanceof RouterEvent) {
        this.handleRouterEvent(event);
      }
    });
  }

  private handleRouterEvent(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
      // Show loading when navigation starts
      this.loadingService.showLoading();
    }

    // Hide loading when navigation ends (success or error)
    if (
      event instanceof NavigationEnd ||
      event instanceof NavigationCancel ||
      event instanceof NavigationError
    ) {
      // Slight delay to allow resolver data to be processed
      setTimeout(() => {
        this.loadingService.hideLoading();
      }, 300);
    }
  }
}
