import { Component } from '@angular/core';

@Component({
  selector: 'app-product-details-skeleton',
  standalone: true,
  template: `
    <section>
      <div class="container mx-auto overflow-hidden">
        <div
          class="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-10 rtl:flex-row-reverse"
        >
          <!-- Left Side: Product Images Carousel Skeleton -->
          <div class="product-images animate-pulse">
            <!-- Main Image Skeleton -->
            <div class="carousel-wrapper overflow-hidden rounded-lg mb-4">
              <div class="aspect-square bg-gray-200 rounded-lg"></div>
            </div>

            <!-- Thumbnail Gallery Skeleton -->
            <div class="thumbnail-gallery mt-4 grid grid-cols-4 gap-4">
              @for (item of [1, 2, 3, 4]; track item) {
              <div class="aspect-square bg-gray-200 rounded-[15px]"></div>
              }
            </div>
          </div>

          <!-- Right Side: Product Details Skeleton -->
          <div class="product-info rtl:text-right ltr:text-left animate-pulse">
            <!-- Category Skeleton -->
            <div class="h-6 bg-gray-200 w-32 mb-[23px] rounded"></div>

            <!-- Title and Stock Status Skeleton -->
            <div class="mb-[23px] flex gap-4 items-center">
              <div class="h-8 bg-gray-200 w-64 rounded"></div>
              <div class="h-8 bg-gray-200 w-32 rounded-full"></div>
            </div>

            <!-- Price Skeleton -->
            <div class="flex items-center gap-4 mb-6">
              <div class="h-7 bg-gray-200 w-24 rounded"></div>
              <div class="h-7 bg-gray-200 w-24 rounded"></div>
            </div>

            <!-- Description Skeleton -->
            <div class="space-y-2 mb-[30px]">
              <div class="h-4 bg-gray-200 w-full rounded"></div>
              <div class="h-4 bg-gray-200 w-3/4 rounded"></div>
            </div>

            <!-- Size Selector Skeleton -->
            <div class="mb-15">
              <div class="h-6 bg-gray-200 w-20 mb-3 rounded"></div>
              <div class="flex flex-wrap gap-3">
                @for (item of [1, 2, 3]; track item) {
                <div class="h-8 bg-gray-200 w-20 rounded-full"></div>
                }
              </div>
            </div>

            <!-- Actions Skeleton -->
            <div class="flex flex-wrap gap-4 items-center mb-[30px]">
              <!-- Quantity Selector -->
              <div class="h-12 bg-gray-200 w-32 rounded-full"></div>
              <!-- Add to Cart Button -->
              <div class="h-12 bg-gray-200 w-40 rounded-full"></div>
              <!-- Buy Now Button -->
              <div class="h-12 bg-gray-200 w-40 rounded-full"></div>
              <!-- Wishlist Button -->
              <div class="h-12 bg-gray-200 w-12 rounded-full"></div>
            </div>

            <!-- Social Share Skeleton -->
            <div class="mt-2 flex items-center gap-2 mb-4">
              <div class="h-6 bg-gray-200 w-16 rounded"></div>
              <div class="flex gap-2">
                @for (item of [1, 2, 3]; track item) {
                <div class="h-8 w-8 bg-gray-200 rounded"></div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Product Description Tabs Skeleton -->
        <div class="my-16 animate-pulse">
          <!-- Tab Headers -->
          <nav class="flex justify-center gap-x-[112px]">
            @for (item of [1, 2, 3, 4]; track item) {
            <div class="h-6 bg-gray-200 w-32 rounded"></div>
            }
          </nav>

          <!-- Tab Content Skeleton -->
          <div class="mt-8 space-y-4">
            <div class="h-4 bg-gray-200 w-full rounded"></div>
            <div class="h-4 bg-gray-200 w-5/6 rounded"></div>
            <div class="h-4 bg-gray-200 w-4/6 rounded"></div>
          </div>
        </div>

        <!-- Related Products Section Skeleton -->
        <div class="mb-6 text-center animate-pulse">
          <div class="h-6 bg-gray-200 w-48 mx-auto mb-3 rounded"></div>
          <div class="h-8 bg-gray-200 w-64 mx-auto mb-6 rounded"></div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-15">
          @for (item of [1, 2, 3]; track item) {
          <div
            class="bg-white border border-gray-200 rounded-lg p-4 animate-pulse"
          >
            <div class="aspect-square bg-gray-200 rounded-lg mb-4"></div>
            <div class="h-6 bg-gray-200 w-3/4 mb-3 rounded"></div>
            <div class="h-5 bg-gray-200 w-1/4 mb-3 rounded"></div>
            <div class="h-10 bg-gray-200 w-full rounded-full"></div>
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
export class ProductDetailsSkeletonComponent {}
