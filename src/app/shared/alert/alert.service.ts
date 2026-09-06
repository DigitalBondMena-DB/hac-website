import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export enum AlertType {
  NOTIFICATION = 'notification',
  CONFIRMATION = 'confirmation',
}

export interface AlertConfig {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  imagePath?: string; // Dynamic image path
  alertType: AlertType;
  translationKeys?: {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
  }; // Translation keys for i18n
  onConfirm?: () => void;
  onCancel?: () => void;
  onDismiss?: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private showAlertSubject = new BehaviorSubject<boolean>(false);
  private alertConfigSubject = new BehaviorSubject<AlertConfig | null>(null);

  showAlertSubject$ = this.showAlertSubject;
  showAlert$ = this.showAlertSubject.asObservable();
  alertConfig$ = this.alertConfigSubject.asObservable();

  /**
   * Show a notification alert (simple alert with just close option)
   */
  showNotification(config: Omit<AlertConfig, 'alertType' | 'cancelText'>) {
    this.show({
      ...config,
      alertType: AlertType.NOTIFICATION,
      onCancel: config.onDismiss, // Map dismiss to cancel for consistency
    });
  }

  /**
   * Show a confirmation alert (with confirm and cancel buttons)
   */
  showConfirmation(config: Omit<AlertConfig, 'alertType'>) {
    this.show({
      ...config,
      alertType: AlertType.CONFIRMATION,
    });
  }

  /**
   * Show alert with specified configuration
   */
  show(config: AlertConfig) {
    this.alertConfigSubject.next(config);
    this.showAlertSubject.next(true);
  }

  /**
   * Hide the currently displayed alert
   */
  hide() {
    this.showAlertSubject.next(false);
    this.alertConfigSubject.next(null);
  }
}
