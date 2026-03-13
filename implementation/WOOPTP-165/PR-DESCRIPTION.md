# WOOPTP-165: Pre-request token expiry check for improved refresh resilience

## Summary

Add an absolute `expires_at` wp_option alongside the transient when caching OAuth tokens. Before returning a cached token, double-check the absolute timestamp to catch cases where the transient survived an object-cache flush or clock drift.

## Changes

### `class-paypal-oauth.php`
- New constant `TOKEN_EXPIRES_AT_OPTION_KEY` for storing the absolute expiry timestamp
- `get_access_token()`: after retrieving cached transient, checks `expires_at` option — if expired, clears cache and requests a fresh token
- `request_access_token()`: stores `time() + $cache_duration` in the option alongside the transient
- `clear_cached_token()`: also deletes the expires_at option
- `disconnect()`: also deletes the expires_at option

## Why

The existing 5-minute early-refresh buffer (`TOKEN_EXPIRY_BUFFER = 300`) works for most cases, but has gaps:
- If the transient survives an object-cache flush, a stale token could be returned
- Clock drift between the app server and PayPal could cause premature or late expiry
- The absolute timestamp provides a reliable fallback independent of transient cache behavior

## Test Plan

- [ ] Token is cached with both transient and `expires_at` option
- [ ] Expired token (per `expires_at`) triggers a fresh request even if transient exists
- [ ] `clear_cached_token()` removes both transient and option
- [ ] `disconnect()` removes the option
- [ ] Normal token refresh flow still works via transient expiry

## Jetpack Fork Commit

`fbf2a8e0fd` — `feat(paypal-buttons): store absolute token expiry timestamp (WOOPTP-165)`
