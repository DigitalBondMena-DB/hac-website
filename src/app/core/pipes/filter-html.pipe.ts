import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'filterHtml',
  standalone: true,
})
export class FilterHtmlPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // Allowed tags and attributes
  private allowedTags: string[] = [
    'p',
    'div',
    'span',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'a',
    'img',
    'table',
    'tr',
    'td',
    'th',
    'br',
  ];

  // Tags to replace with paragraphs - to maintain consistent structure
  private tagsToReplace: string[] = [
    'div',
    'section',
    'article',
    'header',
    'footer',
  ];

  // Tags to completely remove
  private tagsToRemove: string[] = [
    'script',
    'style',
    'iframe',
    'object',
    'embed',
  ];

  // Tags to unwrap (keep content but remove the tag)
  private tagsToUnwrap: string[] = [
    'strong',
    'b',
    'em',
    'i',
    'u',
    'strike',
    'code',
    'pre',
  ];

  private allowedAttributes: string[] = [
    'src',
    'alt',
    'width',
    'height',
    'href',
    'title',
    'target',
  ];

  transform(value: string | null | undefined): SafeHtml {
    if (!value) {
      return this.sanitizer.bypassSecurityTrustHtml('');
    }

    // Use the same cleaning approach for both server and client
    // This helps avoid hydration mismatches
    const cleanedHtml = this.cleanHtml(value);
    return this.sanitizer.bypassSecurityTrustHtml(cleanedHtml);
  }

  private cleanHtml(html: string): string {
    // Step 1: Remove all HTML comments
    html = html.replace(/<!--[\s\S]*?-->/g, '');

    // Step 2: Remove tags that should be completely removed
    for (const tag of this.tagsToRemove) {
      const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
      html = html.replace(regex, '');
    }

    // Step 3: Convert specific tags into paragraphs (helps with consistent structure)
    for (const tag of this.tagsToReplace) {
      const openRegex = new RegExp(`<${tag}[^>]*>`, 'gi');
      const closeRegex = new RegExp(`<\\/${tag}>`, 'gi');
      html = html.replace(openRegex, '<p>');
      html = html.replace(closeRegex, '</p>');
    }

    // Step 4: Unwrap tags (keep content but remove the tag)
    for (const tag of this.tagsToUnwrap) {
      const openRegex = new RegExp(`<${tag}[^>]*>`, 'gi');
      const closeRegex = new RegExp(`<\\/${tag}>`, 'gi');
      html = html.replace(openRegex, '');
      html = html.replace(closeRegex, '');
    }

    // Step 5: Remove disallowed tags
    const allowedTagsPattern = this.allowedTags.join('|');
    const tagRegex = new RegExp(
      `<(?!\\/?(${allowedTagsPattern})\\b)[^>]+>`,
      'gi'
    );
    html = html.replace(tagRegex, '');

    // Step 6: Remove all attributes except allowed ones
    html = this.processAttributes(html);

    // Step 7: Ensure all paragraphs are properly closed (important for hydration)
    html = this.ensureClosedTags(html);

    // Step 8: Add extra wrapper to help with hydration issues
    html = `<div class="safe-html-wrapper">${html}</div>`;

    return html;
  }

  private processAttributes(html: string): string {
    // Extract all tags
    const tagRegex = /<[^>]+>/g;
    return html.replace(tagRegex, (tag) => {
      // Skip closing tags
      if (tag.match(/^<\//)) return tag;

      // For each tag, remove all attributes except allowed ones
      for (const attr of this.allowedAttributes) {
        const attrRegex = new RegExp(`\\s${attr}=["'][^"']*["']`, 'gi');
        tag = tag.replace(attrRegex, (match) => {
          return match.toLowerCase();
        });
      }

      // Remove all other attributes
      return tag.replace(/\s\w+=(["'])[^"']*\1/g, '');
    });
  }

  private ensureClosedTags(html: string): string {
    // Check and fix unclosed paragraph tags
    let processedHtml = html;
    let openCount = (processedHtml.match(/<p[^>]*>/gi) || []).length;
    let closeCount = (processedHtml.match(/<\/p>/gi) || []).length;

    // Add missing closing tags
    while (openCount > closeCount) {
      processedHtml += '</p>';
      closeCount++;
    }

    return processedHtml;
  }
}
