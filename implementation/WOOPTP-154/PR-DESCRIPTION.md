# WOOPTP-154: E2E Tests with Playwright

## Summary

End-to-end test suite covering all 6 user flows using Playwright with mocked PayPal API responses. Tests run against a local WordPress environment and are fully deterministic — no real PayPal API calls are made.

## Files

### New Files

1. **`paypal-payment-buttons.spec.js`** — 18 E2E tests across 6 scenarios
2. **`paypal-api-mock.js`** — Reusable API mock layer with route interceptors
3. **`playwright.config.js`** — Playwright configuration for local/CI environments

## Test Scenarios (18 tests)

### 1. OAuth Connection Flow (4 tests)
- Shows connection form when PayPal is not connected
- Connects successfully with valid credentials → transitions to create form
- Shows error notice with invalid credentials
- Shows connected status with sandbox badge

### 2. Create Button Flow (5 tests)
- Shows creation form with product name, price, currency fields
- Create button is disabled when form is empty
- Creates button and switches to preview after successful API call
- Shows edit/preview toggle toolbar after creation
- Edit toggle switches to form; Cancel returns to preview

### 3. Frontend Rendering (2 tests)
- Published post shows PayPal button with payment link to paypal.com
- Stacked layout shows debit/credit secondary button

### 4. Error Flow (4 tests)
- Create button disabled with empty product name
- Create button disabled with zero price
- Field validation error shown after blurring empty required field
- API error displayed as notice on failed creation

### 5. Legacy Block Compatibility (2 tests)
- Legacy paste-code block shows read-only indicator in editor
- Legacy block renders on frontend with hostedButtonId intact

### 6. Disconnect Flow (1 test)
- Delete button clears block state and returns to edit mode

## API Mocking

The `paypal-api-mock.js` module provides:
- `setupPayPalMocks(page, overrides?)` — Intercepts all `/jetpack/v4/paypal/*` routes
- `setupDisconnectedMocks(page)` — Preconfigured disconnected state
- `MOCK_RESPONSES` — Named response objects for override composition
- Credential validation simulation (bad_id/bad_secret → 401)
- Request reflection (submitted line_items echoed in response)

## Running

```bash
# Local (requires running WordPress at localhost:8889)
npx playwright test --config=playwright.config.js

# With custom base URL
WP_BASE_URL=http://localhost:8080 npx playwright test

# CI (uses retries, GitHub reporter)
CI=true npx playwright test --config=playwright.config.js
```

## Checklist

- [x] OAuth connection flow tested (connect, error, status)
- [x] Button creation flow tested (form, create, preview, edit toggle)
- [x] Frontend rendering verified (payment link, stacked layout)
- [x] Error handling tested (validation, API errors)
- [x] Legacy block compatibility verified (editor + frontend)
- [x] Disconnect flow tested
- [x] All tests use mocked API responses (no real PayPal calls)
- [x] Configuration supports both local dev and CI

Refs: WOOPTP-154
