# WOOPTP-164: Token pre-validation on connect to verify Payment Links access

## Summary

Add `validate_api_access()` which probes `GET /v1/checkout/payment-resources?page_size=1` after a successful token exchange during the connect flow. If the merchant's app returns 403, the connect flow fails with a specific message guiding them to enable the Payment Links & Buttons feature. Transient errors (5xx, timeouts) are treated as non-blocking so temporary PayPal outages don't prevent connection.

## Changes

### `class-paypal-oauth.php`
- New `validate_api_access()` method:
  - Probes the Payment Resources endpoint with a minimal page_size=1 request
  - Returns `true` if the API is accessible (200, 204, or non-403 client errors)
  - Returns `WP_Error` with specific guidance on 403 (app lacks Payment Links scope)
  - Treats network failures and 5xx errors as non-blocking (returns `true`)

### `class-paypal-rest-controller.php`
- `handle_connect()` now calls `validate_api_access()` after successful credential validation
- If validation fails (403), credentials are deleted via `delete_credentials()` to prevent invalid setup
- Returns the specific error message to the block editor for display

## Why

Previously, merchants didn't discover they lacked Payment Links & Buttons API access until they tried to create their first button — minutes after connecting. This creates a frustrating experience where the connection appears successful but button creation fails with a cryptic error.

## Test Plan

- [ ] Connect with valid credentials + Payment Links access succeeds normally
- [ ] Connect with valid credentials but NO Payment Links access returns 403 with guidance
- [ ] After 403, credentials are removed (no partial connection state)
- [ ] Transient PayPal outage (5xx) does NOT block the connect flow
- [ ] Network timeout does NOT block the connect flow
- [ ] Error message clearly instructs merchant to enable Payment Links & Buttons in dashboard

## Jetpack Fork Commit

`d8b90bfe67` — `feat(paypal-buttons): pre-validate Payment Links API access on connect (WOOPTP-164)`
