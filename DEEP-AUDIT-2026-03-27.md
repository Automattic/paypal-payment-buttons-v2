# PayPal Payment Buttons V2 — Deep Audit Report

**Date:** 2026-03-27
**Scope:** Security, Optimization, Full-Stack Traceability
**Codebase:** 8,365 lines across 9 PHP files + 14 JS files
**Auditor:** TAMMIE (7 parallel sub-agents)

---

## Executive Summary

The codebase is mature and well-engineered. No critical vulnerabilities were found. The main areas needing attention before ship:

| Area | Critical | High | Medium | Low |
|------|----------|------|--------|-----|
| Security | 0 | 2 | 6 | 6 |
| Optimization | 0 | 5 | 12 | 7 |
| Traceability | 0 | 1 | 1 | 3 |

**The single most important finding across all three areas:** The `sanitize_line_items()` method silently strips variants, taxes, customer notes, and adjustable quantity data — meaning the UI collects this data, JS sends it, but PHP drops it before it reaches PayPal. This is flagged as both a traceability DATA LOSS (High) and an optimization architecture issue.

---

## PART 1: SECURITY FINDINGS

### Strengths (Preserve These)

- **S1:** Sodium encryption (XSalsa20-Poly1305) for credentials at rest with BLAKE2b key derivation
- **S2:** Consistent `manage_options` capability checks on every REST endpoint + AJAX handler
- **S3:** SSRF protection via strict PayPal domain allowlist with HTTPS-only enforcement
- **S4:** Thorough output escaping (`esc_html`, `esc_attr`, `esc_url`, `wp_json_encode` with safe flags)
- **S5:** REST API schema validation with typed `args`, `sanitize_callback`, `validate_callback`
- **S6:** Server-side double-validation via `PayPal_Attribute_Mapper::validate_attributes()`
- **S7:** Idempotency via `PayPal-Request-Id` UUIDs preserved across retries
- **S8:** Encrypted OAuth token caching in transients
- **S9:** Resource ID format validation via regex (`/^PLB-[A-Z0-9]+$/i`)
- **S10:** Zero direct `$wpdb` queries — all DB access through WP Options/Transients API
- **S11:** Email recipient masking in send log (privacy)
- **S12:** Nonce-protected delete actions with resource-ID-specific nonce strings

### HIGH

#### SEC-H1: postMessage listener lacks origin validation
- **File:** `js/edit.js:432-456`
- **Risk:** The `window.addEventListener('message', handleMessage)` accepts `authCode`, `sharedId`, and `merchantIdInPayPal` from **any origin**. No `event.origin` check.
- **Attack:** A malicious page open alongside the editor sends a crafted postMessage with attacker-controlled credentials, potentially redirecting payment revenue.
- **Fix:** Add origin validation:
  ```javascript
  const ALLOWED_ORIGINS = ['https://www.paypal.com', 'https://www.sandbox.paypal.com'];
  if (!ALLOWED_ORIGINS.includes(event.origin)) return;
  ```

#### SEC-H2: Email rate limiter has TOCTOU race + sliding window bug
- **File:** `php/class-paypal-email-sender.php:114-119`
- **Risk:** `set_transient($rate_key, $rate_count + 1, $rate_window)` resets the 60-second TTL on every increment (sliding window). Concurrent AJAX requests can also bypass the counter due to read-then-write race.
- **Attack:** Admin (or compromised admin) uses the endpoint as a spam relay. No daily cap exists.
- **Fix:** (1) Only set TTL on first send. (2) Add daily cap (e.g., 50/day). (3) Consider atomic increment.

### MEDIUM

#### SEC-M1: OAuth token refresh race condition
- **File:** `php/class-paypal-oauth.php:319-436`
- **Risk:** Concurrent requests finding an expired token all call `request_access_token()` simultaneously. No locking.
- **Impact:** Wastes PayPal API calls; could trigger rate limits on busy sites.
- **Fix:** Use a transient-based mutex around token refresh.

