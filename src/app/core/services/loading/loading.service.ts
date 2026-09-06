import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  // Use a signal for reactivity
  private isLoadingSignal = signal<boolean>(false);

  // Show the loading screen
  showLoading(): void {
    this.isLoadingSignal.set(true);
  }

  // Hide the loading screen
  hideLoading(): void {
    this.isLoadingSignal.set(false);
  }

  // Get the current loading state
  get isLoading() {
    return this.isLoadingSignal;
  }
}
