import { Component } from '@angular/core';

@Component({
  selector: 'app-track-orders-skeleton',
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

      <!-- Order Number Skeleton -->
      <div class="mt-15 animate-pulse">
        <div class="h-7 bg-gray-200 w-48 mb-3 rounded"></div>
        <div class="flex items-center gap-2">
          <div class="h-6 bg-gray-200 w-32 rounded"></div>
          <div class="h-6 bg-gray-200 w-24 rounded"></div>
        </div>
      </div>

      <!-- Tracking Timeline Skeleton -->
      <div
        class="bg-white rounded-[15px] border-1 border-[#A48374] shadow-md mt-6 items-center p-[35px]"
      >
        <!-- Desktop Layout -->
        <div class="hidden md:block animate-pulse">
          <div class="relative">
            <!-- Steps -->
            <div class="flex justify-between mb-4">
              @for(item of [1, 2, 3, 4, 5]; track item) {
              <div class="text-center w-1/5 relative">
                <div class="flex justify-center mb-2">
                  <div class="w-[60px] h-[60px] bg-gray-200 rounded-full"></div>
                </div>
                <div class="h-6 bg-gray-200 w-32 mx-auto rounded"></div>
              </div>
              }
            </div>

            <!-- Progress Bar -->
            <div class="relative mt-4">
              <div class="h-2 bg-gray-200 w-[85%] mx-auto rounded"></div>
            </div>

            <!-- Timestamps -->
            <div class="flex justify-between mt-6">
              @for(item of [1, 2, 3, 4, 5]; track item) {
              <div class="text-center w-1/5">
                <div class="h-5 bg-gray-200 w-24 mx-auto mb-2 rounded"></div>
                <div class="h-5 bg-gray-200 w-20 mx-auto rounded"></div>
              </div>
              }
            </div>
          </div>
        </div>

        <!-- Mobile Layout -->
        <div class="block md:hidden px-4 animate-pulse">
          <div class="relative">
            <div class="flex flex-col space-y-16">
              @for(item of [1, 2, 3, 4, 5]; track item) {
              <div class="flex flex-col items-center relative">
                <div
                  class="w-[70px] h-[70px] bg-gray-200 rounded-full mb-4"
                ></div>
                <div class="text-center w-full max-w-[200px]">
                  <div class="h-6 bg-gray-200 w-32 mx-auto mb-2 rounded"></div>
                  <div class="h-5 bg-gray-200 w-24 mx-auto mb-1 rounded"></div>
                  <div class="h-5 bg-gray-200 w-20 mx-auto rounded"></div>
                </div>
              </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Order Details Skeleton -->
      <div class="mt-[35px] animate-pulse">
        <div class="bg-warm-tan rounded-t-[20px] py-[18px] px-[42px]">
          <div
            class="flex flex-col md:flex-row-reverse justify-between items-center text-center"
          >
            @for(item of [1, 2, 3, 4]; track item) {
            <div class="mb-4 md:mb-0">
              <div class="h-5 bg-gray-200 w-32 mb-3 rounded"></div>
              <div class="h-6 bg-gray-200 w-24 rounded"></div>
            </div>
            }
          </div>
        </div>

        <div
          class="bg-image-order border border-[#AFA8A8] px-[42px] rounded-b-[15px] mb-[35px]"
        >
          <!-- Order Items -->
          @for(item of [1, 2]; track item) {
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

          <!-- Order Summary -->
          <div class="details py-6">
            @for(item of [1, 2, 3]; track item) {
            <div class="flex justify-between items-center mb-4">
              <div class="h-5 bg-gray-200 w-32 rounded"></div>
              <div class="h-5 bg-gray-200 w-24 rounded"></div>
            </div>
            }
          </div>
        </div>

        <!-- Back Button -->
        <div class="h-10 bg-gray-200 w-32 rounded-full"></div>
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
export class TrackOrdersSkeletonComponent {}