#### SEC-M2: Encryption key derived with empty salt, no key versioning
- **File:** `php/class-paypal-oauth.php:143-151`
- **Risk:** `sodium_crypto_generichash(AUTH_KEY, '')` uses empty salt. Key is deterministic per AUTH_KEY. No rotation mechanism that preserves credentials.
- **Fix:** Use site-specific salt. Consider key versioning.

#### SEC-M3: imageUrl not validated as media library URL
- **File:** `php/class-paypal-payment-buttons.php:232-236`
- **Risk:** A user with `edit_posts` (but not `manage_options`) could set `imageUrl` to an external tracking pixel.
- **Fix:** Validate against `wp_get_upload_dir()` baseurl or restrict to `imageId`-based rendering.

#### SEC-M4: Credential exposure risk in WP_Error during debugging
- **File:** `php/class-paypal-oauth.php:376-409`
- **Risk:** HTTP response error messages included in WP_Error. If `WP_DEBUG_DISPLAY` is on, internal PayPal diagnostics could surface.
- **Fix:** Guard detailed messages behind `WP_DEBUG` check.

#### SEC-M5: Missing CSRF protection on admin detail view
- **File:** `php/class-paypal-admin-page.php:337-342`
- **Risk:** Read-only `action=view` triggers a PayPal API call without nonce. Could be triggered via embedded `<img>` tag.
- **Impact:** Low direct impact (no data exfiltration), but causes unnecessary API calls.
- **Fix:** Add nonce check for view action.

#### SEC-M6: Seller nonce stored without TTL
- **File:** `php/class-paypal-partner-onboarding.php:174-180`
- **Risk:** Seller nonce stored in `wp_options` permanently if onboarding flow is abandoned.
- **Fix:** Use a transient with 30-minute TTL instead.

### LOW

| ID | File | Issue |
|----|------|-------|
| SEC-L1 | `php/class-paypal-payment-buttons.php:446-453` | Legacy form `target="_blank"` gives PayPal tab `window.opener` reference |
| SEC-L2 | `js/qr-code.js:53-55` | QR fallback uses `window.location.href` which may include query params |
| SEC-L3 | `js/edit.js:298-315` | Client-side credential format check is advisory only; no server-side minimum length |
| SEC-L4 | `php/class-paypal-payment-buttons.php:400-418` | No SRI on PayPal SDK script (accepted risk — dynamic URL) |
| SEC-L5 | `php/class-paypal-payment-buttons.php:402-418` | Regex-based HTML manipulation of script tag is fragile |
| SEC-L6 | `php/class-paypal-payment-links-list-table.php:107` | `md5` for cache key (cosmetic; not used for security) |

---

## PART 2: OPTIMIZATION FINDINGS

### Dead Code

| ID | Priority | File | Issue |
|----|----------|------|-------|
| OPT-D1 | **MED** | `js/shipping-panel.js` (entire file) | `ShippingPanel` exported but **never imported** by any file. Dead code shipping to production. |
| OPT-D2 | **MED** | `php/class-paypal-attribute-mapper.php:97` | `attributes_to_api_request()` never called in production — only in tests |
| OPT-D3 | **MED** | `php/class-paypal-attribute-mapper.php:203` | `api_response_to_attributes()` never called in production — only in tests |
| OPT-D4 | **MED** | `php/class-paypal-payment-buttons.php:467,485` | `load_editor_styles()` and `load_editor_scripts()` — no `add_action` in this codebase. May be wired externally in Jetpack monorepo. Needs verification. |
| OPT-D5 | LOW | `php/class-paypal-admin-page.php:699` | `render_detail_row_html()` never called |
| OPT-D6 | LOW | `php/class-paypal-attribute-mapper.php:417` | `merge_response_attributes()` — tests only |
| OPT-D7 | LOW | `php/class-paypal-attribute-mapper.php:402` | `is_api_managed()` — tests only; render uses direct attribute check |
| OPT-D8 | LOW | `php/class-paypal-attribute-mapper.php:392` | `is_valid_resource_id()` — tests only; validation triple-covered elsewhere |

