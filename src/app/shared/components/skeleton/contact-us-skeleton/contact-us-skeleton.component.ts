import { Component } from '@angular/core';

@Component({
  selector: 'app-contact-us-skeleton',
  standalone: true,
  template: `
    <section class="contact-section">
      <div class="container mx-auto">
        <!-- Header Map Skeleton -->
        <div class="mb-[60px] animate-pulse">
          <div class="w-full h-[300px] bg-gray-200 rounded-lg"></div>
        </div>

        <!-- Contact Form Section Skeleton -->
        <div class="mb-15">
          <div class="grid grid-cols-12 gap-4">
            <!-- Left Section: Form Skeleton -->
            <div class="col-span-12 lg:col-span-8">
              <div class="animate-pulse">
                <!-- Full Name Fields -->
                <div
                  class="flex justify-between items-center gap-x-[23px] mb-[44px]"
                >
                  <!-- First Name -->
                  <div class="flex-grow-1 w-full">
                    <div class="h-6 bg-gray-200 w-32 mb-[23px] rounded"></div>
                    <div class="h-14 bg-gray-200 w-full rounded-[15px]"></div>
                  </div>
                  <!-- Last Name -->
                  <div class="flex-grow-1 w-full">
                    <div class="h-6 bg-gray-200 w-32 mb-[23px] rounded"></div>
                    <div class="h-14 bg-gray-200 w-full rounded-[15px]"></div>
                  </div>
                </div>

                <!-- Phone Number -->
                <div class="mb-[41px]">
                  <div class="h-6 bg-gray-200 w-40 mb-[23px] rounded"></div>
                  <div class="h-14 bg-gray-200 w-full rounded-[15px]"></div>
                </div>

                <!-- Email -->
                <div class="mb-[41px]">
                  <div class="h-6 bg-gray-200 w-32 mb-[23px] rounded"></div>
                  <div class="h-14 bg-gray-200 w-full rounded-[15px]"></div>
                </div>

                <!-- Message -->
                <div class="mb-[41px]">
                  <div class="h-6 bg-gray-200 w-36 mb-[23px] rounded"></div>
                  <div
                    class="h-[250px] bg-gray-200 w-full rounded-[15px]"
                  ></div>
                </div>

                <!-- Submit Button -->
                <div class="h-12 bg-gray-200 w-40 rounded-full"></div>
              </div>
            </div>

            <!-- Right Section: Image Skeleton -->
            <div class="hidden lg:block lg:col-span-4">
              <div class="animate-pulse">
                <div class="aspect-[2/3] w-full rounded-xl bg-gray-200"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Cards Details Skeleton -->
        <div class="min-h-[350px]">
          <div class="grid md:grid-cols-12 gap-[30px]">
            @for (item of [1, 2, 3]; track item) {
            <div class="md:col-span-6 lg:col-span-4">
              <div
                class="border border-[#8D8D8D] rounded-[15px] text-center h-full animate-pulse"
              >
                <!-- Icon Skeleton -->
                <div
                  class="mt-[30px] rounded-full bg-gray-200 p-[18px] w-[66px] h-[66px] mx-auto"
                ></div>

                <!-- Title Skeleton -->
                <div
                  class="h-6 bg-gray-200 w-32 mx-auto mt-[27px] rounded"
                ></div>

                <!-- Content Skeleton -->
                <div
                  class="h-5 bg-gray-200 w-48 mx-auto mt-5 mb-[55px] rounded"
                ></div>
              </div>
            </div>
            }
          </div>
        </div>

        <!-- Service Features Section Skeleton -->
        <section class="py-8">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            @for (item of [1, 2, 3]; track item) {
            <div class="p-6 rounded-lg border border-gray-200 animate-pulse">
              <!-- Service Icon Skeleton -->
              <div
                class="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"
              ></div>

              <!-- Service Title Skeleton -->
              <div class="h-6 bg-gray-200 w-40 mx-auto mb-4 rounded"></div>

              <!-- Service Description Skeleton -->
              <div class="space-y-2">
                <div class="h-4 bg-gray-200 w-full rounded"></div>
                <div class="h-4 bg-gray-200 w-3/4 mx-auto rounded"></div>
              </div>
            </div>
            }
          </div>
        </section>
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
export class ContactUsSkeletonComponent {}
