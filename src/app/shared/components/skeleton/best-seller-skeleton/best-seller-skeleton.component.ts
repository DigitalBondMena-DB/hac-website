import { Component } from '@angular/core';

@Component({
  selector: 'app-best-seller-skeleton',
  standalone: true,
  template: `
    <section>
      <div class="container mx-auto">
        <!-- Header Skeleton -->
        <div class="flex items-center justify-between mb-[50px]">
          <div class="animate-pulse">
            <div class="h-8 bg-gray-200 rounded w-[250px]"></div>
          </div>
          <div class="animate-pulse">
            <div
              class="h-[46px] w-[180px] bg-gray-200 rounded-full"
              role="presentation"
            ></div>
          </div>
        </div>

        <!-- Products Grid Skeleton -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (item of [1, 2, 3]; track item) {
          <div
            class="card-wrapper h-full bg-white border border-gray-200 overflow-hidden relative animate-pulse"
            role="presentation"
          >
            <!-- Action Buttons Skeleton -->
            <div
              class="btns absolute top-[30px] right-[25px] z-1 flex flex-col"
            >
              <div class="mb-[10px] w-9 h-9 bg-gray-200 rounded-full"></div>
              <div class="w-9 h-9 bg-gray-200 rounded-full"></div>
            </div>

            <!-- Image Container Skeleton -->
            <div class="img relative">
              <figure
                class="aspect-[3/4] md:aspect-[4/3] overflow-hidden rounded-xl"
              >
                <div class="w-full h-full bg-gray-200"></div>
              </figure>
              <!-- Offer Badge Skeleton -->
              <div
                class="absolute top-3 left-3 w-20 h-12 bg-gray-200 rounded-full"
              ></div>
            </div>

            <!-- Product Info Skeleton -->
            <div
              class="flex flex-row rtl:flex-row-reverse justify-between items-center mt-[26px] mb-4"
            >
              <!-- Show Products Link Skeleton -->
              <div class="w-24 h-5 bg-gray-200 rounded"></div>
              <!-- Product Name Skeleton -->
              <div class="w-32 h-5 bg-gray-200 rounded"></div>
            </div>

            <!-- Description Skeleton -->
            <div class="mb-8">
              <div class="w-3/4 h-4 bg-gray-200 rounded"></div>
            </div>

            <!-- Price Section Skeleton -->
            <div class="flex items-center gap-4 mb-[13px]">
              <div class="w-20 h-6 bg-gray-200 rounded"></div>
              <div class="w-20 h-6 bg-gray-200 rounded"></div>
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

      .card-wrapper {
        transition: all 0.3s ease;
      }
    `,
  ],
})
export class BestSellerSkeletonComponent {}