### Code Duplication

| ID | Priority | Issue | Files |
|----|----------|-------|-------|
| OPT-C1 | **HIGH** | HATEOAS payment link extraction copy-pasted **4 times** | `api-client.php:602`, `attribute-mapper.php:277`, `admin-page.php:422`, `list-table.php:340` |
| OPT-C2 | **HIGH** | Currency lists maintained in **5 separate locations** that must stay in sync | `attribute-mapper.php:39`, `payment-buttons.php:133`, `edit.js:54`, `validation.js:23`, `currency-symbols.js:11` |
| OPT-C3 | **MED** | PayPal domain allowlist duplicated | `api-client.php:69` and `payment-buttons.php:54` |
| OPT-C4 | **MED** | `VALID_CURRENCY_CODES` defined twice in JS | `edit.js:85` (derived) and `validation.js:23` (hardcoded) |
| OPT-C5 | **MED** | REST controller reverse-maps API data just to validate, then re-maps for the call | `rest-controller.php:723-767` |
| OPT-C6 | LOW | PayPal logo SVG duplicated in PHP + JS (architectural necessity) | `payment-buttons.php:182` and `paypal-logo.js:22` |

### Functions Too Long

| ID | Priority | File:Lines | Issue |
|----|----------|------------|-------|
| OPT-L1 | **HIGH** | `admin-page.php:385-674` | `render_detail_view()` is ~290 lines. Mixes data fetching, HTML, and business logic. |
| OPT-L2 | **HIGH** | `js/edit.js` (entire file) | 1,641-line god component with ~25 state vars, ~15 callbacks, multiple render paths. |
| OPT-L3 | **MED** | `payment-buttons.php:198-363` | `render_api_managed_button()` is ~165 lines |
| OPT-L4 | **MED** | `admin-page.php:147-290` | `enqueue_assets()` has ~135 lines of inline CSS/JS |
| OPT-L5 | **MED** | `partner-onboarding.php:303-445` | `complete_onboarding()` is ~130 lines with 4 sequential API calls |

### Architecture

| ID | Priority | Issue |
|----|----------|-------|
| OPT-A1 | **HIGH** | `PayPal_Attribute_Mapper` is 527 lines but only `validate_attributes()` is used in production. The REST controller bypasses the mapper entirely with its own `build_resource_data()`. |
| OPT-A2 | **MED** | `PayPal_Payment_Buttons` is a God class — block registration, rendering (V1+V2), URL sanitization, price formatting, currency symbols, script loading, sharing integration, admin init |
| OPT-A3 | **MED** | No deactivation cleanup for `jetpack_paypal_email_send_log` option or short-lived cache transients |

### Performance

| ID | Priority | Issue |
|----|----------|-------|
| OPT-P1 | **MED** | `register_hooks()` adds `safe_style_css` filter on every block render without idempotency guard. 5 blocks = 5 redundant filter callbacks. |
| OPT-P2 | **MED** | Anonymous `script_loader_tag` closure stacks up per legacy block render without dedup |
| OPT-P3 | LOW | `get_option()` calls in hot paths — mitigated by WP object cache |

---

## PART 3: TRACEABILITY FINDINGS

### Layer 1 — UI to JS (70 UI elements traced)

**Verdict: CLEAN.** All 70 interactive elements (buttons, toggles, text fields, selects, media uploads) have correctly-wired handlers. No orphan handlers, no missing functions, no type mismatches.

Key findings:
- `ShippingPanel` is dead code (also flagged in optimization)
- `VALID_CURRENCY_CODES` exported from `validation.js` is never imported by any consumer
- All `apiFetch` calls use correct endpoint paths and data shapes

### Layer 2 — JS to PHP REST API (10 API calls traced)

**Verdict: 1 HIGH issue, otherwise clean.**

