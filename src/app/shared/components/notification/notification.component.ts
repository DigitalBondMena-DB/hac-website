import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  INotification,
  NotificationService,
} from '@core/services/notification/notification.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
})
export class NotificationComponent {
  private _notificationService = inject(NotificationService);

  // Expose the notifications signal to the template
  notifications = this._notificationService.notifications;

  /**
   * Get the CSS classes for the notification based on its type
   */
  getNotificationClasses(notification: INotification): Record<string, boolean> {
    return {
      'notification-success': notification.type === 'success',
      'notification-error': notification.type === 'error',
      'notification-warning': notification.type === 'warning',
      'notification-info': notification.type === 'info',
    };
  }

  /**
   * Get icon class based on notification type
   */
  getIconClass(type: string): string {
    switch (type) {
      case 'success':
        return 'fa-check-circle';
      case 'error':
        return 'fa-times-circle';
      case 'warning':
        return 'fa-exclamation-triangle';
      case 'info':
      default:
        return 'fa-info-circle';
    }
  }

  /**
   * Close a notification
   */
  closeNotification(id: number): void {
    this._notificationService.removeNotification(id);
  }

  /**
   * Track notifications by ID for better performance
   */
  trackById(index: number, notification: INotification): number {
    return notification.id;
  }
}
