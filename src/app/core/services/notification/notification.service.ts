import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface INotification {
  message: string;
  type: NotificationType;
  id: number;
  title?: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private _notifications = signal<INotification[]>([]);
  private _notificationCounter = 0;

  constructor(private translateService: TranslateService) {}

  // Signal to expose notifications
  notifications = this._notifications.asReadonly();

  /**
   * Add a notification with the given message and type
   */
  showNotification(
    messageKey: string,
    type: NotificationType = 'info',
    titleKey?: string
  ): void {
    const message = this.translateService.instant(messageKey);
    const title = titleKey
      ? this.translateService.instant(titleKey)
      : undefined;

    const notification: INotification = {
      message,
      type,
      id: this._notificationCounter++,
      title,
    };

    // Add the notification to the array
    this._notifications.update((notifications) => [
      ...notifications,
      notification,
    ]);

    // Auto-remove the notification after 5 seconds
    setTimeout(() => {
      this.removeNotification(notification.id);
    }, 5000);
  }

  /**
   * Shorthand method for success notifications
   */
  success(messageKey: string, titleKey?: string): void {
    this.showNotification(messageKey, 'success', titleKey);
  }

  /**
   * Shorthand method for error notifications
   */
  error(messageKey: string, titleKey?: string): void {
    this.showNotification(messageKey, 'error', titleKey);
  }

  /**
   * Shorthand method for warning notifications
   */
  warning(messageKey: string, titleKey?: string): void {
    this.showNotification(messageKey, 'warning', titleKey);
  }

  /**
   * Shorthand method for info notifications
   */
  info(messageKey: string, titleKey?: string): void {
    this.showNotification(messageKey, 'info', titleKey);
  }

  /**
   * Remove a notification by ID
   */
  removeNotification(id: number): void {
    this._notifications.update((notifications) =>
      notifications.filter((notification) => notification.id !== id)
    );
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this._notifications.set([]);
  }
}