| ID | Priority | Issue |
|----|----------|-------|
| **TRACE-1** | **HIGH** | **DATA LOSS:** `sanitize_line_items()` at `rest-controller.php:901-928` constructs a clean array with ONLY `name`, `unit_amount`, `description`, `quantity`. The `variants`, `adjustable_quantity`, `customer_notes`, and `taxes` fields that JS sends are **silently dropped** before reaching PayPal. The UI collects this data, JS sends it, PHP strips it. |
| TRACE-2 | **MED** | **Schema gap:** PHP `get_button_create_args()` does not declare `variants`, `adjustable_quantity`, `customer_notes`, `taxes` in the `line_items.items.properties` schema — no server-side validation for these fields. |
| TRACE-3 | LOW | 3 orphan REST endpoints: `GET /buttons` (list), `GET /buttons/{id}`, `POST /environment` — registered but no JS caller. First two used by PHP admin page directly. Environment endpoint appears fully unused. |

All 10 JS API calls have matching PHP handlers. All parameter names and types match (except the stripped fields above). All permission callbacks are present and correct.

### Layer 3 — REST Handlers to Internal PHP (12 handlers traced)

**Verdict: CLEAN.** Every handler correctly calls downstream classes with matching argument counts, types, and order. All `WP_Error` returns are checked. Admin form field names match AJAX handler expectations exactly. No broken call chains.

Minor notes:
- `set_environment()` return unchecked in 2 handlers (benign — REST enum pre-validates)
- `buttonText` validation path in `validate_attributes()` is never reached from REST controller (dead path)

### Layer 4 — PHP to PayPal API + Database (7 API calls, 22 options, 9 transients traced)

**Verdict: CLEAN.** All outbound API calls use hardcoded base URLs (no user input in URLs). Proper error handling with retry logic. All database operations use WP APIs (zero direct `$wpdb`).

Minor flags:
- `jetpack_paypal_email_send_log` not cleaned on deactivation (also in optimization)
- `error_description` from PayPal token exchange not sanitized in onboarding flow (low — goes through WP_Error)

### Layer 5 — WordPress Hook Wiring (10 hooks traced)

**Verdict: CLEAN.** All 10 registered callbacks exist, have correct visibility, and accept the right number of parameters. No typos, no missing methods, no argument mismatches.

Minor notes:
- `register_hooks()` lacks idempotency guard (also in optimization/performance)
- Anonymous closure on `script_loader_tag` cannot be removed by other code
- `load_editor_styles()` and `load_editor_scripts()` hook registrations not in these files — must verify in Jetpack monorepo
- No custom `do_action`/`apply_filters` fired — no extension points for third-party code

---

## PART 4: CONSOLIDATED ACTION ITEMS

Priority-ordered task list for implementation. Items are tagged by area and sequenced for safe implementation order.

### P0 — Fix Before Ship (2 items) — ✅ ALL RESOLVED

| # | ID | Area | Task | File(s) | Status |
|---|-----|------|------|---------|--------|
| 1 | SEC-H1 | Security | Add `event.origin` validation to postMessage listener | `js/edit.js:447` | ✅ Fixed in `eb9953a` (2026-03-27) |
| 2 | TRACE-1 | Traceability | Fix `sanitize_line_items()` to pass through `variants`, `adjustable_quantity`, `customer_notes`, `taxes` (with sanitization) | `php/class-paypal-rest-controller.php:966-1045` | ✅ Fixed in `eb9953a` (2026-03-27) |

### P1 — Should Fix Before Ship (5 items) — ✅ ALL RESOLVED

