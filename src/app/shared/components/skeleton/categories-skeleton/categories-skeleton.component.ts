import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-categories-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="text-center animate-pulse">
      <div class="container mx-auto px-4">
        <!-- Title Skeleton -->
        <div class="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-6"></div>

        <!-- Subtitle Skeleton -->
        <div class="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>

        <!-- Categories Grid -->
        <div class="flex flex-wrap justify-center gap-4">
          <!-- Generate 5 skeleton cards -->
          @for(item of [1,2,3,4,5]; track item) {
          <div class="w-full sm:w-1/3 md:w-1/4 lg:w-1/5 flex-grow-1">
            <div class="bg-gray-200 rounded-lg p-4 h-full">
              <!-- Image Skeleton -->
              <div class="aspect-square bg-gray-300 rounded-lg mb-4"></div>
              <!-- Title Skeleton -->
              <div class="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
            </div>
          </div>
          }
        </div>
      </div>
    </section>
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
export class CategoriesSkeletonComponent {}
