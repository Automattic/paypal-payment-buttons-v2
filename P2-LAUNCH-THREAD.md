# PayPal Payment Buttons: From Copy-Paste to No-Code

**Target:** Jetpack 15.7 / WordCamp Asia (April 9-11, 2026)
**PR Branch:** `paypal-payment-buttons-v2` on `slash1andy/jetpack`
**Linear Project:** [PayPal Payment Buttons V2: API Integration](https://linear.app/a8c/project/paypal-payment-buttons-v2-api-integration-46f40aa73cf4)
**Playground Demo:** [Try it live](https://playground.wordpress.net/#eyJsYW5kaW5nUGFnZSI6Ii8iLCJwcmVmZXJyZWRWZXJzaW9ucyI6eyJwaHAiOiI4LjIiLCJ3cCI6IjYuNyJ9LCJmZWF0dXJlcyI6eyJuZXR3b3JraW5nIjp0cnVlfSwic3RlcHMiOlt7InN0ZXAiOiJpbnN0YWxsUGx1Z2luIiwicGx1Z2luRGF0YSI6eyJyZXNvdXJjZSI6InVybCIsInVybCI6Imh0dHBzOi8vZ2l0aHViLmNvbS9BdXRvbWF0dGljL3BheXBhbC1wYXltZW50LWJ1dHRvbnMtdjIvcmVsZWFzZXMvZG93bmxvYWQvdjAuOC4wLXBsYXlncm91bmQvcGF5cGFsLXBheW1lbnQtYnV0dG9ucy56aXAiLCJjYXB0aW9uIjoiSW5zdGFsbGluZyBQYXlQYWwgUGF5bWVudCBCdXR0b25zIn0sIm9wdGlvbnMiOnsiYWN0aXZhdGUiOnRydWV9fV19)

---

## The Problem

The current PayPal Payment Buttons block requires merchants to leave WordPress, visit PayPal.com, create a button, copy HTML code, and paste it back into the editor. It's an 8+ step process that feels broken next to Stripe's seamless in-editor experience.

**The old workflow:**

1. Visit PayPal.com
2. Navigate to Developer Dashboard
3. Find "Payment Buttons" section
4. Configure button (name, price, currency)
5. Generate HTML code
6. Copy the code
7. Return to WordPress
8. Paste code into the block

Every step outside the editor is a point where merchants abandon the setup.

## The Solution

PayPal launched the **Pay Links & Buttons API** in November 2025. We've used it to build a fully API-driven flow where merchants never leave the WordPress editor.

**The new workflow:**

1. Add the PayPal Payment Buttons block
2. Connect your PayPal account (one-time guided wizard)
3. Fill in product name + price, click "Create Button"

That's it. Three steps, all in-editor.

---

## What We Built

### Guided Connection Wizard

Instead of dumping merchants on a bare "enter your Client ID" form, a 4-step wizard walks them through:

1. **Welcome** — explains what they'll need
2. **Dashboard** — numbered instructions with a deep link to PayPal Developer Dashboard
3. **Credentials** — Client ID + Secret with inline validation, show/hide toggle, format warnings
4. **Success** — confirmation with "Create Your First Button" CTA

The wizard defaults to **Production** (not Sandbox) because merchants want to accept real payments. Sandbox is an explicit opt-in via a subtle link.

> **Screenshot: Wizard credentials step**
> `screenshots/screenshot-1-connect.png`

### In-Editor Button Creation

Once connected, merchants see a clean form: product name, price, currency (26 supported), optional description and image. Click "Create Button" and the plugin calls PayPal's API server-side.

Every payment resource created gives the merchant both:
- An **embeddable button** (rendered on the page)
- A **shareable payment link** (copy and paste into emails, social media, anywhere)

> **Screenshot: Product creation form**
> `screenshots/screenshot-2-create.png`

### Live Preview

The editor preview matches the published frontend exactly. WYSIWYG for payment buttons.

> **Screenshot: Editor preview**
> `screenshots/screenshot-3-preview.png`

### Published Frontend

Clean, PayPal-branded buttons with product info, price with currency symbols, and stacked layout (PayPal + Debit/Credit Card).

> **Screenshot: Published PayPal button**
> `screenshots/screenshot-4-frontend.png`

> **Screenshot: Stacked layout close-up**
> `screenshots/screenshot-5-stacked.png`

### Payment Links Admin Dashboard

A new admin page (under Jetpack or Settings) lists all merchant payment links with:
- Product name, price, status badge, created date
- Copy-to-clipboard for payment link URLs
- Delete with confirmation
- Click-through detail view showing full PayPal resource configuration

### Send Payment Link via Email

From the detail view, merchants can email a payment link directly to a customer. HTML email with PayPal-branded CTA button, optional personal message, send history log.

---

## Checkout Options

The block supports several checkout configuration options:

- **Product variants** — Size, color, and other option groups with per-option pricing (up to 5 groups, 10 options each)
- **Adjustable quantity** — Let customers buy multiple units (1 to max)
- **Tax collection** — Fixed percentage or PayPal profile settings
- **Custom checkout fields** — Gift messages, personalization instructions
- **Shipping configuration** — Flat rate or PayPal profile

---

## Technical Highlights

- **26 currencies** with proper symbol formatting (USD, EUR, GBP, JPY, and 22 more)
- **Encrypted credential storage** — sodium_crypto_secretbox, not plaintext
- **Token caching** — dual-storage (transient + wp_options fallback) with 5-minute early refresh buffer
- **Retry logic** — exponential backoff for transient PayPal API errors
- **404 auto-recreate** — if a button is deleted on PayPal's side, editing it in WordPress automatically creates a new one
- **Backward compatible** — existing paste-code buttons continue to work unchanged
- **Free for all plans** — no Jetpack plan gating (removed `value_bundle` requirement)
- **Standalone plugin** — works outside Jetpack monorepo via WordPress Playground

### Test Coverage

| Layer | Count | Status |
|---|---|---|
| PHPUnit | 163+ tests | All passing |
| Jest | 109+ tests | All passing |
| Playwright E2E | 33 specs | Written, pending execution |

### Quality Gates

- Two adversarial council reviews (5-persona) — 4 VETOs resolved, 20+ should-fix items resolved
- Pluginomattic test_plan.md gate document
- PHPCS, ESLint, Prettier, Stylelint all passing
- UX expert review (15 findings, all addressed)
- Block development patterns audit (all passing)

---

## What's Left

| Item | Owner | ETA |
|---|---|---|
| Playwright E2E execution (33 specs) | Andrew | Week of Mar 24 |
| 13 manual test points (a11y, Playground, live PayPal API) | Andrew | Week of Mar 24 |
| BN code method confirmation (WOOPTP-187) | Andrew to confirm with Jarred | Next biweekly |
| PR submission to Jetpack trunk (WOOPTP-156) | Andrew | March 31 |
| Jetpack 15.7 RC testing (WOOPTP-157) | Andrew | April 7 |
| Compatibility testing (WP/PHP matrix) | Andrew | In progress |

---

## How to Test

### WordPress Playground (fastest)

Click the Playground link at the top of this post. The plugin installs automatically with sandbox credentials and demo posts.

### Local (Jetpack fork)

```bash
git clone https://github.com/slash1andy/jetpack.git
cd jetpack
git checkout paypal-payment-buttons-v2
pnpm install && pnpm jetpack build packages/paypal-payments
```

---

## Team

- **Andrew Wikel** — Payment Partnerships TAM, project owner
- **PayPal contacts:** Rachna Tibrewala (Lead Architect), Jarred De Salme (Partner), Stella (PM), Jeeva (Engineering)
- **Meeting cadence:** Woo+PayPal Biweekly

Feedback welcome — especially on the wizard UX and admin dashboard. Try the Playground demo and let me know what you think.