| # | ID | Area | Task | File(s) | Status |
|---|-----|------|------|---------|--------|
| 3 | SEC-H2 | Security | Fix rate limiter: use fixed-window instead of sliding window; add daily cap | `php/class-paypal-email-sender.php` | ✅ Fixed in `eb9953a` (2026-03-27) |
| 4 | SEC-M1 | Security | Add transient-based mutex for OAuth token refresh | `php/class-paypal-oauth.php:354-381` | ✅ Fixed in `eb9953a` (2026-03-27) |
| 5 | SEC-M6 | Security | Use transient with 30-min TTL for seller nonce instead of permanent option | `php/class-paypal-partner-onboarding.php:182` | ✅ Fixed in `eb9953a` (2026-03-27) |
| 6 | TRACE-2 | Traceability | Add `variants`, `adjustable_quantity`, `customer_notes`, `taxes` to REST schema `get_button_create_args()` | `php/class-paypal-rest-controller.php:851-916` | ✅ Fixed in `eb9953a` (2026-03-27) |
| 7 | OPT-P1 | Performance | Add static `$registered` guard to `register_hooks()` | `php/class-paypal-payment-buttons.php:519` | ✅ Fixed in `eb9953a` (2026-03-27) |

### P2 — Should Fix Post-Ship (10 items)

| # | ID | Area | Task | File(s) | Est. Complexity |
|---|-----|------|------|---------|-----------------|
| 8 | SEC-M2 | Security | Add site-specific salt to encryption key derivation | `php/class-paypal-oauth.php:143-151` | Small |
| 9 | SEC-M3 | Security | Validate `imageUrl` against media library | `php/class-paypal-payment-buttons.php:232` | Small |
| 10 | OPT-C1 | Duplication | Consolidate HATEOAS link extraction to single `extract_payment_link()` in API client | 4 files | Medium |
| 11 | OPT-C2 | Duplication | Consolidate currency lists to single authoritative source (PHP + JS) | 5 files | Medium |
| 12 | OPT-D1 | Dead Code | Remove `shipping-panel.js` or integrate into `edit.js` | `js/shipping-panel.js` | Small |
| 13 | OPT-A1 | Architecture | Either commit to attribute mapper (refactor REST controller to use it) or strip to just `validate_attributes()` | `php/class-paypal-attribute-mapper.php`, `php/class-paypal-rest-controller.php` | Large |
| 14 | OPT-L2 | Architecture | Decompose `edit.js` god component into `ConnectionWizard`, `ButtonEditForm`, `ButtonPreviewMode` | `js/edit.js` | Large |
| 15 | OPT-L1 | Architecture | Decompose `render_detail_view()` into focused helpers | `php/class-paypal-admin-page.php` | Medium |
| 16 | OPT-A3 | Cleanup | Add deactivation hook to clean up email send log + cache transients | Multiple | Small |
| 17 | OPT-C3 | Duplication | Consolidate PayPal domain allowlist to single constant | `php/class-paypal-api-client.php`, `php/class-paypal-payment-buttons.php` | Small |

### P3 — Nice to Have (remaining items)

| # | ID | Area | Task |
|---|-----|------|------|
| 18 | SEC-M4 | Security | Guard detailed error messages behind `WP_DEBUG` |
| 19 | SEC-M5 | Security | Add nonce check for admin detail view read action |
| 20 | OPT-D2-D8 | Dead Code | Remove unused attribute mapper methods (or commit to using them) |
| 21 | OPT-C4 | Duplication | Import `VALID_CURRENCY_CODES` from `validation.js` in `edit.js` |
| 22 | OPT-L4 | Architecture | Move inline admin CSS/JS to external files |
| 23 | OPT-L5 | Architecture | Decompose `complete_onboarding()` into helpers |
| 24 | TRACE-3 | Dead Code | Remove or document orphan `POST /environment` REST endpoint |
| 25 | SEC-L1-L6 | Security | Address low-severity security items |
| 26 | OPT-P2 | Performance | Replace anonymous `script_loader_tag` closure with named static method + dedup guard |

---

## Appendix A: Complete Data Flow Maps

