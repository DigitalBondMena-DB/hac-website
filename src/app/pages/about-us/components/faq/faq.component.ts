import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, Input, NgZone, PLATFORM_ID, inject } from '@angular/core';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { ArrowButtonComponent } from '@shared/components/arrow-button/arrow-button.component';
import {
  AccordionComponent,
  AccordionContentComponent,
  AccordionPanelComponent,
  AccordionTitleComponent,
} from 'flowbite-angular/accordion';
import { SafeHtmlComponent } from '../../../../core/safe-html/safe-html.component';
import { IFaq } from '../../res/about-us.interface';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ArrowButtonComponent,
    AccordionComponent,
    AccordionPanelComponent,
    AccordionContentComponent,
    AccordionTitleComponent,
    SafeHtmlComponent,
    CustomTranslatePipe,
  ],
})
export class FAQComponent implements AfterViewInit {
  @Input() faqs: IFaq[] = [];
  // Track accordion state manually
  private panelStates = new Map<Element, boolean>();
  private ngZone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    // Initial setup with a delay to ensure DOM is ready
    setTimeout(() => {
      this.replaceAccordionIcons();
    }, 500);
  }

  /**
   * Replace the default accordion chevron SVG paths with custom + and - symbols
   */
  private replaceAccordionIcons() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.ngZone.runOutsideAngular(() => {
      // Get all accordion title SVGs
      const accordionIcons = document.querySelectorAll(
        'flowbite-accordion-title svg'
      );

      if (!accordionIcons || accordionIcons.length === 0) {
        return;
      }

      // Replace each SVG with our custom SVG
      accordionIcons.forEach((icon, index) => {
        // Clear the existing SVG content
        icon.innerHTML = '';

        // Ensure proper viewport
        icon.setAttribute('viewBox', '0 0 24 24');
        icon.setAttribute('width', '24');
        icon.setAttribute('height', '24');

        // Create plus sign (+ symbol)
        const plusGroup = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'g'
        );
        plusGroup.classList.add('plus-icon');

        // Horizontal line
        const horizontalLine = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path'
        );
        horizontalLine.setAttribute('d', 'M6 12h12');
        horizontalLine.setAttribute('stroke', 'black');
        horizontalLine.setAttribute('stroke-width', '2');
        horizontalLine.setAttribute('stroke-linecap', 'round');

        // Vertical line (makes the + symbol)
        const verticalLine = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path'
        );
        verticalLine.setAttribute('d', 'M12 6v12');
        verticalLine.setAttribute('stroke', 'black');
        verticalLine.setAttribute('stroke-width', '2');
        verticalLine.setAttribute('stroke-linecap', 'round');

        plusGroup.appendChild(horizontalLine);
        plusGroup.appendChild(verticalLine);

        // Create minus sign (- symbol)
        const minusGroup = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'g'
        );
        minusGroup.classList.add('minus-icon');
        minusGroup.style.display = 'none';

        // Just a horizontal line for minus
        const minusLine = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path'
        );
        minusLine.setAttribute('d', 'M6 12h12');
        minusLine.setAttribute('stroke', 'black');
        minusLine.setAttribute('stroke-width', '2');
        minusLine.setAttribute('stroke-linecap', 'round');

        minusGroup.appendChild(minusLine);

        // Add both symbols to the SVG
        icon.appendChild(plusGroup);
        icon.appendChild(minusGroup);

        // Setup the parent elements with click handling
        const title = icon.closest('flowbite-accordion-title');
        const panel = title?.closest('flowbite-accordion-panel');

        if (title && panel) {
          // Initialize all panels as closed (showing plus)
          this.panelStates.set(panel, false);

          // Add click handler to toggle the icon
          title.addEventListener('click', () => {
            const currentState = this.panelStates.get(panel) || false;
            const newState = !currentState;
            this.panelStates.set(panel, newState);

            // Update the icon
            if (newState) {
              // Panel is now OPEN - show MINUS
              plusGroup.style.display = 'none';
              minusGroup.style.display = 'block';
            } else {
              // Panel is now CLOSED - show PLUS
              plusGroup.style.display = 'block';
              minusGroup.style.display = 'none';
            }
          });
        }
      });
    });
  }
}
