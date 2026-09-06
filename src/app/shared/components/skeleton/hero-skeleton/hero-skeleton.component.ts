import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-hero-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="mt-[15px]" aria-label="Hero Section Loading">
      <div class="container mx-auto relative">
        <div class="relative bg-gray-200 [border-radius:23px] min-h-[497px]">
          <div class="carousel-wrapper overflow-hidden relative h-[497px]">
            <!-- Slide Content Container -->
            <div class="slide-container w-full">
              <div
                class="slide-content flex flex-col md:flex-row-reverse items-start justify-between w-full gap-8 overflow-y-hidden"
              >
                <!-- Text Column -->
                <div
                  class="flex flex-col justify-evenly lg:block w-full lg:w-[60%] py-[20px] lg:py-[55px] px-[10px] md:px-[30px] ltr:lg:pl-[0px] rtl:lg:pr-[0px] ltr:lg:pr-[62px] rtl:lg:pl-[62px] min-h-[497px]"
                >
                  <!-- Small Title Skeleton -->
                  <div class="mb-4 flex items-center gap-2 w-fit animate-pulse">
                    <div class="w-8 h-8 rounded-full bg-gray-200"></div>
                    <div class="h-6 w-32 bg-gray-200 rounded"></div>
                  </div>

                  <!-- Main Title Skeleton -->
                  <div class="animate-pulse">
                    <div class="h-9 bg-gray-200 rounded w-3/4 mt-6 mb-4"></div>
                  </div>

                  <!-- Description Text Skeleton -->
                  <div class="space-y-3 animate-pulse mb-8">
                    <div class="h-4 bg-gray-200 rounded w-full"></div>
                    <div class="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div class="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>

                  <!-- CTA Button Skeleton -->
                  <div class="animate-pulse">
                    <div class="h-10 bg-gray-200 rounded-full w-40"></div>
                  </div>
                </div>

                <!-- Image Column Skeleton -->
                <div
                  class="hidden lg:w-[40%] lg:flex justify-center items-center px-4 max-h-[497px] aspect-[4/5]"
                >
                  <div
                    class="w-full h-full bg-gray-200 rounded-lg animate-pulse"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Rotating image skeleton -->
          <div
            class="hidden lg:block absolute z-10 top-[14px] ltr:right-[14px] rtl:left-[14px] animate-pulse"
          >
            <div class="w-[73px] h-[73px] rounded-full bg-gray-200"></div>
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
export class HeroSkeletonComponent {}