### Flow: Manual Credential Connect
```
JS: apiFetch POST /paypal/connect {client_id, client_secret, environment}
  -> REST schema: sanitize_oauth_value (trim + wp_unslash)
  -> handle_connect()
    -> PayPal_OAuth::set_environment() -> update_option
    -> PayPal_OAuth::store_credentials() -> encrypt -> update_option
    -> PayPal_OAuth::validate_credentials() -> request_access_token()
      -> decrypt credentials -> wp_remote_post /v1/oauth2/token (Basic auth)
      -> encrypt token -> set_transient
    -> PayPal_OAuth::validate_api_access()
      -> wp_remote_get /v1/checkout/payment-resources?page_size=1
  <- {connected, environment, message}
```

### Flow: Partner Referrals Onboarding
```
JS: apiFetch POST /paypal/onboarding/signup-link {return_url, environment}
  -> generate_signup_link()
    -> random_bytes(32) -> base64url -> encrypt -> update_option(seller_nonce)
    -> wp_remote_post /v2/customer/partner-referrals
  <- {action_url} -> JS opens PayPal popup

[User completes PayPal flow]

JS: window.postMessage {authCode, sharedId, merchantIdInPayPal}
  -> apiFetch POST /paypal/onboarding/complete
    -> complete_onboarding()
      -> decrypt(seller_nonce)
      -> wp_remote_post /v1/oauth2/token (auth_code + code_verifier)
      -> wp_remote_get /v1/customer/partners/{id}/merchant-integrations/credentials/
      -> store_credentials() -> encrypt -> update_option
      -> validate_credentials() + validate_api_access()
  <- {connected, environment, merchant_id}
```

### Flow: Create Payment Button
```
JS: buildRequestData() -> apiFetch POST /paypal/buttons
  -> validate_button_request() -> validate_attributes() [name, price, currency, desc, url]
  -> build_resource_data() -> sanitize_line_items() [name, unit_amount, desc, qty ONLY]
    !! variants, taxes, customer_notes, adjustable_quantity STRIPPED HERE
  -> PayPal_API_Client::create_resource()
    -> make_request_with_retry(POST, /v1/checkout/payment-resources, data, 201)
    -> extract_payment_link() -> validate_paypal_url()
  <- {id, payment_link, ...} -> JS stores as block attributes
```

### Flow: Send Payment Link Email
```
Admin form: POST admin-ajax.php (action=paypal_send_payment_link)
  -> check_ajax_referer + current_user_can('manage_options')
  -> sanitize_email, esc_url_raw, sanitize_text_field
  -> sanitize_paypal_script_url (domain whitelist)
  -> rate limit: get_transient -> compare to 10/60s
  -> send_email() -> build HTML -> wp_mail()
  -> log_send() -> append masked entry -> cap at 50 -> update_option
```

## Appendix B: Database Inventory

### Options (8 keys)
| Key | Encrypted | Cleaned on Disconnect |
|-----|-----------|----------------------|
| `jetpack_paypal_payment_buttons_environment` | No | Yes |
| `jetpack_paypal_payment_buttons_credentials` | **Yes** (Sodium) | Yes |
| `jetpack_paypal_payment_buttons_token_expires_at` | No | Yes |
| `jetpack_paypal_payment_buttons_partner_id` | No | No (by design) |
| `jetpack_paypal_payment_buttons_merchant_id` | No | Yes |
| `jetpack_paypal_payment_buttons_onboarding_method` | No | Yes |
| `jetpack_paypal_payment_buttons_seller_nonce` | **Yes** (Sodium) | Yes |
| `jetpack_paypal_email_send_log` | No (emails masked) | **No** (flag) |

### Transients (4 key patterns)
| Key Pattern | TTL | Encrypted | Content |
|-------------|-----|-----------|---------|
| `jetpack_paypal_payment_buttons_token` | Token lifetime - 5min | **Yes** | OAuth access token |
| `paypal_email_rate_{user_id}` | 60s | No | Send count (int) |
| `paypal_resource_{resource_id}` | 300s | No | Cached API response |
| `paypal_list_cache_{hash}` | 60s | No | Cached list response |
