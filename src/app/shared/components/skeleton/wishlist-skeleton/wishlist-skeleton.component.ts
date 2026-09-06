import { Component } from '@angular/core';

@Component({
  selector: 'app-wishlist-skeleton',
  standalone: true,
  template: `
    <section class="mb-[30px] overflow-hidden">
      <div class="container mx-auto">
        <div class="grid grid-cols-15">
          <div class="col-span-15 lg:col-span-11">
            <!-- Wishlist Items Header -->
            <div
              class="header hidden md:flex items-center justify-between rounded-[15px] bg-warm-tan py-6 px-12 text-white text-description-size animate-pulse"
            >
              @for(item of [1, 2, 3]; track item) {
              <div class="h-6 bg-gray-200 w-24 rounded"></div>
              }
            </div>

            <!-- Wishlist Items -->
            <div class="max-h-[555px] overflow-y-auto px-4">
              @for(item of [1, 2, 3]; track item) {
              <div
                class="block md:flex items-center justify-between flex-wrap pt-[27px] pb-[30px] px-[23px] border-b-1 border-[#8D8D8D] animate-pulse"
              >
                <!-- Product Info -->
                <div
                  class="flex justify-start md:ltr:pr-15 md:rtl:pl-15 items-center gap-[10px] mb-5 md:mb-0"
                >
                  <div class="w-[23px] h-[23px] bg-gray-200 rounded-full"></div>
                  <div class="w-[80px] h-[80px] bg-gray-200 rounded-lg"></div>
                  <div>
                    <div class="h-6 bg-gray-200 w-48 mb-3 rounded"></div>
                    <div class="h-4 bg-gray-200 w-64 rounded"></div>
                  </div>
                </div>

                <!-- Price -->
                <div class="h-6 bg-gray-200 w-24 rounded"></div>

                <!-- Add to Cart Button -->
                <div class="h-10 bg-gray-200 w-32 rounded-lg"></div>
              </div>
              }
            </div>

            <!-- Wishlist Footer -->
            <div
              class="flex items-center justify-between pt-[27px] pb-[30px] animate-pulse"
            >
              <div class="h-6 bg-gray-200 w-32 rounded"></div>
            </div>
          </div>

          <!-- Offset -->
          <div class="hidden lg:block lg:col-span-1"></div>

          <!-- Talent Image Card -->
          <div
            class="hidden max-h-[1000px] lg:block lg:col-span-3 animate-pulse"
          >
            <div class="aspect-[3/4] bg-gray-200 rounded-lg"></div>
          </div>
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
export class WishlistSkeletonComponent {}
