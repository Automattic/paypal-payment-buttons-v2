# PayPal Payment Buttons V2 — Implementation Repository

Pre-launch implementation workspace for the PayPal Payment Buttons V2 API-driven flow. This repo contains the full plugin source (as a standalone `compat-plugin`) plus per-ticket implementation archives organized by Linear issue. The plugin has not yet shipped — target is WordCamp EU via Jetpack and as a standalone plugin.

**Status:** Pre-launch — pending Jetpack monorepo integration (WOOPTP-159)
**Target:** WordCamp EU 2026
**Package:** `automattic/jetpack-paypal-payments`
**Block:** `jetpack/paypal-payment-buttons`

**[Launch Live Demo in WordPress Playground](https://playground.wordpress.net/?blueprint-url=https://raw.githubusercontent.com/Automattic/paypal-payment-buttons-v2/trunk/playground-blueprint.json)** (see [PLAYGROUND-INSTRUCTIONS.md](PLAYGROUND-INSTRUCTIONS.md) for details)

## Architecture

```
PayPal Developer Dashboard
    │
    ▼ (Client ID + Secret)
WordPress Block Editor
    │
    ▼ (REST API)
PayPal_REST_Controller ──→ PayPal_Attribute_Mapper (validation)
    │
    ▼ (authenticated request)
PayPal_API_Client ──→ PayPal_OAuth (token management)
    │
    ▼ (POST /v1/checkout/payment-resources)
PayPal Pay Links & Buttons API
    │
    ▼ (payment_link URL)
Published Page → PayPal-branded button → PayPal Checkout
```

## Implementation Status

| Issue | Title | Status |
|-------|-------|--------|
| WOOPTP-146 | OAuth 2.0 connection flow | Done |
| WOOPTP-147 | PayPal API client (CRUD) | Done |
| WOOPTP-148 | Attribute mapper & validation | Done |
| WOOPTP-149 | Block editor form UI | Done |
| WOOPTP-150 | Live button preview | Done |
| WOOPTP-151 | Error handling, validation, edge cases | Done |
| WOOPTP-152 | Backward compatibility | Done |
| WOOPTP-153 | Unit tests (PHPUnit + Jest) | Done |
| WOOPTP-154 | E2E tests (Playwright) | Done |
| WOOPTP-155 | Documentation | Done |
| WOOPTP-156 | Security review & hardening | Done (PRs #26, #28, #29) |
| WOOPTP-157 | Performance optimization | Done (PRs #26, #28) |
| WOOPTP-158 | Accessibility audit | Done (PRs #26, #28) |
| WOOPTP-159 | Jetpack monorepo integration | Pending |
| WOOPTP-160 | Fix payment_link HATEOAS extraction | Done |
| WOOPTP-161 | Align frontend PHP rendering with editor | Done |
| WOOPTP-162 | Guided credential entry UX | Done |
| WOOPTP-163 | Dual environment credential storage | Done |
| WOOPTP-164 | Token pre-validation on connect | Done |
| WOOPTP-165 | Pre-request token expiry check | Done |
| WOOPTP-166 | Fix PayPal SVG block icon | Done |
| WOOPTP-167 | Standalone script stubs for Playground mode | Done |
| WOOPTP-267 | Partner Referrals onboarding (Connect with PayPal) | Done (PRs #25, #31) |
| WOOPTP-279 | Hardcode partner ID + proxy signup link through WPCOM | Done (PR #31) |
| WOOPTP-194 | Jetpack Tracks event instrumentation | In Progress (PR #33) |

## Directory Structure

```
compat-plugin/
├── paypal-payment-buttons/
│   ├── paypal-payment-buttons.php   ← Plugin entry point
│   ├── readme.txt
│   ├── src/                         ← PHP + JS source (canonical plugin code)
│   │   ├── class-paypal-payment-buttons.php
│   │   └── paypal-payment-buttons/  ← All PHP classes + block files
│   └── dist/                        ← Built assets (webpack output)
└── .wp-env.json

compat-results/                      ← WP/PHP compat test matrix results
└── summary.md

implementation/
├── WOOPTP-146/          # OAuth 2.0 — encrypted credential storage, token caching
│   ├── class-paypal-oauth.php
│   ├── class-paypal-rest-controller.php   (connection endpoints)
│   ├── PayPal_OAuth_Test.php              (22 tests)
│   └── PR-DESCRIPTION.md
│
├── WOOPTP-147/          # API Client — CRUD operations, error mapping
│   ├── class-paypal-api-client.php
│   ├── class-paypal-rest-controller.php   (button CRUD endpoints)
│   ├── PayPal_API_Client_Test.php         (28 tests)
│   └── PR-DESCRIPTION.md
│
├── WOOPTP-148/          # Attribute Mapper — validation, bidirectional mapping
│   ├── class-paypal-attribute-mapper.php
│   ├── block-v2.json
│   └── PR-DESCRIPTION.md
│
├── WOOPTP-149/          # Block Editor UI — form, connection, states
│   ├── edit.js
│   ├── editor.scss
│   └── PR-DESCRIPTION.md
│
├── WOOPTP-150/          # Live Preview — PayPal-branded button, save component
│   ├── paypal-button-preview.js
│   ├── save.js
│   ├── edit.js            (supersedes WOOPTP-149)
│   ├── editor.scss        (supersedes WOOPTP-149)
│   ├── style.scss
│   └── PR-DESCRIPTION.md
│
├── WOOPTP-151/          # Error Handling — retry, backoff, validation, URL whitelist
│   ├── class-paypal-api-client.php        (supersedes WOOPTP-147)
│   ├── class-paypal-rest-controller.php   (supersedes WOOPTP-147)
│   ├── edit.js            (supersedes WOOPTP-150)
│   ├── editor.scss        (supersedes WOOPTP-150)
│   └── PR-DESCRIPTION.md
│
├── WOOPTP-152/          # Backward Compatibility — deprecated.js, block registration
│   ├── deprecated.js
│   ├── save.js            (supersedes WOOPTP-150)
│   ├── index.js
│   ├── block-v2.json      (supersedes WOOPTP-148)
│   └── PR-DESCRIPTION.md
│
├── WOOPTP-153/          # Unit Tests — 104 new tests
│   ├── PayPal_Attribute_Mapper_Test.php   (30 tests)
│   ├── PayPal_REST_Controller_Test.php    (17 tests)
│   ├── PayPal_API_Client_Retry_Test.php   (16 tests)
│   ├── validation.js      (extracted testable module)
│   ├── validation.test.js                 (16 tests)
│   ├── paypal-button-preview.test.js      (11 tests)
│   ├── save.test.js                       (6 tests)
│   ├── deprecated.test.js                 (8 tests)
│   └── PR-DESCRIPTION.md
│
├── WOOPTP-154/          # E2E Tests — Playwright suite
│   ├── paypal-payment-buttons.spec.js
│   ├── paypal-api-mock.js
│   ├── playwright.config.js
│   └── PR-DESCRIPTION.md
│
├── WOOPTP-155/          # Documentation
│   ├── readme.txt         (WordPress.org)
│   ├── rest-api-reference.md
│   ├── troubleshooting-guide.md
│   └── PR-DESCRIPTION.md
│
├── WOOPTP-161/          # Frontend Rendering Parity
│   ├── class-paypal-payment-buttons.php  (currency symbols, logo SVG)
│   ├── block.json
│   ├── style.scss
│   └── webpack.config.blocks.js
│
├── WOOPTP-162/          # Guided Credential Wizard
│   ├── edit.js            (supersedes WOOPTP-151)
│   ├── editor.scss        (supersedes WOOPTP-151)
│   └── PR-DESCRIPTION.md
│
├── WOOPTP-163/          # Dual Environment — production default
│   ├── changes.patch
│   └── PR-DESCRIPTION.md
│
├── WOOPTP-164/          # Token Pre-validation on Connect
│   ├── class-paypal-oauth.php        (supersedes WOOPTP-146)
│   ├── class-paypal-rest-controller.php (supersedes WOOPTP-151)
│   ├── changes.patch
│   └── PR-DESCRIPTION.md
│
├── WOOPTP-165/          # Pre-request Token Expiry Check
│   ├── class-paypal-oauth.php        (supersedes WOOPTP-164)
│   ├── changes.patch
│   └── PR-DESCRIPTION.md
│
├── WOOPTP-166/          # Fix PayPal SVG Block Icon
│   └── PR-DESCRIPTION.md
│
└── WOOPTP-167/          # Standalone Script Stubs for Playground
    └── PR-DESCRIPTION.md
```

## Key Technical Details

- **OAuth:** Credentials stored in `wp_options` with `wp_hash()` integrity protection, transient + absolute-timestamp token caching (WOOPTP-165), pre-validation of Payment Links API access on connect (WOOPTP-164)
- **API:** PayPal Pay Links & Buttons API (`/v1/checkout/payment-resources`), BN code: `WooNCPS_Ecom_Wordpress`
- **Onboarding:** Partner Referrals flow via WPCOM proxy (`/api/v1.1/sites/$site_id/paypal/partner-referrals`); partner ID hardcoded as `AUTOMATTIC_SANDBOX_PARTNER_ID` / `AUTOMATTIC_PARTNER_ID`
- **Retry:** Exponential backoff (1s → 2s → 4s) on 500/502/503, auto token refresh on 401/403
- **Security:** PayPal URL domain whitelist, server-side + client-side validation, `manage_options` capability checks
- **Compatibility:** `deprecated.js` handles v0.4.0-alpha → v0.8.0 block migration, no forced migration; compat-plugin tested on WP 6.5–6.8 / PHP 7.4–8.4
- **Analytics:** Jetpack Tracks instrumentation in progress (WOOPTP-194, PR #33)

## Canonical File Versions

When integrating, use the latest version of each file (later issues supersede earlier ones). The `compat-plugin/paypal-payment-buttons/src/` directory is the current source of truth.

| File | Use from |
|------|----------|
| `class-paypal-oauth.php` | WOOPTP-165 (includes 163, 164) |
| `class-paypal-api-client.php` | WOOPTP-151 |
| `class-paypal-rest-controller.php` | WOOPTP-164 (includes 163) |
| `class-paypal-payment-buttons.php` (package) | WOOPTP-161 |
| `class-paypal-payment-buttons.php` (plugin) | WOOPTP-167 (standalone stubs) |
| `register-jetpack-block.js` | WOOPTP-166 (icon fix) |
| `class-paypal-attribute-mapper.php` | WOOPTP-148 |
| `block-v2.json` | WOOPTP-152 |
| `index.js` | WOOPTP-152 |
| `edit.js` | WOOPTP-162 |
| `save.js` | WOOPTP-152 |
| `deprecated.js` | WOOPTP-152 |
| `paypal-button-preview.js` | WOOPTP-150 |
| `editor.scss` | WOOPTP-162 |
| `style.scss` | WOOPTP-161 |
| `validation.js` | WOOPTP-153 |

## Reference Documents

- `prd-paypal-payment-buttons-v2.md` — Full PRD with scope, timeline, architecture
- `paypal-pay-links-buttons-api-reference.md` — PayPal API endpoints, schemas, error codes
- `DEEP-AUDIT-2026-03-27.md` — Deep security/perf/a11y audit findings and resolutions
- `PLUGINOMATTIC-INTEGRATION-PLAN.md` — Pluginomattic methodology application plan
