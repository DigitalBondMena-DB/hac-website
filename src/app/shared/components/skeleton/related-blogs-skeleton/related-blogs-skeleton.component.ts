import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-related-blogs-skeleton',
  standalone: true,
  template: `
    <section class="container mx-auto my-[60px]">
      <!-- Section Header Skeleton -->
      @if (lightLabel) {
      <div class="flex items-center justify-between mb-[35px] animate-pulse">
        <!-- Title Skeleton -->
        <div class="h-8 bg-gray-200 w-[200px] rounded"></div>

        <!-- View All Button Skeleton -->
        <div class="h-12 bg-gray-200 w-[150px] rounded-full"></div>
      </div>
      } @else {
      <div class="mb-6 text-center animate-pulse">
        <div class="h-6 bg-gray-200 w-48 mx-auto mb-[18px] rounded"></div>
        <div class="h-8 bg-gray-200 w-72 mx-auto mb-[35px] rounded"></div>
      </div>
      }

      <!-- Blogs Grid Skeleton -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        @for (item of [1, 2, 3]; track item) {
        <div class="bg-white animate-pulse">
          <!-- Image Skeleton -->
          <div
            class="mb-[15px] rounded-[15px] overflow-hidden h-[200px] sm:h-[220px] md:h-[250px] bg-gray-200"
          ></div>

          <div class="px-4">
            <!-- Date Skeleton -->
            <div class="mb-[15px] sm:mb-[13px]">
              <div class="h-5 bg-gray-200 w-32 rounded"></div>
            </div>

            <!-- Description Skeleton -->
            <div class="space-y-2 mb-[10px]">
              <div class="h-4 bg-gray-200 w-full rounded"></div>
              <div class="h-4 bg-gray-200 w-3/4 rounded"></div>
            </div>

            <!-- Read More Link Skeleton -->
            <div class="h-4 bg-gray-200 w-24 rounded"></div>
          </div>
        </div>
        }
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
export class RelatedBlogsSkeletonComponent {
  @Input() lightLabel = false;
}
