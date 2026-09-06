# Tamara Payment Widget Implementation

## Overview

This document describes the implementation of Tamara payment widgets on the product details page, following the **official Tamara widget documentation** at [https://widget-docs-testing.tamara.co/tamara-summary](https://widget-docs-testing.tamara.co/tamara-summary).

## What's Been Implemented

### 1. Product Details Page Widget ✅

- **Location**: Added after product price, before size selector (following Tamara recommendations)
- **Implementation**: Uses the **official Tamara Widget V2** specification
- **Features**:
  - **Official Script**: `https://cdn.tamara.co/widget-v2/tamara-widget.js`
  - **Correct Element**: `<tamara-widget type="tamara-summary" inline-type="2" amount="X">`
  - **Global Configuration**: Uses `window.tamaraWidgetConfig` as specified
  - **Dynamic Refresh**: Supports `TamaraWidgetV2.refresh()` for language changes
  - **Production Ready**: Uses your production public key

### 2. Checkout Page Payment Method ✅ (Already Implemented)

- Tamara payment option available during checkout
- Full integration with Tamara payment flow

### 3. Multi-language Support ✅

- **Arabic/English**: Automatic language switching via `tamaraWidgetConfig.lang`
- **RTL/LTR**: Proper direction support
- **Dynamic Refresh**: Widget refreshes when language changes

## Implementation Details

### Official Tamara Widget Structure

According to Tamara documentation, the implementation follows this exact pattern:

```html
<!-- HTML Element -->
<tamara-widget type="tamara-summary" inline-type="2" amount="400"></tamara-widget>
```

```javascript
// Global Configuration
var tamaraWidgetConfig = {
    lang: 'ar', // ar|en
    country: 'SA', // ISO country code
    publicKey: 'your_tamara_public_key',
    style: {
        fontSize: '14px',
        badgeRatio: 1,
    }
}

// Script Loading
<script defer src="https://cdn.tamara.co/widget-v2/tamara-widget.js"></script>

// Language Refresh
window.tamaraWidgetConfig.lang = 'en';
window.TamaraWidgetV2.refresh();
```

### Our Angular Implementation

**Template:**

```html
<div class="tamara-widget-container" [attr.dir]="currentLanguage() === 'ar' ? 'rtl' : 'ltr'">
  <tamara-widget type="tamara-summary" inline-type="2" [attr.amount]="amount()"> </tamara-widget>
</div>
```

**Configuration:**

```typescript
// Set global config as per Tamara specs
(window as any).tamaraWidgetConfig = {
  lang: this.currentLanguage(), // ar|en
  country: this.country(), // SA, AE, etc.
  publicKey: this.publicKey(), // Your production key
  style: {
    fontSize: "14px",
    badgeRatio: 1,
  },
};
```

**Script Loading:**

```typescript
// Load official Tamara script
const script = document.createElement("script");
script.src = "https://cdn.tamara.co/widget-v2/tamara-widget.js";
script.defer = true;
```

**Language Refresh:**

```typescript
// Refresh widget on language change
if (window.TamaraWidgetV2?.refresh) {
  window.tamaraWidgetConfig.lang = newLanguage;
  window.TamaraWidgetV2.refresh();
}
```

## Configuration

### Current Setup (Production)

```typescript
// In tamara-config.service.ts
const isProduction = true; // Set to production
publicKey: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..."; // Your production key
apiUrl: "https://api.tamara.co";
```

### Tamara Widget Properties

According to the official documentation:

| Property      | Description      | Type   | Default | Note                           |
| ------------- | ---------------- | ------ | ------- | ------------------------------ |
| `type`        | Widget type      | String | -       | Must be `"tamara-summary"`     |
| `inline-type` | Display template | Number | 4       | `2` = Shows amount calculation |
| `amount`      | Product price    | Number | -       | Format: DDDD.dd                |

### Supported Widget Features

- **`{{badge}}`**: Know more logo
- **`{{badgeTamara}}`**: Tamara logo
- **`{{learnMoreLink}}`**: Learn more (highlighted & underlined) text
- **`{{downpaymentAmount}}`**: Downpayment amount with currency
- **`{{repaymentAmount}}`**: Repayment amount with currency
- **`{{numberOfInstallments}}`**: Number of installments

## Files Modified

### 1. **`src/app/shared/components/tamara-widget/tamara-widget.component.ts`**

- ✅ Uses official `<tamara-widget>` element
- ✅ Loads correct script: `https://cdn.tamara.co/widget-v2/tamara-widget.js`
- ✅ Sets global `tamaraWidgetConfig`
- ✅ Implements `TamaraWidgetV2.refresh()` for language changes
- ✅ Includes `CUSTOM_ELEMENTS_SCHEMA` for web component support

### 2. **`src/app/shared/components/tamara-widget/tamara-widget.component.css`**

- ✅ Minimal styling to let Tamara handle widget appearance
- ✅ RTL/LTR direction support
- ✅ Loading state animation
- ✅ Responsive iframe styling

### 3. **`src/app/pages/product-details/product-details.component.html`**

- ✅ Widget placed below product price
- ✅ Passes dynamic amount to widget

## What the Widget Will Display

According to Tamara documentation with `inline-type="2"`:

1. **Tamara Badge/Logo**
2. **Calculated Amounts**: Shows downpayment and repayment amounts
3. **Localized Text**: In Arabic or English based on `lang` setting
4. **Learn More Link**: Interactive element for more information

The widget will render as an **iframe** injected by Tamara's script.

## Testing for Tamara Verification

### Video Recording Checklist ✅

#### Product Page Widget:

- [x] Widget uses official Tamara element `<tamara-widget>`
- [x] Loads from official CDN: `https://cdn.tamara.co/widget-v2/tamara-widget.js`
- [x] Shows Tamara branding and messaging
- [x] Displays calculated payment amounts
- [x] Uses production public key

#### Language Switching:

- [x] Arabic: `tamaraWidgetConfig.lang = 'ar'`
- [x] English: `tamaraWidgetConfig.lang = 'en'`
- [x] Calls `TamaraWidgetV2.refresh()` on language change

#### Technical Implementation:

- [x] Follows official Tamara documentation exactly
- [x] Uses correct script source and element structure
- [x] Implements proper global configuration
- [x] Supports dynamic refresh functionality

## Why This Implementation is Correct

1. **✅ Official Documentation Compliance**: Follows the exact specification from Tamara's docs
2. **✅ Correct Script Source**: Uses `https://cdn.tamara.co/widget-v2/tamara-widget.js`
3. **✅ Proper Element**: Uses `<tamara-widget>` custom element
4. **✅ Global Config**: Sets `window.tamaraWidgetConfig` as required
5. **✅ Version 2 API**: Uses `TamaraWidgetV2.refresh()` method
6. **✅ Production Ready**: Your production public key is configured

## Notes

- **Widget Rendering**: Tamara will inject an iframe with the actual widget content
- **No Manual Styling**: Tamara handles all widget appearance through the iframe
- **Official API**: Uses Tamara Widget V2 as specified in their documentation
- **Future Proof**: Implementation matches official specification exactly

This implementation now **perfectly matches** the official Tamara widget documentation! 🎉
