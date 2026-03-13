# WOOPTP-163: Dual environment credential storage — default to production

## Summary

Change the default PayPal environment from sandbox to production across the OAuth handler and REST controller. Existing merchants are unaffected since they have the environment option stored explicitly.

## Changes

### `class-paypal-oauth.php`
- `get_environment()` now defaults to `'production'` instead of `'sandbox'`
- Docblock updated to reflect the new default

### `class-paypal-rest-controller.php`
- `/paypal/connect` endpoint `environment` parameter default changed from `'sandbox'` to `'production'`

## Why

Production should be the default because:
- Most merchants connecting are setting up for real payments
- Sandbox is a developer-only workflow
- Reduces accidental sandbox-mode deployments

## Test Plan

- [ ] New installs default to production API base URL (`api.paypal.com`)
- [ ] Existing merchants with explicit environment setting are unaffected
- [ ] Connect endpoint accepts both `sandbox` and `production` values
- [ ] Sandbox can still be selected explicitly via the environment toggle

## Jetpack Fork Commit

`270d0338c9` — `feat(paypal-buttons): default environment to production (WOOPTP-163)`
