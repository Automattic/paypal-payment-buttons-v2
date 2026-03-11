# PR: feat(paypal): implement PayPal OAuth 2.0 connection flow

**Branch name:** `feature/paypal-oauth-connection`
**Base:** `trunk`
**Repo:** `Automattic/jetpack` (public GitHub)
**Linear:** WOOPTP-146

---

## Summary

Implements PayPal OAuth 2.0 client credentials authentication for the PayPal Payment Buttons V2 upgrade. This is the foundational auth layer that all subsequent API calls (button CRUD, etc.) depend on. The implementation adds credential storage, token exchange with caching, sandbox/production environment switching, and WordPress REST API endpoints for the block editor to connect/disconnect.

## Changes

- `projects/packages/paypal-payments/src/paypal-payment-buttons/class-paypal-oauth.php` — **NEW**: Core OAuth 2.0 handler. Client credentials grant via `POST /v1/oauth2/token`, credential storage in `wp_options` with `wp_hash()` integrity verification, token caching via transients with 5-minute early refresh buffer, sandbox/production URL switching.

- `projects/packages/paypal-payments/src/paypal-payment-buttons/class-paypal-rest-controller.php` — **NEW**: WordPress REST API controller with 4 endpoints:
  - `POST /jetpack/v4/paypal/connect` — store creds + validate via live token exchange
  - `GET /jetpack/v4/paypal/connection` — check connection status
  - `POST /jetpack/v4/paypal/disconnect` — remove all PayPal data
  - `POST /jetpack/v4/paypal/environment` — switch sandbox/production
  All endpoints require `manage_options` capability.

- `projects/packages/paypal-payments/src/paypal-payment-buttons/class-paypal-payment-buttons.php` — **MODIFIED**: Added `init_api()` method to wire REST route registration via `rest_api_init` hook.

- `projects/plugins/paypal-payment-buttons/src/class-paypal-payment-buttons.php` — **MODIFIED**: Calls `init_api()` during plugin initialization to activate REST endpoints.

- `projects/packages/paypal-payments/tests/php/PayPal_OAuth_Test.php` — **NEW**: 20 unit tests covering environment management, credential CRUD, integrity verification, token cache lifecycle, error handling, input sanitization, and disconnect cleanup.

## Testing

- 20 PHPUnit tests cover all OAuth class public methods
- Token caching verified: returns cached token, clears on credential/environment change
- Credential integrity: detects and auto-cleans corrupted data
- Input sanitization: HTML tags stripped, empty values rejected
- Error paths: WP_Error returned with descriptive codes for missing credentials and failed exchanges
- Manual sandbox testing needed with real PayPal client credentials (next step)

## Security Considerations

- Credentials stored in `wp_options` (not exposed via REST API responses)
- `wp_hash()` integrity check detects credential tampering
- All REST endpoints require `manage_options` capability
- Input sanitized via `sanitize_text_field()` at both REST arg level and class level
- `wp_remote_post()` used for HTTP (never `file_get_contents()`)
- Token cached with 5-minute early expiry buffer to prevent edge-case auth failures
- PHPCS ignore annotation documented for required `base64_encode` in OAuth Basic auth

## Checklist

- [x] Tests added for new behaviour (20 unit tests)
- [x] No regressions in existing tests (existing URL sanitization tests unchanged)
- [x] Follows WordPress coding standards (tabs, docblocks, sanitization)
- [x] Follows Jetpack monorepo patterns (namespace, classmap autoload, static methods)
- [x] PR description explains the "why", not just the "what"

Refs: WOOPTP-146
