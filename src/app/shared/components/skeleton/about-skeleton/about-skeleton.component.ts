import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-about-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-16 animate-pulse">
      <!-- Slogan Text Skeleton -->
      <div class="w-3/4 h-8 bg-gray-200 rounded mb-8 mx-auto"></div>

      <!-- About Content Grid -->
      <div class="grid md:grid-cols-2 gap-8 items-center">
        <!-- Left side - Image skeleton -->
        <div class="aspect-video bg-gray-200 rounded-lg"></div>

        <!-- Right side - Content skeleton -->
        <div class="space-y-4">
          <!-- Title skeleton -->
          <div class="h-8 bg-gray-200 rounded w-3/4"></div>

          <!-- Description skeleton lines -->
          <div class="space-y-3">
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded w-5/6"></div>
            <div class="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>

          <!-- Counters skeleton -->
          <div class="grid grid-cols-2 gap-4 mt-8">
            <div class="p-4 bg-gray-200 rounded">
              <div class="h-6 w-1/2 bg-gray-300 rounded mb-2"></div>
              <div class="h-4 w-3/4 bg-gray-300 rounded"></div>
            </div>
            <div class="p-4 bg-gray-200 rounded">
              <div class="h-6 w-1/2 bg-gray-300 rounded mb-2"></div>
              <div class="h-4 w-3/4 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
    `,
  ],
})
export class AboutSkeletonComponent {}
