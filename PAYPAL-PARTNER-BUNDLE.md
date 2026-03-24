# PayPal Payment Buttons V2 — Partner Update Bundle

**Prepared for:** PayPal (Jarred De Salme, Surupa Chanda)
**Prepared by:** Andrew Wikel (@slashandy), Payment Partnerships TAM
**Date:** 2026-03-24
**Target Launch:** Jetpack 15.7 / WordCamp Asia (April 9–11, 2026)

---

## Executive Summary

PayPal Payment Buttons V2 replaces the legacy NCP code-paste workflow with a modern, API-driven integration using the Pay Links & Buttons API. Users connect via OAuth credentials (Client ID + Client Secret), configure products in the WordPress block editor, and publish — no code copying required.

**Status: On track for Jetpack 15.7 (April 7 ship date)**

- 41 of 57 Linear issues complete (72%)
- 3 of 4 milestones at 100%
- 221 PHP tests passing, 459 assertions
- 105+ JavaScript tests passing
- Full adversarial security review: **READY**
- All medium findings fixed (AUTH_KEY guard, QR code URL, encryption docs)

---

## 1. Linear Project Overview

**Project:** [PayPal Payment Buttons V2: API Integration](https://linear.app/a8c/project/paypal-payment-buttons-v2-api-integration-46f40aa73cf4)
**Team:** Woo Partnerships (WOOPTP)

### Milestones

| Milestone | Target | Progress |
|-----------|--------|----------|
| Foundation & OAuth | 2026-03-16 | **100%** |
| Core API Integration | 2026-03-23 | **100%** |
| Polish & Testing | 2026-03-30 | **100%** |
| Ship & Release | 2026-04-07 | **31%** |

### Remaining Ship & Release Items

| ID | Title | Priority | Due |
|---|---|---|---|
| WOOPTP-229 | PayPal marketing brand review: SVGs, wordmarks, and copy approval | Urgent | Mar 28 |
| WOOPTP-156 | Submit PR to Jetpack monorepo | Urgent | Apr 1 |
| WOOPTP-157 | Jetpack 15.7 release candidate testing | Urgent | Apr 6 |
| WOOPTP-230 | Resolve alpha Composer dependencies | Urgent | Apr 3 |
| WOOPTP-179 | Submit updated PayPal BRC article | Urgent | Mar 28 |
| WOOPTP-191 | Performance testing | High | Apr 2 |
| WOOPTP-233 | Capture documentation screenshots | High | Apr 1 |
| WOOPTP-232 | Cut release branch and verify pipeline | High | Apr 5 |
| WOOPTP-231 | Finalize release artifacts | High | Apr 4 |
| WOOPTP-234 | WordCamp Asia booth demo | High | Apr 5 |
| WOOPTP-194 | Add Tracks analytics | Medium | Mar 30 |
| WOOPTP-155 | Update documentation (readme, support docs) | Medium | Apr 4 |
| WOOPTP-235 | Post-release monitoring | Medium | Apr 14 |

### Critical Path

Brand review (Mar 28) → PR submission (Apr 1) → Alpha deps (Apr 3) → Release artifacts (Apr 4) → Release branch (Apr 5) → RC testing (Apr 6) → **Ship (Apr 7)**

---

## 2. What We've Built

### Core Capabilities (all shipped)

- **OAuth credential wizard** — 4-step guided setup (Welcome → Developer Dashboard → Credentials → Connected)
- **Production-first** — real payments by default; sandbox is opt-in for testing
- **PayPal API client** — full CRUD against Pay Links & Buttons API with exponential backoff retry
- **Sodium encryption** — credentials encrypted at rest (XSalsa20-Poly1305, BLAKE2b key derivation) — strongest credential storage across all 42 reviewed WordPress payment extensions
- **Block editor form** — product name, price, description, image, 26 currencies, product variants (5 dimensions × 10 options), shipping, tax, customer notes, adjustable quantity
- **Live preview** — product card preview in editor matches frontend rendering
- **QR code** — auto-generated for payment link pages
- **Email sending** — wp_mail with rate limiting (10/min per user)
- **Payment Links dashboard** — admin list table for managing all created payment links
- **Backward compatibility** — legacy paste-code buttons continue to render unchanged
- **Dual V1/V2 architecture** — zero disruption to existing buttons during migration

### Architecture

| Component | Purpose |
|-----------|---------|
| `PayPal_OAuth` | Credential encryption, token management, environment switching |
| `PayPal_API_Client` | PayPal API CRUD with retry/backoff and idempotency |
| `PayPal_REST_Controller` | WordPress REST API endpoints (`/jetpack/v4/paypal/`) |
| `PayPal_Attribute_Mapper` | Block ↔ API field bidirectional mapping |
| `PayPal_Payment_Buttons` | Block registration and frontend rendering |
| `PayPal_Admin_Page` | Settings/credential entry page |
| `PayPal_Email_Sender` | Payment link email notifications |
| `PayPal_Payment_Links_List_Table` | Admin dashboard for payment links |

---

## 3. Testing Summary

### Test Coverage

| Layer | Count | Status |
|-------|-------|--------|
| PHPUnit (PHP) | 221 tests, 459 assertions | **All passing** |
| Jest (JavaScript) | 105+ tests, 11 suites | **All passing** |
| Playwright E2E | 33 specs (9 sections) | Scheduled week of Mar 24 |
| **Total** | **359+** | — |

### PHPUnit Coverage Breakdown

| Test Class | Tests | Coverage |
|------------|-------|----------|
| PayPal_OAuth_Test | 22 | Encryption, environment, token caching |
| PayPal_API_Client_Test | 28 | CRUD, error handling, request formatting |
| PayPal_API_Client_Retry_Test | 16 | Retry logic, backoff, auth retry, timeouts |
| PayPal_Attribute_Mapper_Test | 30 | Validation, bidirectional mapping, merge logic |
| PayPal_REST_Controller_Test | 17 | Permission checks, input validation, error normalization |
| PayPal_Admin_Page_Test | — | Admin page rendering |
| PayPal_Email_Sender_Test | — | Email notification tests |
| PayPal_Payment_Links_List_Table_Test | — | Table rendering |
| PayPal_Payment_Buttons_Test | — | Block registration, rendering |

### Latest PHPUnit Run (2026-03-24)

```
PHPUnit 12.5.14

Runtime:       PHP 8.5.4

...............................................................  63 / 221 ( 28%)
............................................................... 126 / 221 ( 57%)
............................................................... 189 / 221 ( 85%)
..............................WW                                221 / 221 (100%)

OK, but there were issues!
Tests: 221, Assertions: 459, Warnings: 1

1 warning: WordPress core null array offset in wp-includes/class-wp-block-supports.php
(WP core issue — not plugin code)
```

### Security Review (2026-03-23)

**Verdict: READY — no blockers**

| Area | Rating |
|------|--------|
| Credential encryption (sodium) | **Excellent** |
| URL validation (PayPal domain whitelist) | **Excellent** |
| Capability checks (manage_options) | Pass |
| Nonce verification | Pass |
| Input sanitization | Pass |
| Output escaping | Pass |
| SQL injection | Pass (no direct queries) |
| PCI compliance | Pass (no cardholder data) |
| XSS prevention | Pass |
| Idempotency (PayPal-Request-Id) | Pass |
| Rate limiting | Pass |

### Findings Resolved

| # | Severity | Finding | Status |
|---|----------|---------|--------|
| WOOPTP-260 | Medium | AUTH_KEY guard for empty/default values | **Fixed** |
| WOOPTP-262 | Medium | QR code generates page URL instead of payment link | **Fixed** |
| WOOPTP-261 | Medium | readme.txt says "AES-256-CBC" but code uses sodium | **Fixed** |
| WOOPTP-263 | Low | Minor review findings (exit(0), currency count) | **Fixed** |

---

## 4. Documentation Status

### Content Drafts Ready for PayPal

All external documentation drafts are complete and ready for review:

| # | Destination | Owner | Status |
|---|-------------|-------|--------|
| 1 | wordpress.com/support/.../pay-with-paypal/ | WordPress.com Docs | Draft ready |
| 2 | jetpack.com/support/pay-with-paypal | Jetpack Docs | Draft ready |
| 3 | github.com/Automattic/paypal-payment-buttons | Andrew (direct) | Draft ready |
| 4 | wordpress.org/plugins/paypal-payment-buttons/ | Plugin release | Driven by readme.txt |
| 5 | apps.wordpress.com/.../earn/ | WordPress.com Docs | Draft ready |
| 6 | jetpack.com/support/features-earn/ | Jetpack Docs | Draft ready |
| 7 | **paypal.com/.../help1294** | **PayPal (via Jarred)** | **Draft ready — needs Jarred confirmation** |

### PayPal BRC Article (WOOPTP-179)

A complete rewrite of the PayPal Business Resource Center article is drafted and ready for submission:
- **Target:** https://www.paypal.com/us/brc/article/implement-paypal-payment-buttons-wordpress
- **Key changes:** Replaces NCP code-paste instructions with OAuth wizard flow
- **Action needed:** Submit to PayPal BRC content contact as Word doc with tracked changes
- **Video:** New demo video requested (4–6 week lead time — flag now)
- **Stat verification:** "28% increase in sales" figure needs confirmation from PayPal

### PayPal Help Article (WOOPTP-158/179)

Draft update for PayPal's official help center article:
- **Target:** https://www.paypal.com/us/cshelp/article/how-do-i-set-up-and-use-paypal-payment-buttons-on-a-wordpress-website--help1294
- **Key changes:** Users now create a Developer Dashboard app, obtain Client ID/Secret, connect via wizard
- **Action needed:** Jarred to coordinate with PayPal docs team

---

## 5. Items Needing PayPal Action

| Item | Contact | Due | Notes |
|------|---------|-----|-------|
| BRC article submission (WOOPTP-179) | PayPal BRC content team | Mar 28 | Word doc with tracked changes |
| Help article update | Jarred → PayPal docs | Pre-launch | Draft provided |
| Brand review sign-off (WOOPTP-229) | Amanda Blythe / Alexandra Hughmanick | Mar 28 | SVGs, wordmarks, copy approval |
| BN code / partner attribution | Jarred | Confirmed | Approach confirmed |
| "28% sales increase" stat | PayPal merchant team | Pre-publish | Verify still current |
| New demo video production | PayPal content team | 4–6 weeks | Flag now for post-launch update |

---

## 6. WordPress Playground Demo

A one-click WordPress Playground demo is available for hands-on testing:
- Pre-configured with the plugin and sample payment buttons
- No installation required — runs in browser
- Showcases: wizard flow, product configuration, variants, QR codes, email sending

See `PLAYGROUND-INSTRUCTIONS.md` for setup details.

---

## 7. What's New Since Last Update

- **221 PHP tests passing** (up from 163 at last count — 58 new tests)
- **459 assertions** (up from 349 — 110 new)
- All 3 medium security findings resolved (AUTH_KEY, QR code, encryption docs)
- PayPal brand compliance audit complete — SVG colors standardized to official palette
- "Powered by PayPal" inline attribution logo added
- Compatibility testing across WP/PHP version matrix complete

---

## Appendix: File Index

All documents referenced in this bundle:

### Reviews
- `reviews/paypal-payment-buttons-v2/2026-03-23-v0.8.0-full-review.md` — Full marketplace review

### Documentation Drafts (for PayPal)
- `paypal-docs-v2/paypal-brc-article.md` — BRC article rewrite
- `implementation/WOOPTP-155/docs-drafts/07-paypal-help-article.md` — Help center article draft

### Test Plans & Results
- `implementation/CONSOLIDATED/docs/test_plan.md` — Comprehensive test plan (314 test points)
- `implementation/CONSOLIDATED/MANIFEST.md` — File manifest with test suite summary

### Technical Documentation
- `implementation/CONSOLIDATED/docs/rest-api-reference.md` — REST API reference
- `implementation/CONSOLIDATED/docs/troubleshooting-guide.md` — Troubleshooting guide
- `implementation/CONSOLIDATED/docs/readme.txt` — WordPress.org plugin readme

### External Docs Tracker
- `implementation/WOOPTP-155/external-docs-tracker.md` — All 7 external pages requiring updates

---

*Generated by TAMMIE — Payment TAMs AI Brain — 2026-03-24*
