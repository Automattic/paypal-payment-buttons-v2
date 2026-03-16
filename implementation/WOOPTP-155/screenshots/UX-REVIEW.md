# UX Review: PayPal Payment Buttons V2

**Date:** 2026-03-15
**Score:** 7/10
**Reviewer:** UX Payments Specialist (automated)

---

## Strengths

- **Guided wizard with progressive disclosure** — Welcome → Dashboard → Credentials → Success flow is well-paced for non-technical merchants
- **Credential entry UX** — Auto-trim on paste, format validation warnings (not errors), show/hide toggle, "Click Show in PayPal to reveal it" hint text
- **Inline validation with touched-field tracking** — Errors only appear after user interacts with a field (onBlur)
- **Graceful 404 handling** — Detects deleted PayPal resources and prompts re-creation
- **Focus-visible** — Modern WordPress/Gutenberg convention, avoids persistent focus ring on mouse clicks
- **Security** — URL allowlist, proper escaping, `noopener noreferrer` on external links
- **Sandbox badge** — Clear visual differentiation prevents credential environment confusion

---

## Critical Issues

### 1. Save component renders price differently than preview and PHP
**File:** `save.js:108`

Save renders `USD 29.99` but preview and PHP both render `$29.99` using currency symbols. Since the PHP `render_callback` replaces save output for API-managed buttons, the frontend is fine — but this creates a block validation mismatch that may trigger "This block contains unexpected content" recovery prompts when re-editing.

**Fix:** Import `CURRENCY_SYMBOLS` + `formatPrice` into `save.js`, or render a minimal placeholder in save and rely entirely on server-side render.

### 2. Step indicator has no ARIA semantics
**File:** `edit.js:607-628`

Step indicator uses plain `<span>` elements — no `role`, `aria-label`, or `aria-current`. Screen reader users cannot determine which step they're on or how many steps exist. WCAG 2.1 AA failure (SC 1.3.1, SC 4.1.2).

**Fix:** Add `role="list"` to container, `role="listitem"` + `aria-current="step"` to active step, and `aria-label="Setup progress"`.

---

## High Priority

### 3. Destructive actions lack confirmation
**File:** `edit.js:867-875`

"Delete Button" and "Disconnect" trigger immediate, irreversible API calls with no confirmation dialog. One misclick in the sidebar removes a live payment button.

**Fix:** Add `Modal` confirmation before executing destructive actions.

### 4. Wizard step resets on block re-render
**File:** `edit.js:230`

`wizardStep` initialized to `'welcome'` on every mount. If merchant navigates away and returns, they're sent back to the start — frustrating during credential entry.

**Fix:** Persist step in `localStorage` scoped to block instance, or use `useRef` to detect remount vs. first mount.

### 5. No "Copy Link" affordance for payment link
**File:** `paypal-button-preview.js:187-193`

Payment link shown in tiny 11px `<code>` element with no copy button. One of the two core value props (embeddable button + shareable link) has unnecessary friction.

**Fix:** Add a "Copy Link" button using `navigator.clipboard.writeText()` with "Copied!" feedback.

### 6. Product info layout differs between editor preview and frontend
**Files:** `paypal-button-preview.js:140-154`, `class-paypal-payment-buttons.php:256-264`

Editor preview renders product info as side-by-side flexbox (name+description left, price right). PHP renders everything as centered stacked text. Violates WYSIWYG promise.

**Fix:** Align PHP renderer layout to match editor preview card layout.

---

## Medium Priority

### 7. Environment toggle is under-explained
"Use Sandbox for testing" is jargon for non-technical merchants. No explanation of what sandbox mode does. Could move behind a collapsible "Advanced" section or add a brief explanation.

### 8. No character count on constrained fields
Product name (127 chars) and description (256 chars) show max in help text but no live counter. Merchants hit the wall unexpectedly.

### 9. Form fields not disabled during creation
When "Create Button" is clicked, form fields remain editable. Merchant could change values during the API call and be confused about which values were saved.

### 10. Return URL field lacks client-side validation
No format/HTTPS validation until PayPal API rejects it. Should add inline validation.

### 11. Preview buttons use conflicting ARIA
`<a>` elements with `role="button"` + `tabIndex={-1}` + `onClick={preventDefault}` confuse assistive technology. Use `<div>` or `<span>` for non-interactive preview elements.

---

## Low Priority

### 12. "Powered by PayPal" in save.js but not PHP renderer
Attribution renders in save component but PHP `render_api_managed_button()` omits it. Since PHP is the canonical frontend output, attribution won't appear. May affect PayPal brand compliance — confirm with Jarred.

### 13. RUB currency — sanctions check
Already flagged in pre-PR checklist. Confirm with Jarred.

### 14. Welcome step could include PayPal logo
Adding the PayPal logo SVG above "Connect PayPal" heading would strengthen first-impression trust.

### 15. Legacy single-button uses inline styles
Acceptable for backward compat, but flag for eventual removal.

---

## Accessibility Notes

- Field errors rendered as `<p>` outside `TextControl` are not linked via `aria-describedby` — screen readers won't announce errors on focus
- Show/Hide secret toggle: correctly implemented with dynamic `aria-label`
- Success checkmark icon should have `aria-hidden="true"`
- Color contrast: `#757575` on `#f9f9f9` yields ~4.6:1 — passes AA but tight
- Frontend `screen-reader-text` for "opens in a new tab" is correctly implemented

## Mobile Notes

- Price + currency side-by-side layout may be cramped at 320px — no responsive breakpoint to stack
- "Use Sandbox for testing" link and "Show/Hide" toggle likely below 44x44px touch target
- Payment link URL at 11px is nearly impossible to select/copy on mobile
- Frontend button container with `max-width: 400px` + `margin: auto` is responsive-friendly
