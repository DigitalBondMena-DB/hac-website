# Safe HTML Component Hydration Guide

## Hydration Issue with Angular SSR

When using the `app-safe-html` component in an Angular SSR application, you may encounter hydration errors like this:

```
Angular expected this DOM:
<div _ngcontent-ng-c1046744536="" class="content">
  …
  <p>…</p>
  <div>…</div>  <-- AT THIS LOCATION
  …
</div>

Actual DOM is:
<div _ngcontent-ng-c1046744536="" class="content">
  …
  <p _ngcontent-ng-c1046744536="" class="mb-1text-description-sizefont-semiboldtext-black">…</p>
  <p>…</p>  <-- AT THIS LOCATION
  …
</div>
```

## Why This Happens

These hydration errors occur when there's a mismatch between what gets rendered on the server and what gets rendered on the client. The `app-safe-html` component dynamically renders HTML content, which can include a variety of HTML elements.

The primary issue happens when:

1. `app-safe-html` is nested inside HTML elements with restrictions on what child elements they can contain (like `<p>`, `<h1>-<h6>`, `<span>`, etc.)
2. The dynamic HTML includes block-level elements (like `<div>`, `<p>`, etc.)

The server renders this HTML differently than the client, causing hydration errors.

## Solution

### Always Follow These Rules

1. **Never place `app-safe-html` inside paragraph tags or other inline elements**

   ```html
   <!-- DON'T DO THIS -->
   <p>
     <app-safe-html [content]="htmlContent"></app-safe-html>
   </p>

   <!-- DON'T DO THIS EITHER -->
   <h3>
     <app-safe-html [content]="htmlContent"></app-safe-html>
   </h3>
   ```

2. **Always use block containers like `<div>` for `app-safe-html`**

   ```html
   <!-- DO THIS INSTEAD -->
   <div class="my-content">
     <app-safe-html [content]="htmlContent"></app-safe-html>
   </div>
   ```

### Common Places to Check

Look for `app-safe-html` usage in these common patterns:

1. Inside article/blog content displays
2. Inside product descriptions
3. Inside FAQ answers or questions
4. Inside marketing content areas

## Technical Details

Our `app-safe-html` component includes the following features to minimize hydration issues:

1. Uses `ngSkipHydration` to bypass Angular's hydration process
2. Applies a consistent HTML sanitization process on both server and client
3. Uses `display: contents` to avoid disrupting layout
4. Normalizes HTML structure by converting problematic tags
5. Adds a wrapper div around content for more consistent structure

## Testing for Hydration Issues

To check if your page has hydration issues:

1. Run your application in SSR mode
2. Open the browser console
3. Look for hydration mismatch errors (NG0500)
4. Examine the component where the error occurs
5. Ensure all `app-safe-html` uses follow the guidelines above
