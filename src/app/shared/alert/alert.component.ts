import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import { AlertService, AlertType } from './alert.service';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
  animations: [
    trigger('fadeAnimation', [
      state(
        'hidden',
        style({
          opacity: 0,
          visibility: 'hidden',
        })
      ),
      state(
        'visible',
        style({
          opacity: 1,
          visibility: 'visible',
        })
      ),
      transition('hidden => visible', [animate('250ms ease-out')]),
      transition('visible => hidden', [animate('200ms ease-in')]),
    ]),
    trigger('slideAnimation', [
      state(
        'hidden',
        style({
          opacity: 0,
          transform: 'translateY(-30px)',
          visibility: 'hidden',
        })
      ),
      state(
        'visible',
        style({
          opacity: 1,
          transform: 'translateY(0)',
          visibility: 'visible',
        })
      ),
      transition('hidden => visible', [animate('300ms ease-out')]),
      transition('visible => hidden', [animate('250ms ease-in')]),
    ]),
  ],
})
export class AlertComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();
  private autoCloseTimer: any;
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  _alertService = inject(AlertService);
  _translateService = inject(TranslateService);
  _elementRef = inject(ElementRef);

  showAlert$ = this._alertService.showAlert$;
  alertConfig$ = this._alertService.alertConfig$;

  // For template usage to check alert type
  AlertType = AlertType;

  // Helper method to check if current alert is notification type
  isNotificationType(): boolean {
    let isNotification = false;
    this.alertConfig$.pipe(take(1)).subscribe((config) => {
      isNotification = config?.alertType === AlertType.NOTIFICATION;
    });
    return isNotification;
  }

  // Handle clicks on the alert dialog
  handleAlertClick(event: MouseEvent): void {
    if (this.isNotificationType()) {
      // For notification alerts, close on any click within the alert
      event.stopPropagation();
      this._alertService.hide();
    }
  }

  // Create translated observables for template
  translatedTitle$ = this.alertConfig$.pipe(
    map((config) => {
      if (!config) return '';
      return config.translationKeys?.title
        ? this._translateService.instant(config.translationKeys.title)
        : config.title;
    })
  );

  translatedMessage$ = this.alertConfig$.pipe(
    map((config) => {
      if (!config) return '';
      return config.translationKeys?.message
        ? this._translateService.instant(config.translationKeys.message)
        : config.message;
    })
  );

  translatedConfirmText$ = this.alertConfig$.pipe(
    map((config) => {
      if (!config) return '';
      return config.translationKeys?.confirmText
        ? this._translateService.instant(config.translationKeys.confirmText)
        : config.confirmText;
    })
  );

  translatedCancelText$ = this.alertConfig$.pipe(
    map((config) => {
      if (!config) return '';
      return config.translationKeys?.cancelText
        ? this._translateService.instant(config.translationKeys.cancelText)
        : config.cancelText;
    })
  );

  @HostBinding('class.visible')
  get isVisible() {
    return this._alertService.showAlertSubject$.getValue();
  }

  ngOnInit(): void {
    // Set focus to the alert container when it appears
    this.showAlert$.pipe(takeUntil(this.destroyed$)).subscribe((visible) => {
      if (!this.isBrowser) return;

      if (visible) {
        // Trap focus inside the alert when it's open
        setTimeout(() => {
          const alertElement =
            this._elementRef.nativeElement.querySelector('.alert-wrapper');
          if (alertElement) {
            alertElement.focus();

            // Trap keyboard focus inside the alert
            this.trapFocus(alertElement);
          }
        }, 100);

        // Add overflow hidden to body to prevent scrolling
        if (typeof document !== 'undefined') {
          document.body.style.overflow = 'hidden';
        }

        // Set auto-close timer for notification alerts
        this.setAutoCloseTimerIfNeeded();
      } else {
        // Restore scrolling when alert is closed
        if (typeof document !== 'undefined') {
          document.body.style.overflow = '';
        }

        // Clear any existing auto-close timer
        this.clearAutoCloseTimer();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();

    // Only access document in browser environment
    if (this.isBrowser && typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }

    this.clearAutoCloseTimer();
  }

  // Set auto-close timer for notification alerts
  private setAutoCloseTimerIfNeeded(): void {
    // Clear any existing timer first
    this.clearAutoCloseTimer();

    // Check if current alert is a notification
    this.alertConfig$.pipe(take(1)).subscribe((config) => {
      if (config?.alertType === AlertType.NOTIFICATION) {
        // Auto-close notification alerts after 3 seconds
        this.autoCloseTimer = setTimeout(() => {
          this._alertService.hide();
        }, 3000);
      }
    });
  }

  // Clear auto-close timer
  private clearAutoCloseTimer(): void {
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
      this.autoCloseTimer = null;
    }
  }

  // Trap focus inside the alert dialog for accessibility
  private trapFocus(element: HTMLElement): void {
    if (!this.isBrowser) return;

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length) {
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      // Focus the first element
      firstElement.focus();

      // Handle tab key to cycle through elements
      element.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      });
    }
  }

  // Close on escape key press
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (!this.isBrowser) return;

    if (this.isVisible) {
      this.handleOutsideAction();
      event.preventDefault();
    }
  }

  // Handle clicks anywhere for notifications, outside content for confirmations
  onBackdropClick(event: MouseEvent): void {
    this.alertConfig$.pipe(take(1)).subscribe((config) => {
      // For notification alerts, any click dismisses the alert
      if (config?.alertType === AlertType.NOTIFICATION) {
        this._alertService.hide();
      }
      // For confirmation alerts, only clicks outside the content dismiss
      else if (event.target === event.currentTarget) {
        this.handleOutsideAction();
      }
    });
  }

  // Common handler for escape key and outside clicks
  private handleOutsideAction(): void {
    this.alertConfig$.pipe(take(1)).subscribe((config) => {
      if (config?.alertType === AlertType.NOTIFICATION) {
        // For notification alerts, just close
        this._alertService.hide();
      } else {
        // For confirmation alerts, treat as cancel
        if (config?.onCancel) {
          config.onCancel();
        }
        this._alertService.hide();
      }
    });
  }

  onConfirm() {
    this.alertConfig$.pipe(take(1)).subscribe((config) => {
      if (config?.onConfirm) {
        config.onConfirm();
      }
      this._alertService.hide();
    });
  }

  onCancel() {
    this.alertConfig$.pipe(take(1)).subscribe((config) => {
      if (config?.onCancel) {
        config.onCancel();
      }
      this._alertService.hide();
    });
  }
}
