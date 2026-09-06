import { Component } from '@angular/core';

@Component({
  selector: 'app-order-details-skeleton',
  standalone: true,
  template: `
    <div class="container mx-auto mt-3 mb-6">
      <!-- Header Skeleton -->
      <div
        class="header p-9 text-center rounded-2xl relative animate-pulse"
        role="banner"
      >
        <div
          class="w-[65px] h-[65px] bg-gray-200 rounded-full mx-auto mb-4"
        ></div>
        <div class="h-8 bg-gray-200 w-64 mx-auto mb-3 rounded"></div>
        <div class="h-6 bg-gray-200 w-96 mx-auto rounded"></div>
      </div>

      <!-- Order Info Skeleton -->
      <div class="mt-[35px]">
        <div
          class="bg-warm-tan text-white flex flex-col md:flex-row-reverse justify-between items-center rounded-t-[20px] py-[18px] px-[42px] text-description-size capitalize text-center animate-pulse"
        >
          @for(item of [1, 2, 3, 4]; track item) {
          <div class="mb-4 md:mb-0">
            <div class="h-5 bg-gray-200 w-32 mb-3 rounded"></div>
            <div class="h-6 bg-gray-200 w-24 rounded"></div>
          </div>
          }
        </div>

        <!-- Order Details Skeleton -->
        <div
          class="bg-image-order space-y-4 border border-[#AFA8A8] px-[42px] rounded-b-[15px] mb-[35px]"
        >
          <div class="border-b border-[#8D8D8D]">
            <div class="my-8">
              <div class="h-7 bg-gray-200 w-48 mb-4 rounded"></div>
              <div class="h-6 bg-gray-200 w-64 mb-4 rounded"></div>
            </div>

            <!-- Product Items Skeleton -->
            @for(item of [1, 2, 3]; track item) {
            <div class="flex items-center justify-between mb-6">
              <div class="flex flex-wrap gap-4 items-center">
                <div class="w-[80px] h-[80px] bg-gray-200 rounded-lg"></div>
                <div>
                  <div class="h-6 bg-gray-200 w-48 mb-3 rounded"></div>
                  <div class="h-4 bg-gray-200 w-64 rounded"></div>
                </div>
              </div>
              <div class="h-6 bg-gray-200 w-24 rounded"></div>
            </div>
            }
          </div>

          <!-- Order Summary Skeleton -->
          <div class="details py-6">
            @for(item of [1, 2, 3]; track item) {
            <div class="flex justify-between items-center mb-4">
              <div class="h-5 bg-gray-200 w-32 rounded"></div>
              <div class="h-5 bg-gray-200 w-24 rounded"></div>
            </div>
            }
            <div class="border-t border-[#8D8D8D] pt-6">
              <div class="flex justify-between items-center">
                <div class="h-6 bg-gray-200 w-32 rounded"></div>
                <div class="h-6 bg-gray-200 w-24 rounded"></div>
              </div>
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
export class OrderDetailsSkeletonComponent {}
