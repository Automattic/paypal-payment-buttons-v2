# CONSOLIDATED — Canonical File Manifest

**Produced:** 2026-03-14 | **Updated:** 2026-03-26
**Purpose:** Single source of truth for all files to be applied to the Jetpack repo for PR submission.
**Apply script:** `./apply-to-jetpack.sh [JETPACK_ROOT]`
**Target:** `projects/packages/paypal-payments/src/paypal-payment-buttons/`

Each file is the canonical final version: the highest-numbered ticket that last touched it, with all P2 council fixes and WOOPTP-163 production-default test fixes applied.

---

## PHP Source Files

| File | Source Ticket | Notes |
|------|--------------|-------|
| `php/class-paypal-oauth.php` | WOOPTP-165 | Includes dual-storage token expiry (WOOPTP-165) and production default (WOOPTP-163) |
| `php/class-paypal-rest-controller.php` | WOOPTP-164 | Includes token pre-validation on connect (WOOPTP-164) and previous-environment restore fix (P2) |
| `php/class-paypal-api-client.php` | WOOPTP-151 | Includes retry logic, URL domain whitelist, BN code via `at_code` query param |
| `php/class-paypal-attribute-mapper.php` | WOOPTP-148 | Validation, bidirectional mapping, merge logic |
| `php/class-paypal-payment-buttons.php` | WOOPTP-161 + WOOPTP-167 | WOOPTP-161 base; `register_standalone_script_stubs()` per WOOPTP-167; theme-native checkout button (2026-03-26) — removed PayPal logo SVG, debit button, `get_paypal_logo_svg()` method; uses `wp-element-button`; default "Buy Now" |
| `php/class-paypal-tracks.php` | WOOPTP-194 | Tracks analytics helper — wraps `Automattic\Jetpack\Tracking` server-side, inline `_tkq` push for frontend renders; graceful no-op in standalone mode |

---

## JS Source Files

| File | Source Ticket | Notes |
|------|--------------|-------|
| `js/edit.js` | WOOPTP-162 | Final wizard UX; removed buttonType selector and PayPal branding (2026-03-26) |
| `js/save.js` | WOOPTP-156 | API-managed + legacy save paths; theme-native `wp-element-button` checkout link, default "Buy Now" (2026-03-26) |
| `js/deprecated.js` | WOOPTP-152 | Block migration handler |
| `js/index.js` | WOOPTP-152 | Block registration entry point |
| `js/paypal-button-preview.js` | WOOPTP-156 | Product card preview; neutral checkout button, removed PayPal logo and debit button (2026-03-26) |
| ~~`js/paypal-logo.js`~~ | — | **Deleted 2026-03-26** — orphaned after PayPal branding removed from button |
| `js/validation.js` | WOOPTP-153 | Extracted validation module (testable) |
| `js/tracks.js` | WOOPTP-194 | Tracks analytics helper — pushes events to `window._tkq`, safe no-op when Tracks unavailable |
| `js/webpack.config.blocks.js` | WOOPTP-161 | Webpack build config |

---

## SCSS

| File | Source Ticket | Notes |
|------|--------------|-------|
| `scss/editor.scss` | WOOPTP-162 | Editor styles; neutral checkout button preview replacing PayPal gold (2026-03-26) |
| `scss/style.scss` | WOOPTP-156 | Frontend styles; removed PayPal brand colors and debit button styles, `wp-element-button` theme inheritance (2026-03-26) |

---

## Block Manifests

| File | Source Ticket | Notes |
|------|--------------|-------|
| `block/block.json` | WOOPTP-161 | V2 block metadata; `buttonText` default "Buy Now", `buttonType` default "single" (2026-03-26) |
| `block/block-v2.json` | WOOPTP-152 | V2 block schema for deprecated handler |

---

## PHP Tests (PHPUnit — 163 tests, 349 assertions ✅)

| File | Source Ticket | Tests | Covers |
|------|--------------|-------|--------|
| `tests/php/PayPal_OAuth_Test.php` | WOOPTP-146 | 22 | Credential encryption, environment, token caching, integrity — 8 assertions fixed for WOOPTP-163 production default |
| `tests/php/PayPal_API_Client_Test.php` | WOOPTP-147 | 28 | CRUD, error handling, request format |
| `tests/php/PayPal_Attribute_Mapper_Test.php` | WOOPTP-153 | 30 | Validation, bidirectional mapping, merge, resource ID format |
| `tests/php/PayPal_REST_Controller_Test.php` | WOOPTP-153 | 17 | Permission checks, input validation, error normalization |
| `tests/php/PayPal_API_Client_Retry_Test.php` | WOOPTP-153 | 16 | Retry logic, backoff, 403 auth retry, timeout detection |
| `tests/php/PayPal_Tracks_Test.php` | WOOPTP-194 | 4 | Graceful no-op guarantee; empty event-name guard |

---

## JS Tests (Jest — 105 tests, 11 suites ✅)

| File | Source Ticket | Tests | Covers |
|------|--------------|-------|--------|
| `tests/js/validation.test.js` | WOOPTP-153 | 16 | `validatePrice`, `validateProductName`, `validateDescription`, error mapping |
| `tests/js/tracks.test.js` | WOOPTP-194 | 5 | `recordEvent` push semantics, empty-name guard, error swallowing |
| `tests/js/paypal-button-preview.test.js` | WOOPTP-153 | 11 | Product card rendering, currency formatting, layout variants |
| `tests/js/save.test.js` | WOOPTP-153 | 6 | API-managed, legacy, stacked/single, empty fallback |
| `tests/js/deprecated.test.js` | WOOPTP-153 | 8 | `isEligible` detection, `migrate` transformation, deprecated markup |
| `tests/js/edit.test.js` | WOOPTP-153 | — | Wizard flow (WOOPTP-162): step nav, credential entry, env toggle, connect |
| `tests/js/api-fetch-mock.js` | WOOPTP-153 | — | Shared apiFetch mock for JS tests |

---

## E2E Tests (Playwright — 33 specs)

| File | Source Ticket | Notes |
|------|--------------|-------|
| `tests/e2e/paypal-payment-buttons.spec.js` | WOOPTP-154 | 33 specs across 9 sections (updated 2026-03-15 for WOOPTP-162/163/164/166) |
| `tests/e2e/paypal-api-mock.js` | WOOPTP-154 | Reusable API mock / route interceptors |
| `tests/e2e/playwright.config.js` | WOOPTP-154 | Local + CI config |

---

## Docs

| File | Source Ticket | Notes |
|------|--------------|-------|
| `docs/readme.txt` | WOOPTP-155 | Plugin readme; P1 + P2 council corrections applied |
| `docs/rest-api-reference.md` | WOOPTP-155 | Developer API reference; P1 + P2 council corrections applied |
| `docs/troubleshooting-guide.md` | WOOPTP-155 | User troubleshooting guide; P1 + P2 council corrections applied |
| `docs/test_plan.md` | WOOPTP-186 | Pluginomattic Quality Gate test plan (created 2026-03-15) |

---

## Jetpack Monorepo Changes (not standalone files)

| Change | Ticket | Status |
|--------|--------|--------|
| `register-jetpack-block.js`: prefer `settings.icon` over metadata icon | WOOPTP-166 | Merged — fork PR #2 |

---

## Test Suite Results (2026-03-15)

| Layer | Count | Status |
|-------|-------|--------|
| PHPUnit | 163 tests, 349 assertions | ✅ All passing |
| Jest | 105 tests, 11 suites | ✅ All passing |
| Playwright E2E | 33 specs | ⬜ Pending — week of Mar 24 |
