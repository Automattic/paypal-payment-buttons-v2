# PayPal Payment Buttons V2 — Implementation Repository

Pre-integration implementation for the PayPal Payment Buttons V2 API-driven flow. This repo contains the full implementation organized by Linear issue, ready for integration into the Jetpack monorepo.

**Target:** WordCamp Asia (April 2026) / Jetpack 15.7
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
| WOOPTP-156 | Security review & hardening | Backlog |
| WOOPTP-157 | Performance optimization | Backlog |
| WOOPTP-158 | Accessibility audit | Backlog |
| WOOPTP-159 | Jetpack monorepo integration | Backlog |

## Directory Structure

```
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
├── WOOPTP-154/          # E2E Tests — 18 Playwright tests
│   ├── paypal-payment-buttons.spec.js
│   ├── paypal-api-mock.js
│   ├── playwright.config.js
│   └── PR-DESCRIPTION.md
│
└── WOOPTP-155/          # Documentation
    ├── readme.txt         (WordPress.org)
    ├── rest-api-reference.md
    ├── troubleshooting-guide.md
    └── PR-DESCRIPTION.md
```

## Key Technical Details

- **OAuth:** AES-256-CBC encrypted credentials, transient-based token caching with 5-min early refresh
- **API:** PayPal Pay Links & Buttons API (`/v1/checkout/payment-resources`), BN code: `WooNCPS_Ecom_Wordpress`
- **Retry:** Exponential backoff (1s → 2s → 4s) on 500/502/503, auto token refresh on 401/403
- **Security:** PayPal URL domain whitelist, server-side + client-side validation, `manage_options` capability checks
- **Compatibility:** `deprecated.js` handles v0.4.0-alpha → v0.8.0 block migration, no forced migration
- **Tests:** 154 total (113 PHP + 41 JS unit tests, 18 E2E)

## Canonical File Versions

When integrating, use the latest version of each file (later issues supersede earlier ones):

| File | Use from |
|------|----------|
| `class-paypal-oauth.php` | WOOPTP-146 |
| `class-paypal-api-client.php` | WOOPTP-151 |
| `class-paypal-rest-controller.php` | WOOPTP-151 |
| `class-paypal-attribute-mapper.php` | WOOPTP-148 |
| `block-v2.json` | WOOPTP-152 |
| `index.js` | WOOPTP-152 |
| `edit.js` | WOOPTP-151 |
| `save.js` | WOOPTP-152 |
| `deprecated.js` | WOOPTP-152 |
| `paypal-button-preview.js` | WOOPTP-150 |
| `editor.scss` | WOOPTP-151 |
| `style.scss` | WOOPTP-150 |
| `validation.js` | WOOPTP-153 |

## Reference Documents

- `prd-paypal-payment-buttons-v2.md` — Full PRD with scope, timeline, architecture
- `paypal-pay-links-buttons-api-reference.md` — PayPal API endpoints, schemas, error codes
- `questions-for-jarred.md` — Open questions for PayPal partnership contact
