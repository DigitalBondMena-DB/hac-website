import { Component } from '@angular/core';

@Component({
  selector: 'app-shopping-skeleton',
  standalone: true,
  template: `
    <div class="container mx-auto">
      <!-- Header Skeleton -->
      <div class="mb-9 animate-pulse">
        <div class="h-10 bg-gray-200 w-1/3 mx-auto mb-4 rounded-lg"></div>
        <div class="h-6 bg-gray-200 w-1/2 mx-auto rounded-lg"></div>
      </div>

      <div class="wrapper">
        <!-- Filter Options Header Skeleton -->
        <div class="flex justify-between items-center mb-[26px] animate-pulse">
          <div class="h-8 bg-gray-200 w-48 rounded-lg"></div>
          <div class="h-6 bg-gray-200 w-64 rounded-lg"></div>
        </div>

        <!-- Filter Badges Skeleton -->
        <div class="flex justify-between items-center mb-9 animate-pulse">
          <div class="flex gap-2">
            @for(badge of [1, 2, 3]; track badge) {
            <div class="h-8 bg-gray-200 w-24 rounded-full"></div>
            }
          </div>
          <div class="h-6 bg-gray-200 w-24 rounded-lg"></div>
        </div>

        <div class="grid grid-cols-12 gap-[13px]">
          <!-- Filter Box Skeleton -->
          <div class="col-span-12 xl:col-span-3">
            <!-- Categories Filter Box -->
            <div class="p-4 shadow-md rounded-2xl mb-4 animate-pulse">
              <div class="h-8 bg-gray-200 w-48 mb-6 rounded-lg"></div>
              @for(category of [1, 2, 3, 4, 5]; track category) {
              <div class="flex items-center gap-2 mb-4">
                <div class="h-6 w-6 bg-gray-200 rounded-md"></div>
                <div class="h-6 bg-gray-200 w-32 rounded-lg"></div>
              </div>
              }
            </div>

            <!-- Price Filter Box -->
            <div class="p-4 shadow-md rounded-2xl mb-4 animate-pulse">
              <div class="h-8 bg-gray-200 w-48 mb-6 rounded-lg"></div>
              <div class="flex justify-between mb-4">
                <div class="h-6 bg-gray-200 w-20 rounded-lg"></div>
                <div class="h-6 bg-gray-200 w-20 rounded-lg"></div>
              </div>
              <div class="h-2 bg-gray-200 w-full rounded-full mb-6"></div>
            </div>

            <!-- Availability Filter Box -->
            <div class="p-4 shadow-md rounded-2xl animate-pulse">
              <div class="h-8 bg-gray-200 w-48 mb-6 rounded-lg"></div>
              @for(option of [1, 2]; track option) {
              <div class="flex items-center gap-2 mb-4">
                <div class="h-6 w-6 bg-gray-200 rounded-md"></div>
                <div class="h-6 bg-gray-200 w-32 rounded-lg"></div>
              </div>
              }
            </div>
          </div>

          <!-- Products Grid Skeleton -->
          <div class="col-span-12 xl:col-span-9 mb-15">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              @for(product of [1, 2, 3, 4, 5, 6, 9]; track product) {
              <div
                class="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse"
              >
                <!-- Product Image -->
                <div class="aspect-w-1 aspect-h-1 w-full">
                  <div class="h-64 bg-gray-200"></div>
                </div>
                <!-- Product Info -->
                <div class="p-4">
                  <div class="h-6 bg-gray-200 w-3/4 mb-2 rounded"></div>
                  <div class="h-4 bg-gray-200 w-1/2 mb-4 rounded"></div>
                  <div class="flex justify-between items-center">
                    <div class="h-6 bg-gray-200 w-24 rounded"></div>
                    <div class="h-10 bg-gray-200 w-10 rounded-full"></div>
                  </div>
                </div>
              </div>
              }
            </div>

            <!-- Pagination Skeleton -->
            <div
              class="flex justify-center items-center mt-10 gap-2 animate-pulse"
            >
              <div class="h-10 bg-gray-200 w-24 rounded-lg"></div>
              <div class="hidden md:flex gap-2">
                @for(page of [1, 2, 3, 4, 5]; track page) {
                <div class="h-8 w-8 bg-gray-200 rounded-full"></div>
                }
              </div>
              <div class="h-10 bg-gray-200 w-24 rounded-lg"></div>
            </div>

            <!-- Pagination Info Skeleton -->
            <div class="text-center mt-4 animate-pulse">
              <div class="h-6 bg-gray-200 w-48 mx-auto rounded"></div>
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
export class ShoppingSkeletonComponent {}
