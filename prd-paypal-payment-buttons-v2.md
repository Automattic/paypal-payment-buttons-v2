# PRD: PayPal Payment Buttons V2 — API-Driven Integration

**Status:** Active — API docs confirmed
**Author:** Andrew Wikel (Payment Partnerships TAM)
**Date:** 2026-03-10
**Target:** WordCamp Asia (April 9–11, 2026) — Jetpack 15.7
**Linear Project:** PayPal Payment Buttons V2: API Integration
**Predecessor:** [Woo: PayPal No-Code Payment Solution Block Plugin](https://linear.app/a8c/project/woo-paypal-no-code-payment-solution-block-plugin-bad73311b6c3) (Completed)

---

## 1. Problem Statement

The current PayPal Payment Buttons block (v0.4.0-alpha) requires merchants to manually visit PayPal.com, create a button, copy generated HTML code, and paste it into the WordPress block editor. This friction-heavy workflow creates several problems:

- **Discovery gap:** PayPal requires manual search on WordPress, while Stripe is natively integrated and discoverable
- **UX mismatch:** The copy-paste flow feels outdated compared to Stripe's seamless no-code experience in Jetpack
- **Conversion drop-off:** Every step outside the WordPress editor is a point where merchants abandon the setup
- **Internal perception:** PayPal internally views the current solution as being "behind a paywall" due to setup complexity
- **Fragmented UI:** WordPress.com and Jetpack show redundant, confusing options (Payments, Payment Buttons, PayPal, Donation Form) via the `/pay` command

PayPal launched the **Pay Links & Buttons API** in November 2025, which enables programmatic button creation — the same capability that makes Stripe's integration seamless. This API is the key to solving all of the above problems.

## 2. Goals

| Goal | Metric | Target |
|------|--------|--------|
| Eliminate copy-paste workflow | Steps to create a PayPal button | From 8+ steps → 3 steps (all in-editor) |
| Match Stripe parity | Feature comparison score | Full parity on no-code payment creation |
| Maintain revenue attribution | BN code injection rate | 100% of buttons include A8C BN code |
| Ship before WordCamp Asia | Release date | Jetpack 15.7 (early April 2026) |
| Block consolidation | Number of `/pay` block options | Reduce from 4+ redundant options → 1 unified block |

## 3. Target Users

- **WordPress.com site owners** (all tiers including Free) who want to accept PayPal payments
- **WordPress.org site owners** with Jetpack connected who want a no-code payment solution
- **Small businesses and solopreneurs** who need to sell products or accept donations without WooCommerce

## 4. Solution Overview

Replace the paste-code block editor experience with a fully API-driven flow using PayPal's Pay Links & Buttons API (`POST /v1/checkout/payment-resources`). The merchant never leaves the WordPress editor.

### 4.1 User Flow (Target State)

1. Merchant opens block editor, types `/pay` or adds PayPal Payment Buttons block
2. Block presents a clean form: product name, price, currency, button type
3. Merchant fills in details and clicks "Create Button"
4. Plugin calls PayPal API server-side to create the payment resource
5. Block renders a live preview of the PayPal button
6. On the frontend, the button renders with A8C BN code injected for revenue attribution

### 4.2 Architecture

```
WordPress Block Editor (React)
    ↓ REST API call
WordPress REST endpoint (PHP)
    ↓ Server-side API call (with OAuth + BN code)
PayPal Pay Links & Buttons API (v1/checkout/payment-resources)
    ↓ Response with button ID + payment URL
Block stores structured attributes (button_id, payment_url, type, etc.)
    ↓ Frontend render
PayPal JS SDK renders hosted button with BN attribution
```

### 4.3 Key Technical Components

**New WordPress REST API Endpoints (PHP):**
- `POST /wp-json/jetpack/v4/paypal/buttons` — Create a new PayPal button
- `GET /wp-json/jetpack/v4/paypal/buttons` — List merchant's existing buttons
- `GET /wp-json/jetpack/v4/paypal/buttons/{id}` — Get button details
- `PUT /wp-json/jetpack/v4/paypal/buttons/{id}` — Update a button
- `DELETE /wp-json/jetpack/v4/paypal/buttons/{id}` — Delete a button
- `POST /wp-json/jetpack/v4/paypal/connect` — Initiate PayPal OAuth connection

**PayPal API Integration (PHP):**
- OAuth 2.0 authentication flow (client_id + secret → Bearer token)
- Server-side calls to `POST /v1/checkout/payment-resources`
- BN code (`WooNCPS_Ecom_Wordpress`) injected as partner attribution in API headers
- Token caching and refresh logic
- Sandbox/production environment switching

**Block Editor Updates (React/JS):**
- New `edit.js` component with product form UI (name, price, currency, type)
- Button type selector (Buy Now, Donate, Subscribe)
- Live preview rendering after button creation
- "Manage Buttons" panel to edit/delete existing buttons
- Connection status indicator (connected vs needs PayPal auth)

**PayPal OAuth Connection Flow:**
- Merchant clicks "Connect PayPal" in block settings
- Redirect to PayPal OAuth consent screen
- Callback stores encrypted credentials in WordPress options
- Credentials used for all subsequent API calls

## 5. Scope

### 5.1 In Scope (Phase 1 — WordCamp Asia)

- API-driven button creation (Buy Now type at minimum)
- PayPal OAuth connection flow for merchant authentication
- Server-side REST endpoints wrapping PayPal's Pay Links & Buttons API
- BN code injection for revenue attribution
- Block editor form UI replacing the paste-code textarea
- Live button preview in editor
- Frontend rendering via PayPal JS SDK with attribution
- Backward compatibility with existing paste-code blocks (don't break them)
- Unit tests (PHP + JS) and E2E tests
- Updated documentation and readme.txt

### 5.2 Out of Scope (Phase 2 — Post WordCamp)

- Block consolidation (merging PayPal into unified `/pay` block)
- Smart button ordering (PayPal first in regions without Stripe)
- Donation and Subscribe button types via API
- Button management dashboard (list all buttons)
- Cart/multi-item support via API
- Deprecation of Simple Payments block
- Variants and shipping options

## 6. PayPal Pay Links & Buttons API Reference

> **Status:** ✅ Confirmed from official docs at https://docs.paypal.ai/payments/pay-links-buttons-api (2026-03-11)
> Full reference saved separately: `paypal-pay-links-buttons-api-reference.md`

**Production:** `https://api.paypal.com/v1/checkout/payment-resources`
**Sandbox:** `https://api-m.sandbox.paypal.com/v1/checkout/payment-resources`
**Auth:** OAuth 2.0 Bearer token (via `POST /v1/oauth2/token` with client_id + client_secret)

### Endpoints

| Method | Endpoint | Response |
|--------|----------|----------|
| POST | `/v1/checkout/payment-resources` | 201 Created — returns resource with `id`, `payment_link`, `status` |
| GET | `/v1/checkout/payment-resources` | 200 OK — paginated list (`page_size`, `page_token`) |
| GET | `/v1/checkout/payment-resources/{id}` | 200 OK — full resource details |
| PUT | `/v1/checkout/payment-resources/{id}` | 200 OK / 204 — full replacement (no PATCH) |
| DELETE | `/v1/checkout/payment-resources/{id}` | 204 No Content |

### Minimal Create Request (Phase 1)

```json
{
  "type": "BUY_NOW",
  "integration_mode": "LINK",
  "reusable": "MULTIPLE",
  "line_items": [{
    "name": "Product Name",
    "unit_amount": { "currency_code": "USD", "value": "29.99" }
  }]
}
```

**Required fields:** `type`, `integration_mode`, `line_items[].name`, `line_items[].unit_amount`

### Response (Key Fields)

- `id` — PayPal resource ID (format: `PLB-XXXXXXXXXXXX`)
- `payment_link` — Shareable URL for customers (e.g., `https://www.paypal.com/ncp/payment/PLB-xxx`)
- `status` — `ACTIVE` after creation
- `links[]` — HATEOAS navigation (self, replace, edit, delete, payment_link)

### Integration Modes
- `LINK` — Returns a shareable payment URL to a PayPal-hosted checkout page
- `BUTTON` — Same API; we render the button ourselves using the returned link

**Important:** The API does NOT generate button code snippets. It returns a `payment_link` URL. We build our own embeddable button pointing to this URL.

### Additional Product Fields (Phase 2)

| Field | Description |
|-------|-------------|
| `product_id` | Merchant tracking ID |
| `description` | Product description |
| `taxes[]` | Percentage or profile-based tax |
| `shipping[]` | Flat or profile-based shipping |
| `collect_shipping_address` | Require address at checkout |
| `customer_notes[]` | Custom input fields |
| `variants.dimensions[]` | Up to 5 dimensions × 10 options; primary dimension can have per-option pricing |
| `adjustable_quantity.maximum` | Max purchasable units |
| `return_url` | Redirect after payment |

### Partner Attribution
- Header: `PayPal-Partner-Attribution-Id: WooNCPS_Ecom_Wordpress`
- Must be included on every API call for revenue share tracking

### Error Codes

| HTTP | Error | Cause |
|------|-------|-------|
| 400 | `INVALID_REQUEST` | Missing required fields |
| 403 | `NOT_AUTHORIZED` | Expired token or Payment Links not enabled in PayPal dashboard |
| 404 | `RESOURCE_NOT_FOUND` | Wrong/deleted resource ID |
| 422 | `UNPROCESSABLE_ENTITY` | Invalid amount, unsupported currency |
| 500 | `INTERNAL_SERVER_ERROR` | Temporary — retry |

## 7. Technical Architecture

### 7.1 Repository Structure

**Jetpack Monorepo (Automattic/jetpack):**
```
projects/
├── packages/paypal-payments/     ← Core logic lives here
│   ├── src/
│   │   ├── paypal-payment-buttons/
│   │   │   ├── class-paypal-payment-buttons.php  ← Add API client
│   │   │   ├── class-paypal-api-client.php       ← NEW: API wrapper
│   │   │   ├── class-paypal-oauth.php            ← NEW: OAuth flow
│   │   │   ├── class-paypal-rest-controller.php  ← NEW: WP REST endpoints
│   │   │   ├── edit.js                           ← Replace with form UI
│   │   │   └── block.json                        ← Update attributes
│   │   └── block/                                ← Legacy Simple Payments
│   └── tests/
├── plugins/paypal-payment-buttons/  ← Thin wrapper (minimal changes)
│   ├── paypal-payment-buttons.php
│   └── src/class-paypal-payment-buttons.php
```

### 7.2 Security Requirements

- OAuth credentials stored encrypted in `wp_options` (use `Jetpack_Options` or WordPress `update_option` with encryption)
- All API calls server-side only (never expose client_secret to browser)
- Nonce verification on all REST endpoints
- Capability checks (`manage_options`) on all admin endpoints
- Input sanitization using `sanitize_text_field()`, `absint()`, and PayPal domain whitelist
- PayPal URL validation (only `paypal.com` and `sandbox.paypal.com` domains)
- CSRF protection on OAuth callback

### 7.3 Backward Compatibility

- Existing blocks using paste-code approach must continue to render correctly
- Block attribute schema must support both old (scriptSrc, hostedButtonId, buttonText) and new (button_id, payment_url, api_managed) attributes
- Migration path: existing blocks are not auto-migrated but continue working
- New blocks default to API-driven flow when PayPal is connected

## 8. Delivery Plan

### Week 1 (Mar 10–16): Foundation
- Clone repo, set up dev environment
- Implement PayPal OAuth connection flow
- Create `PayPal_API_Client` class with token management
- Set up sandbox testing credentials

### Week 2 (Mar 17–23): Core API Integration
- Implement WP REST endpoints (create, read, update, delete buttons)
- Build block editor form UI (product name, price, currency)
- Wire up form → REST endpoint → PayPal API → response
- BN code injection in API headers

### Week 3 (Mar 24–30): Polish & Preview
- Live button preview in editor
- Error handling and validation
- Backward compatibility testing
- Unit tests (PHP + Jest)

### Week 4 (Mar 31–Apr 7): Ship
- E2E tests with Playwright
- Documentation updates (readme.txt, support docs)
- Code review and PR submission
- Jetpack 15.7 release candidate testing

### Buffer (Apr 7–9): Final fixes before WordCamp Asia

## 9. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| PayPal API docs delayed from Jarred | Medium | High | Use public docs + sandbox testing; escalate via Silu |
| OAuth flow complexity exceeds estimate | Medium | Medium | Start with API key auth as fallback; upgrade to OAuth in Phase 1.5 |
| Eric on medical leave, Warren unfamiliar with codebase | High | Medium | Andrew executes directly; Gary authorized bypass of standard protocols |
| Jetpack 15.7 code freeze before completion | Low | High | Submit PR early; use feature flag to ship behind toggle |
| BN code attribution breaks | Low | Critical | Extensive testing; maintain existing constant pattern |

## 10. Success Criteria

- [ ] Merchant can create a PayPal button entirely within the WordPress block editor
- [ ] No copy-paste of PayPal code required
- [ ] BN code `WooNCPS_Ecom_Wordpress` present in 100% of API calls
- [ ] Existing paste-code blocks continue rendering correctly
- [ ] All unit and E2E tests passing
- [ ] Shipped in Jetpack 15.7 before WordCamp Asia
- [ ] PR merged to Jetpack monorepo `trunk` branch

## 11. Open Questions

1. ~~**OAuth vs API Key:** Does the Pay Links & Buttons API support simpler auth than full OAuth?~~ **ANSWERED:** OAuth 2.0 client credentials only. Merchant must obtain client_id + secret from PayPal Developer Dashboard.
2. ~~**Button Types:** Which types are supported at launch?~~ **ANSWERED:** `BUY_NOW` confirmed. Donate/Subscribe not documented in current API — likely Phase 2 or requires different API surface.
3. **Webhook Support:** Does the API send webhooks for payment events, or is this fire-and-forget? Docs confirm email notifications to both parties but no webhook details. **Ask Jarred.**
4. **Rate Limits:** What are the API rate limits? Not documented. **Ask Jarred.**
5. **Sandbox Access:** Need sandbox app credentials with "Payment Links and Buttons" enabled. Can self-provision via PayPal Developer Dashboard.
6. **BN Code Header:** Confirm that `PayPal-Partner-Attribution-Id` header is supported on `/v1/checkout/payment-resources` endpoint. Standard PayPal convention but not explicitly documented for this API. **Ask Jarred.**
7. **PATCH vs PUT:** Docs say "The API currently only uses PUT calls instead of PATCH calls" — full replacement semantics confirmed. Our update endpoint should send complete resource body.

## 12. References

- [PayPal Pay Links & Buttons API](https://docs.paypal.ai/payments/pay-links-buttons-api)
- [PayPal No-Code Payment Overview](https://developer.paypal.com/studio/checkout/no-code)
- [Original NCPS Project (Linear)](https://linear.app/a8c/project/woo-paypal-no-code-payment-solution-block-plugin-bad73311b6c3)
- [Jetpack Monorepo](https://github.com/Automattic/jetpack)
- [Plugin Mirror](https://github.com/Automattic/paypal-payment-buttons)
- [WordPress.org Listing](https://wordpress.org/plugins/paypal-payment-buttons/)
- Quill Meeting: [Jetpack PayPal Integration Strategy Meeting (2026-03-10)](quill://meeting/be811df4-2197-4c79-9ce5-348ad2a66be8)
- Quill Meeting: [WooCommerce / PayPal / Syde Review (2026-03-10)](quill://meeting/e74bdbbb-9202-4560-98c4-0dc412348987)
