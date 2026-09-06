import { Component } from '@angular/core';

@Component({
  selector: 'app-cart-skeleton',
  standalone: true,
  template: `
    <section>
      <div class="container mx-auto">
        <div class="grid grid-cols-12 mb-15">
          <!-- Cart Items Section -->
          <div class="col-span-12 xl:col-span-8 overflow-hidden">
            <!-- Cart Items Header -->
            <div
              class="header hidden md:flex items-center justify-between rounded-[15px] bg-warm-tan py-6 px-12 text-white text-description-size animate-pulse"
            >
              @for(item of [1, 2, 3, 4]; track item) {
              <div class="h-6 bg-gray-200 w-24 rounded"></div>
              }
            </div>

            <!-- Cart Items -->
            <div
              class="cart-items-container max-h-[564px] overflow-y-auto px-4 mb-[30px]"
            >
              @for(item of [1, 2, 3]; track item) {
              <div
                class="block md:flex items-center justify-between flex-wrap py-[30px] px-[23px] border-b-1 border-[#8D8D8D] animate-pulse"
              >
                <!-- Product Info -->
                <div
                  class="flex justify-start lg:ltr:pr-15 lg:rtl:pl-15 items-center gap-[10px] mb-5 md:mb-0"
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

                <!-- Quantity -->
                <div class="h-[42px] bg-gray-200 w-32 rounded-full"></div>

                <!-- Total -->
                <div class="h-6 bg-gray-200 w-24 rounded"></div>
              </div>
              }
            </div>

            <!-- Cart Footer -->
            <div class="flex items-center justify-between animate-pulse">
              <div class="w-2/3">
                <div class="h-12 bg-gray-200 rounded-full"></div>
              </div>
              <div class="w-1/4">
                <div class="h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>

          <!-- Cart Summary -->
          <div
            class="col-span-12 xl:col-span-4 my-8 lg:my-0 rtl:pr-15 ltr:pl-15"
          >
            <div
              class="wrapper py-[19px] px-[45px] border border-[#202020] rounded-[15px] animate-pulse"
            >
              <div class="h-7 bg-gray-200 w-48 mb-6 rounded"></div>

              @for(item of [1, 2, 3, 4]; track item) {
              <div class="flex items-center justify-between mb-6">
                <div class="h-5 bg-gray-200 w-32 rounded"></div>
                <div class="h-5 bg-gray-200 w-24 rounded"></div>
              </div>
              }

              <div
                class="rounded-[15px] border border-warm-tan py-[17px] px-[15px] mt-[45px] mb-[50px]"
              >
                <div class="flex justify-between items-center">
                  <div class="h-6 bg-gray-200 w-32 rounded"></div>
                  <div class="h-6 bg-gray-200 w-24 rounded"></div>
                </div>
              </div>

              <div class="h-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>

        <!-- Service Features -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 animate-pulse">
          @for(item of [1, 2, 3]; track item) {
          <div class="p-6 rounded-lg">
            <div class="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div class="h-6 bg-gray-200 w-48 mx-auto mb-3 rounded"></div>
            <div class="h-4 bg-gray-200 w-64 mx-auto rounded"></div>
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
export class CartSkeletonComponent {}
