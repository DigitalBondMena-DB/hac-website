import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-banner-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-warm-tan pt-[23px] pb-[20px] my-[60px] text-center w-full">
      <div
        class="container mx-auto flex items-center justify-center gap-2 animate-pulse"
      >
        @if (showLeftSideImage) {
        <figure class="mx-2 md:mx-7">
          <div
            class="hidden sm:block w-[55px] h-[50px] bg-dark-brown rounded"
            role="presentation"
          ></div>
        </figure>
        }

        <!-- Text Skeleton -->
        <div class="h-6 bg-dark-brown rounded w-2/3 md:w-1/2"></div>

        @if (showRightSideImage) {
        <figure class="mx-2 md:mx-7">
          <div
            class="hidden sm:block w-[55px] h-[50px] bg-dark-brown rounded"
            role="presentation"
          ></div>
        </figure>
        }
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

      .bg-warm-tan {
        background-color: #cbac8d;
      }
    `,
  ],
})
export class BannerSkeletonComponent {
  @Input() showLeftSideImage = true;
  @Input() showRightSideImage = true;
}
