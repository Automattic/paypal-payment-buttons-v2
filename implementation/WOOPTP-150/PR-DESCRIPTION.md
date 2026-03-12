# WOOPTP-150: Live Button Preview in Block Editor

## Summary

Adds a PayPal-branded live button preview in the block editor with an edit/preview mode toggle, a `save.js` for frontend rendering, and a `PayPalButtonPreview` component shared between editor states.

## Changes

### New Files

1. **`paypal-button-preview.js`** — Reusable preview component
   - PayPal logo SVG rendered inline (no external requests)
   - Product info card: name, description, formatted price with currency symbol
   - PayPal-branded gold button (#ffc439) with pill shape matching real PayPal buttons
   - Stacked layout: PayPal button + dark "Debit or Credit Card" secondary button
   - Single layout: PayPal button only
   - Payment link URL reference shown below buttons
   - Currency symbol formatting for all 26 supported currencies

2. **`save.js`** — Frontend render component
   - API-managed blocks: product info + styled buttons linking to `paymentLink`
   - Stacked/single layout support matching editor preview
   - Legacy paste-code blocks: renders original `div` with `hostedButtonId`
   - Empty fallback for edge cases

3. **`style.scss`** — Frontend-only styles
   - PayPal gold button with hover/focus states
   - Dark debit/credit secondary button
   - Product name, description, price layout
   - Accessible focus outlines
   - Max-width 400px centered container

### Modified Files

4. **`edit.js`** — Updated with preview mode
   - **Edit/preview toggle** via `BlockControls` toolbar (eye/pencil icons)
   - Starts in preview mode when button already exists, edit mode otherwise
   - Uses `PayPalButtonPreview` component in preview mode
   - Added "Delete Button" action in sidebar
   - Extracted `buildRequestData()` helper to reduce duplication
   - Form shows "Edit PayPal Button" heading when updating existing button
   - Cancel button in edit mode returns to preview

5. **`editor.scss`** — Updated with preview component styles
   - PayPal-branded button styles (gold primary, dark secondary)
   - Product card with price alignment
   - Payment link reference styling
   - Form action bar with cancel button

## Architecture

```
edit.js
├── Loading state (Spinner)
├── Legacy state (read-only indicator)
├── Connect state (credentials form)
├── Preview state (PayPalButtonPreview component)
│   ├── Product card (name, description, price)
│   ├── PayPal gold button with logo SVG
│   ├── Debit/credit secondary button (stacked only)
│   └── Payment link reference
└── Edit state (product form + create/update action)

save.js
├── API-managed block (product info + styled links)
├── Legacy block (script-based div)
└── Empty fallback
```

## Checklist

- [x] Button preview renders after successful API creation
- [x] Preview visually matches frontend PayPal button rendering
- [x] Loading spinner shown during API call
- [x] Error message shown if creation fails
- [x] Edit button allows switching back to form view
- [x] Preview shows product name + price
- [x] Frontend save.js renders styled buttons
- [x] Stacked/single layout support
- [x] Delete button functionality
- [ ] Jest tests for preview component (WOOPTP-153)

Refs: WOOPTP-150
