# Pre-PR Checklist — PayPal Payment Buttons V2

**Generated:** 2026-03-14
**Target:** Jetpack 15.7 / WordCamp Asia (April 9–11, 2026)
**PR Deadline:** March 31, 2026

Mapped to the Pluginomattic completion gate criteria. All items must be ✅ before PR submission.

---

## Gate 1 — Documentation

### Internal / Plugin Docs

| Requirement | File | Status |
|---|---|---|
| Plugin readme (≥5KB, FAQ, installation, changelog) | `WOOPTP-155/readme.txt` | ✅ P1 + P2 council corrections applied |
| REST API developer reference | `WOOPTP-155/rest-api-reference.md` | ✅ P1 + P2 council corrections applied |
| Troubleshooting guide | `WOOPTP-155/troubleshooting-guide.md` | ✅ P1 + P2 council corrections applied |
| BN code attribution method confirmed | WOOPTP-187 | ⚠️ Pending Jarred confirmation |

### External-Facing Docs (all currently describe legacy paste-code workflow — full tracker: `WOOPTP-155/external-docs-tracker.md`)

| Page | Owner | Required Change | Status |
|---|---|---|---|
| wordpress.com/support/.../pay-with-paypal/ | WordPress.com Docs | Full rewrite to wizard/API flow | ⬜ Pending |
| jetpack.com/support/pay-with-paypal | Jetpack Docs | Full rewrite + verify paid plan reqs | ⬜ Pending |
| github.com/Automattic/paypal-payment-buttons | Andrew (direct) | Bump to v0.8.0, rewrite setup steps | ⬜ Pending |
| wordpress.org/plugins/paypal-payment-buttons/ | Plugin release | Confirm readme.txt deployed at release | ⬜ Pending release |
| apps.wordpress.com/support/.../earn/ | WordPress.com Docs | Light update — wizard reference | ⬜ Pending |
| jetpack.com/support/features-earn/ | Jetpack Docs | Light update — wizard reference | ⬜ Pending |
| paypal.com/...help1294 | PayPal (via Jarred) | Update to v0.8.0 wizard flow | ⬜ Pending — Andrew to confirm with Jarred |
| jetpack.com/resources/set-up-an-online-payment... | Jetpack Marketing/Docs | ⚠️ Flagged as outdated (old Simple Payments email flow) — needs broad Jetpack cleanup, not blocking this PR | ⚠️ Flagged |

---

## Gate 2 — Adversarial Council Sign-off

| Review | Status | Notes |
|---|---|---|
| P1: Doc council review | ✅ Complete | 5 personas reviewed; all findings resolved |
| P2: PHP code council review | ✅ Complete | 3 VETOs + 2 SHOULD FIX; all resolved |
| Security Auditor (veto power) | ✅ Approved | PHP 7.4 fix, credential storage docs corrected, BN code corrected |
| Technical Accuracy (veto power) | ✅ Approved | REST API docs match implementation |

---

## Gate 3 — Ticket Test Plans

### WOOPTP-163 — Default to Production environment
**Method:** Code-verified against `class-paypal-oauth.php` (WOOPTP-165) and `class-paypal-rest-controller.php` (WOOPTP-164)

| # | Test Point | Status |
|---|---|---|
| 1 | New install defaults to production (no prior `wp_options` entry) | ✅ Code-verified — `get_environment()` returns `'production'` when option is absent |
| 2 | Existing merchants with sandbox explicitly set are unaffected | ✅ Code-verified — `set_environment()` only writes when called; default only applies when option missing |
| 3 | Connect endpoint accepts both `sandbox` and `production` values | ✅ Code-verified — controller passes value through to `set_environment()` |
| 4 | Explicit sandbox selection still works (opt-in flow) | ✅ Code-verified — `set_environment( 'sandbox' )` persists correctly |

**Sign-off:** ✅ Code-verified (Andrew — confirm no regression in existing sandbox connections if applicable)

---

### WOOPTP-164 — Token pre-validation on connect
**Method:** Code-verified against `class-paypal-oauth.php` and `class-paypal-rest-controller.php`

| # | Test Point | Status |
|---|---|---|
| 1 | Valid credentials with Payment Links access → connected successfully | ✅ Code-verified — `validate_api_access()` returns `true`; connection proceeds |
| 2 | Valid credentials but Payment Links NOT enabled → 403 with specific guidance message | ✅ Code-verified — 403 path returns `paypal_api_not_authorized` with user-friendly message |
| 3 | Credentials deleted after 403 (no invalid half-connected state) | ✅ Code-verified — `delete_credentials()` called in both 403 and validation failure paths |
| 4 | Transient PayPal outage (5xx/timeout) during `validate_api_access()` → non-blocking, connect succeeds | ✅ Code-verified — 5xx/timeout treated as pass-through, not as authorization failure |
| 5 | Error message for 403 is user-friendly (not raw PayPal API message) | ✅ Code-verified — `handle_connect()` maps error codes to translated strings |
| 6 | Previous environment restored if connect fails at any stage | ✅ Code-verified — P2 fix applied; `$previous_environment` saved and restored in all failure paths |

**Sign-off:** ✅ Code-verified

---

### WOOPTP-165 — Pre-request token expiry check (dual storage)
**Method:** Code-verified against `class-paypal-oauth.php` (WOOPTP-165)

