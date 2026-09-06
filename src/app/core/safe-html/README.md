# Safe HTML Component

A reusable Angular component for safely rendering HTML content while avoiding hydration issues in SSR applications.

## Features

- Securely renders HTML content with proper sanitization
- Prevents Angular hydration mismatches between server and client
- Normalizes HTML structure for consistent rendering
- Strips potentially dangerous HTML elements and attributes
- Works consistently with Angular's server-side rendering (SSR)

## Usage

### Basic Usage

```html
<div class="my-content">
  <app-safe-html [content]="htmlContent"></app-safe-html>
</div>
```

### Wrong Usage (Will Cause Hydration Errors)

```html
<p>
  <app-safe-html [content]="htmlContent"></app-safe-html>
</p>
```

## Common Mistakes and Solutions

### 1. Nesting inside paragraph tags

**Problem**: Placing `app-safe-html` directly inside `<p>` tags causes hydration issues because the rendered HTML may contain block elements that aren't valid inside paragraphs.

```html
<!-- DON'T DO THIS -->
<p>
  <app-safe-html [content]="htmlContent"></app-safe-html>
</p>
```

**Solution**: Always place `app-safe-html` inside block containers like `<div>`, `<section>`, etc.

```html
<!-- DO THIS INSTEAD -->
<div class="my-paragraph">
  <app-safe-html [content]="htmlContent"></app-safe-html>
</div>
```

### 2. Placing inside other components with strict content expectations

Some Angular components expect specific content structures. Placing dynamic HTML can cause issues.

**Solution**: Use `app-safe-html` in containers with flexible content requirements.

## How It Works

The component uses a combination of strategies to avoid hydration mismatches:

1. Uses `ngSkipHydration` to bypass Angular's hydration process for dynamic content
2. Implements a consistent HTML sanitization process that works identically on server and client
3. Normalizes HTML structure by converting problematic tags
4. Uses the `display: contents` CSS property to prevent disrupting the layout
5. Ensures all tags are properly closed

## Example

```typescript
import { SafeHtmlComponent } from "@core/safe-html/safe-html.component";

@Component({
  selector: "app-my-component",
  standalone: true,
  imports: [CommonModule, SafeHtmlComponent],
  template: `
    <div class="article-content">
      <h1>{{ article.title }}</h1>
      <div class="content">
        <app-safe-html [content]="article.content"></app-safe-html>
      </div>
    </div>
  `,
})
export class MyComponent {
  article = {
    title: "Sample Article",
    content: "<p>This is a <strong>sample</strong> article content.</p>",
  };
}
```

## Under the Hood

The component performs the following steps to clean and normalize HTML:

1. Removes all HTML comments
2. Removes potentially dangerous tags like `script`, `style`, `iframe`
3. Converts specific block tags to paragraphs for consistent structure
4. Unwraps formatting tags to avoid nesting issues
5. Removes all attributes except a specifically allowed list
6. Ensures all tags are properly closed
7. Adds a wrapper div to ensure consistent structure

## More Examples

See the `example-safe-html` component for working examples of different HTML content scenarios.
