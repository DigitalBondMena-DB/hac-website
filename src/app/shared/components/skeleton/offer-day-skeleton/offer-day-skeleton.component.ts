import { Component } from '@angular/core';

@Component({
  selector: 'app-offer-day-skeleton',
  standalone: true,
  template: `
    <section class="px-4">
      <div class="container mx-auto">
        <!-- Header Skeleton -->
        <div class="animate-pulse mb-6 text-center">
          <div class="h-6 bg-gray-200 w-48 mx-auto mb-6 rounded"></div>
          <div class="h-8 bg-gray-200 w-72 mx-auto mb-9 rounded"></div>
        </div>

        <!-- Cards Container Skeleton -->
        <div
          class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6 mb-[45px]"
        >
          @for (item of [1, 2]; track item) {
          <div
            class="flex flex-col md:flex-row bg-white rounded-2xl shadow-md overflow-hidden p-4 gap-4 animate-pulse"
          >
            <!-- Image Skeleton -->
            <div
              class="relative rounded-2xl overflow-hidden bg-gray-200 w-full md:w-[220px] h-[220px]"
            >
              <!-- Discount Badge Skeleton -->
              <div
                class="absolute top-[7px] right-[7px] bg-gray-300 h-12 w-20 rounded-full"
              ></div>
            </div>

            <!-- Content Skeleton -->
            <div class="flex flex-col justify-between flex-grow">
              <!-- Category Skeleton -->
              <div class="h-5 bg-gray-200 w-24 mb-[15px] rounded"></div>

              <!-- Name Skeleton -->
              <div class="h-6 bg-gray-200 w-3/4 mb-[15px] rounded"></div>

              <!-- Price Skeleton -->
              <div class="flex items-center gap-7 mb-[20px]">
                <div class="h-6 bg-gray-200 w-24 rounded"></div>
                <div class="h-6 bg-gray-200 w-24 rounded"></div>
              </div>

              <!-- Description Skeleton -->
              <div class="space-y-2 mb-[16px]">
                <div class="h-4 bg-gray-200 w-full rounded"></div>
                <div class="h-4 bg-gray-200 w-3/4 rounded"></div>
              </div>

              <!-- Shop Now Link Skeleton -->
              <div class="h-5 bg-gray-200 w-32 rounded"></div>
            </div>
          </div>
          }
        </div>

        <!-- Banner Skeleton -->
        <div
          class="relative h-full bg-warm-tan rounded-xl z-10 overflow-hidden flex flex-col-reverse lg:flex-row-reverse items-stretch justify-between gap-8 animate-pulse"
        >
          <!-- Image Section Skeleton -->
          <div class="w-full lg:w-1/2 relative z-10">
            <div class="h-[300px] lg:h-full bg-gray-200"></div>
          </div>

          <!-- Text Content Section Skeleton -->
          <div
            class="w-full p-[15px] sm:p-[25px] md:p-[40px] text-start relative z-10"
          >
            <!-- Small Title Skeleton -->
            <div class="h-8 bg-gray-200 w-3/4 mb-[23px] rounded"></div>

            <!-- Main Title Skeleton -->
            <div class="h-10 bg-gray-200 w-full mb-[23px] rounded"></div>

            <!-- Text Skeleton -->
            <div class="space-y-4 mb-[35px]">
              <div class="h-6 bg-gray-200 w-full rounded"></div>
              <div class="h-6 bg-gray-200 w-3/4 rounded"></div>
            </div>

            <!-- Button Skeleton -->
            <div class="h-12 bg-gray-200 w-40 rounded-full"></div>
          </div>

          <div
            class="banner-container absolute top-0 left-0 w-full h-full bg-white"
          ></div>
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

      .bg-warm-tan {
        background-color: #cbac8d;
      }
    `,
  ],
})
export class OfferDaySkeletonComponent {}