| # | Test Point | Status |
|---|---|---|
| 1 | Token request stores both transient AND `expires_at` wp_option | ✅ Code-verified — `request_access_token()` writes both |
| 2 | Transient cache flushed but `expires_at` option intact → token treated as expired, fresh request made | ✅ Code-verified — `get_access_token()` checks absolute timestamp as fallback |
| 3 | `clear_cached_token()` removes both transient and option | ✅ Code-verified — both cleared in `clear_cached_token()` |
| 4 | `disconnect()` removes both transient and option | ✅ Code-verified — `clear_cached_token()` called from `disconnect()` |
| 5 | Normal token refresh (5-minute early buffer) still works | ✅ Code-verified — early refresh buffer applied to both storage checks |

**Sign-off:** ✅ Code-verified

---

### WOOPTP-162 — Guided credential entry UX wizard
**Method:** Requires manual browser testing in block editor
**11 test points — needs Andrew's sign-off**

| # | Test Point | Status |
|---|---|---|
| 1 | Welcome step displays on first load (no credentials stored) | ✅ Verified |
| 2 | "Go to PayPal Developer Dashboard" link opens correctly | ✅ Verified |
| 3 | Dashboard step → Credentials step navigation works | ✅ Verified |
| 4 | Client ID auto-trims leading/trailing whitespace | ✅ Verified |
| 5 | Client Secret show/hide toggle works | ✅ Verified |
| 6 | Client ID format validation catches invalid input | ✅ Verified |
| 7 | Production is pre-selected as default environment | ✅ Verified |
| 8 | Sandbox toggle visible and functional (explicit opt-in) | ✅ Verified |
| 9 | Successful connect advances to Success step | ✅ Verified |
| 10 | Failed connect shows error inline without full page reload | ✅ Verified |
| 11 | Keyboard navigation / accessibility through wizard steps | ✅ Verified |

**Sign-off:** ✅ Andrew — 2026-03-14

---

### WOOPTP-166 — PayPal SVG block icon fix
**Method:** Requires visual check in block editor
**Needs Andrew's sign-off**

| # | Test Point | Status |
|---|---|---|
| 1 | PayPal SVG logo appears in block inserter (not generic icon) | ✅ Verified |
| 2 | PayPal SVG logo appears in block toolbar | ✅ Verified |
| 3 | Other Jetpack blocks using dashicons are unaffected | ✅ Verified |

**Sign-off:** ✅ Andrew — 2026-03-14

---

### WOOPTP-167 — Standalone script stubs for Playground
**Method:** Requires WordPress Playground or standalone plugin install
**Needs Andrew's sign-off**

| # | Test Point | Status |
|---|---|---|
| 1 | Plugin installed as standalone (outside Jetpack) → block appears in block inserter | ✅ Verified |
| 2 | Existing PayPal button block opens without error in standalone mode | ✅ Verified |
| 3 | Plugin works normally within full Jetpack plugin context (no regression) | ✅ Verified |
| 4 | `wp_script_is()` guard prevents double-registration when Jetpack provides the stub | ✅ Verified |

**Sign-off:** ✅ Andrew — 2026-03-14

---

## Gate 4 — Test Suite Results

| Suite | Count | Status |
|---|---|---|
| PHPUnit (WOOPTP-153) | 163 tests, 349 assertions | ✅ All passing — 2026-03-14 |
| Jest (WOOPTP-153) | 105 tests, 11 suites | ✅ All passing — 2026-03-14 |
| Playwright E2E (WOOPTP-154) | 18 specs | ⬜ Need to run (week of Mar 24) |

---

## Gate 5 — Security

| Item | Status |
|---|---|
| Security Auditor veto — no critical issues | ✅ P2 complete; all vetoes resolved |
| PHP 7.4 `str_contains()` incompatibility | ✅ Fixed |
| Credential storage documentation accuracy | ✅ Fixed |
| BN code implementation documentation | ✅ Fixed (pending WOOPTP-187 final confirmation) |
| `returnUrl` HTTPS enforcement matches error message | ✅ Fixed |
| Environment not persisted on failed connect | ✅ Fixed |
| RUB in `SUPPORTED_CURRENCIES` — sanctions check | ⚠️ Flag for Jarred before ship |

---

## Gate 6 — Consolidation

| Item | Status |
|---|---|
| Canonical file set established (18 tickets → final files) | ✅ 35 files across php/, js/, scss/, block/, tests/, docs/ |
| `implementation/CONSOLIDATED/` produced | ✅ 2026-03-14 — see CONSOLIDATED/MANIFEST.md |
| All P2 fixes reflected in canonical files | ✅ Applied — WOOPTP-167 stub method patched into class-paypal-payment-buttons.php |

---

## Summary

| Gate | Status |
|---|---|
| Documentation (internal) | ✅ (⚠️ BN code pending WOOPTP-187) |
| Documentation (external — 7 pages) | ⬜ Pending (see external-docs-tracker.md) |
| Adversarial council | ✅ |
| Test plans: WOOPTP-163, 164, 165 | ✅ Code-verified |
| Test plans: WOOPTP-162, 166, 167 | ✅ Andrew — 2026-03-14 |
| Test suite execution | ✅ PHPUnit + Jest passing (⬜ Playwright week of Mar 24) |
| Security | ✅ (⚠️ RUB + BN code pending Jarred) |
| Consolidation | ✅ 2026-03-14 |

**PR is blocked on:** Playwright E2E (week of Mar 24), Jarred confirmations (WOOPTP-187 BN code, RUB sanctions flag, PayPal help article update), and external docs updates (7 pages — see WOOPTP-155/external-docs-tracker.md).
