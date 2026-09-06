import { Component } from '@angular/core';

@Component({
  selector: 'app-articles-skeleton',
  standalone: true,
  template: `
    <section class="overflow-x-hidden">
      <div class="container mx-auto">
        <div class="grid grid-cols-1 xl:grid-cols-12 gap-11 items-start">
          <!-- Main Content Skeleton -->
          <div class="xl:col-span-9 xl:text-justify order-2 xl:order-1">
            <!-- Reserve exact same height as real content -->
            <div class="min-h-[800px]">
              <!-- Article Cards Skeleton -->
              @for (item of [1, 2, 3]; track item) {
              <div class="mb-8 animate-pulse bg-white">
                <div class="relative mb-[23px]">
                  <!-- Image Skeleton - exact dimensions -->
                  <div
                    class="w-full max-w-[900px] aspect-[900/432] bg-gray-200 rounded-xl"
                  ></div>
                </div>

                <!-- Content Skeleton -->
                <div class="mb-15">
                  <!-- Date -->
                  <div class="mb-[15px]">
                    <div class="h-4 bg-gray-200 w-24 rounded"></div>
                  </div>

                  <!-- Title -->
                  <div class="h-6 bg-gray-200 w-3/4 mb-[15px] rounded"></div>

                  <!-- Description -->
                  <div class="space-y-2 mb-[23px]">
                    <div class="h-4 bg-gray-200 w-full rounded"></div>
                    <div class="h-4 bg-gray-200 w-5/6 rounded"></div>
                  </div>

                  <!-- Read More Link -->
                  <div class="h-4 bg-gray-200 w-20 rounded"></div>
                </div>
              </div>
              }
            </div>

            <!-- Pagination Skeleton - exact same height -->
            <div class="flex justify-center mt-8 min-h-[60px] animate-pulse">
              <div class="flex items-center gap-2">
                <!-- Next Button -->
                <div class="h-[40px] w-16 bg-gray-200 rounded-[10px]"></div>
                <!-- Page Numbers -->
                @for (item of [1, 2, 3, 4]; track item) {
                <div class="h-[23px] w-[23px] bg-gray-200 rounded-full"></div>
                }
              </div>
            </div>
          </div>

          <!-- Sidebar Skeleton -->
          <div class="xl:col-span-3 order-1 xl:order-2">
            <!-- Popular Section Skeleton -->
            <div class="mb-3 animate-pulse">
              <div class="h-8 bg-gray-200 w-48 rounded mb-4"></div>
              <div class="min-h-[240px]">
                @for (item of [1, 2, 3, 4]; track item) {
                <div class="p-3 mb-3 bg-gray-200 rounded-[15px] h-[56px]"></div>
                }
              </div>
            </div>

            <!-- Best Selling Section Skeleton -->
            <div class="mb-[60px] animate-pulse">
              <div class="h-8 bg-gray-200 w-48 rounded mb-4"></div>
              <div class="min-h-[420px]">
                @for (item of [1, 2, 3, 4]; track item) {
                <div class="flex gap-2 items-center mb-[23px]">
                  <!-- Thumbnail - exact dimensions -->
                  <div
                    class="w-[99px] h-[99px] bg-gray-200 rounded-[15px] flex-shrink-0"
                  ></div>
                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <div class="h-5 bg-gray-200 w-full rounded mb-2"></div>
                    <div class="h-4 bg-gray-200 w-3/4 rounded"></div>
                  </div>
                </div>
                }
              </div>
            </div>

            <!-- Talent Image Card Skeleton -->
            <div class="hidden xl:block animate-pulse">
              <div class="aspect-[3/4] bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        contain: layout style;
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

      /* Ensure skeleton maintains layout stability */
      .container {
        contain: layout;
      }
    `,
  ],
})
export class ArticlesSkeletonComponent {}
