# WOOPTP-156: PayPal brand compliance and design guidelines

## Summary

Ensures all PayPal Payment Buttons rendering — both the block editor preview and the
published frontend — satisfies PayPal's official brand guidelines, WordPress.com/Jetpack
design standards, and WCAG 2.1 accessibility requirements.

No new feature surface; no PHP changes; no database schema changes. Pure frontend polish
applied across four files: `paypal-button-preview.js`, `editor.scss`, `save.js`,
`style.scss`.

---

## What changed and why

### 1. PayPal wordmark in the frontend save output (`save.js`)

**Before:** The primary `<a>` button on the published page contained only the button text
string. No PayPal logo appeared anywhere on the frontend.

**After:** The PayPal wordmark SVG is now rendered inline inside the primary button — logo
on the left, button text on the right — matching the editor preview and satisfying PayPal's
brand requirement that their wordmark appears on every call-to-action linking to a PayPal
payment page.

The SVG carries `aria-hidden="true"` and `focusable="false"` so screen readers rely on the
visible button text rather than the decorative graphic.

A "Powered by PayPal" attribution paragraph is rendered below the button container, also
required by PayPal brand guidelines.

### 2. Consistent logo sizing across editor and frontend

**Before:** The editor preview set the logo height to `18px` via CSS inside `editor.scss`.
The frontend had no logo at all. The `paypal-button-preview.js` SVG element also carried
hardcoded `width="80" height="20"` HTML attributes that conflicted with the CSS rule.

**After:**
- Hardcoded `width`/`height` attributes removed from the `<svg>` element in
  `paypal-button-preview.js`. CSS exclusively controls rendered size — no attribute
  vs. CSS specificity fight.
- Editor logo height updated from `18px` → `20px` in `editor.scss`.
- Frontend logo set to `20px` in `style.scss`, scoped inside both button link selectors.
- `flex-shrink: 0` added to both to prevent logo compression on narrow viewports.

Logo height is now **20px in both contexts**, matching the PayPal JS SDK's own button
rendering.

### 3. Button layout changed to flex (`style.scss`)

**Before:** `.jetpack-paypal-button__paypal-link` was `display: block`. There was no way
to place the logo and text side-by-side.

**After:** Both the primary PayPal button and the debit/credit secondary button are
`display: flex; align-items: center; justify-content: center; gap: 8px`. This accommodates
the inline SVG wordmark without breaking the existing pill-shaped button geometry.

### 4. Accessible focus states: `:focus` → `:focus-visible` (`style.scss`)

**Before:** Both button types used `:focus` for the keyboard focus ring, which caused a
visible outline to appear on mouse and touch interactions — contrary to WordPress Core,
Gutenberg, and WordPress.com design guidelines.

**After:** Both buttons use `:focus-visible`, which renders the `2px solid #0070ba`
(PayPal blue) outline only for keyboard navigation. This aligns with WCAG 2.4.7 and the
accepted pattern across Jetpack blocks and WordPress.com themes.

### 5. Internationalised strings in `save.js`

**Before:** `'Pay Now'` and `'Debit or Credit Card'` were hardcoded English literals.

**After:** Both strings are wrapped in `__( …, 'jetpack-paypal-payments' )`. The `__()`
call is evaluated at save time in the active locale, which is the accepted Gutenberg
pattern for block save output.

Screen-reader text on `target="_blank"` links (`'(opens in a new tab)'`) is also
internationalised per WCAG 2.1 SC 3.2.2.

### 6. SCSS variables for brand colors (`style.scss`)

Brand color values are now declared as SCSS variables at the top of the file rather than
repeated as inline hex literals:

```scss
$paypal-gold:       #ffc439;
$paypal-gold-hover: #f0b72a;
$paypal-dark:       #2c2e2f;
$paypal-dark-hover: #1a1b1c;
$paypal-blue:       #0070ba;
```

Single source of truth for brand colors; aligns with how Jetpack and WordPress.com SCSS
files handle design tokens.

---

## Files changed

| File | Change |
|---|---|
| `paypal-button-preview.js` | Remove hardcoded SVG `width`/`height`; add `aria-hidden`, `focusable="false"` |
| `editor.scss` | Logo height `18px` → `20px`; add `flex-shrink: 0` |
| `save.js` | Add `PayPalLogo` SVG component; flex button layout; i18n strings; attribution; screen-reader text |
| `style.scss` | SCSS variables; flex layout; logo rules; `:focus` → `:focus-visible`; attribution styles |

---

## Backward compatibility

The V2 API-managed block format (`isApiManaged: true`) is pre-release — not yet available
to any production WordPress.com or Jetpack sites (targeting Jetpack 15.7 / April 2026).
The `save.js` markup change therefore requires **no new deprecation entry**. The existing
`deprecated.js` (introduced in WOOPTP-152) covers only the legacy v0.4.0-alpha
paste-code format and is unaffected.

---

## Testing checklist

- [ ] Create a new PayPal Payment Button block (API-managed, `stacked` layout) and publish
      the page — verify the PayPal wordmark appears at 20 px inside the gold button
- [ ] Verify the "Debit or Credit Card" secondary button appears and renders correctly
- [ ] Verify "Powered by PayPal" attribution appears below the button container
- [ ] Tab to each button using keyboard only — confirm `2px` PayPal-blue focus ring appears
- [ ] Click each button with a mouse — confirm focus ring does **not** persist after click
- [ ] Create a `single` layout button — verify the secondary button is hidden
- [ ] Open block editor — verify the preview logo is `20px` tall, visually matching the
      frontend rendering
- [ ] Check a legacy paste-code block (non-API-managed) — verify it still renders the
      hosted-button `<div>` without logo or attribution (unchanged path in `save.js`)
- [ ] Run the page through a screen reader — confirm logo SVG is not announced and
      `(opens in a new tab)` is read for each button link
- [ ] Switch site language to a non-English locale — confirm button strings translate
      correctly
