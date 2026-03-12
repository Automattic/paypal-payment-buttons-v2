# WOOPTP-151: Error Handling, Validation, and Edge Cases

## Summary

Implements comprehensive error handling, input validation, and retry logic across the PHP API client, REST controller, and block editor JavaScript. Ensures no raw API errors are ever shown to merchants, all inputs are validated client-side and server-side, and transient failures are handled gracefully.

## Changes

### Modified Files

1. **`class-paypal-api-client.php`** — Retry logic and URL validation
   - **Token auto-refresh on 401/403**: Clears cached token and retries once; if retry also 403, returns clear "not authorized" message with dashboard guidance
   - **Exponential backoff for 500/502/503**: Up to 3 retries with `1s → 2s → 4s` delay
   - **Network timeout detection**: Distinguishes timeouts from other network errors for targeted retry
   - **PayPal URL domain whitelist**: Validates `payment_link` URLs against `paypal.com` and `sandbox.paypal.com` (HTTPS required)
   - **User-friendly error messages**: All 5 confirmed error codes (400, 403, 404, 422, 500) mapped to actionable merchant messages
   - **Field-level error extraction**: Parses PayPal `details[]` array for specific validation errors

2. **`class-paypal-rest-controller.php`** — Server-side validation
   - **`validate_button_request()`**: Runs `PayPal_Attribute_Mapper::validate_attributes()` on create/update before calling PayPal API
   - **404 on delete = success**: If a delete target is already gone from PayPal, treats as successful deletion (no orphaned state)
   - **Network error status normalization**: Converts `status: 0` network errors to `503` for proper REST responses
   - **Improved connect error messages**: Differentiates 401 (bad credentials) from other connection failures

3. **`edit.js`** — Client-side validation and error UX
   - **Inline field validation**: Product name (required, max 127 chars), price (required, positive, max 2 decimals), description (max 256 chars)
   - **Touch tracking**: Validation errors only shown after user interacts with each field (not on initial render)
   - **Submit-time validation**: All fields marked touched on submit to surface any remaining errors
   - **User-friendly error mapping**: `getUserFriendlyError()` handles network errors, server errors, and edge cases
   - **404 stale resource handling**: On update 404, clears stale `resourceId`/`paymentLink` and prompts re-creation
   - **Delete 404 handling**: If button already removed from PayPal, clears local state with success message

4. **`editor.scss`** — Validation error styles
   - `.has-error` class with red border on input/textarea controls
   - `.jetpack-paypal-payment-buttons__field-error` for inline error messages below fields

## Error Handling Matrix

| Error | HTTP | PHP Handling | JS Handling |
|-------|------|-------------|-------------|
| Invalid input | 400 | Field-level errors from PayPal details | Inline validation prevents call |
| Bad credentials | 401 | Clear token cache, retry once | Show friendly message |
| Not authorized | 403 | Token refresh + retry; if still 403, dashboard guidance | Show dashboard link message |
| Resource deleted | 404 | Return clear message | Clear stale attrs, prompt re-create |
| Business rule | 422 | Extract field errors from details | Show server message |
| Server error | 500 | Retry 3x with backoff (1s, 2s, 4s) | Show "try again later" |
| Network timeout | — | Retry 3x with backoff | "Check connection" message |
| Untrusted URL | — | Domain whitelist check | N/A (server-side only) |

## Acceptance Criteria

- [x] All 5 PayPal error codes handled with user-friendly messages
- [x] Client-side validation prevents invalid API calls
- [x] Server-side validation catches anything client misses
- [x] Token auto-refresh on 403 with retry
- [x] Network timeout handling with retry logic
- [x] No raw API errors ever shown to merchants

Refs: WOOPTP-151
