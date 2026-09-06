import { inject, Pipe, PipeTransform } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LanguageService } from '@core/services/lang/language.service';

@Pipe({
  name: 'customTranslate',
  standalone: true,
  pure: false,
})
export class CustomTranslatePipe implements PipeTransform {
  private languageService = inject(LanguageService);
  private currentLang = toSignal(this.languageService.getLanguage(), {
    initialValue: 'ar',
  });

  transform(input: any, property?: string): any {
    const langPrefix = this.currentLang() + '_';

    if (Array.isArray(input)) {
      return input.map((item) =>
        this.translateObject(item, langPrefix, property)
      );
    }

    if (input && typeof input === 'object') {
      return this.translateObject(input, langPrefix, property);
    }

    return '';
  }

  private translateObject(
    obj: Record<string, any>,
    prefix: string,
    property?: string
  ): any {
    if (!obj || typeof obj !== 'object') return '';

    if (property) {
      const key = `${prefix}${property}`;
      return obj[key] ?? obj[property] ?? '';
    }

    const result: Record<string, any> = {};
    const languagePrefixes = ['ar_', 'en_'];

    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith(prefix)) {
        // Handle current language prefixed keys
        const cleanKey = key.substring(prefix.length);
        result[cleanKey] = value;
      } else if (
        !languagePrefixes.some((langPrefix) => key.startsWith(langPrefix))
      ) {
        // Include keys that don't have any language prefix
        result[key] = value;
      }
    }
    return result;
  }
}
