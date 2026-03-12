# WOOPTP-153: Unit Tests — PHP (PHPUnit) and JS (Jest)

## Summary

Comprehensive unit test suite for all new PHP and JS code. Adds 63 new PHP tests and 41 JS tests covering validation, error handling, retry logic, component rendering, and backward compatibility.

## Test Files

### PHP (PHPUnit) — 63 new tests

| File | Tests | Covers |
|------|-------|--------|
| `PayPal_Attribute_Mapper_Test.php` | 30 | Validation (name/price/currency/description/URL), bidirectional mapping, merge, resource ID format |
| `PayPal_REST_Controller_Test.php` | 17 | Permission checks, input validation via `validate_button_request()`, error response normalization, 404-on-delete handling |
| `PayPal_API_Client_Retry_Test.php` | 16 | URL domain whitelist, retry on 500 with backoff, 403 auth retry, timeout detection, non-retryable error passthrough |

### Previously Written PHP Tests

| File | Tests | Covers |
|------|-------|--------|
| `PayPal_OAuth_Test.php` (WOOPTP-146) | 22 | Credential encryption, environment, token caching, integrity checks |
| `PayPal_API_Client_Test.php` (WOOPTP-147) | 28 | CRUD operations, resource ID validation, error code mapping, request format |

### JS (Jest) — 41 new tests

| File | Tests | Covers |
|------|-------|--------|
| `validation.test.js` | 16 | `validatePrice`, `validateProductName`, `validateDescription`, `getUserFriendlyError`, currency code set |
| `paypal-button-preview.test.js` | 11 | Product card rendering, currency formatting, layout variants, click prevention, PayPal logo |
| `save.test.js` | 6 | API-managed rendering, legacy rendering, stacked/single layouts, empty fallback |
| `deprecated.test.js` | 8 | `isEligible` detection, `migrate` attribute transformation, deprecated save markup matching |

### Supporting Files

| File | Purpose |
|------|---------|
| `validation.js` | Extracted validation functions from `edit.js` into a testable module |

## Total Test Count

| Layer | Existing | New | Total |
|-------|----------|-----|-------|
| PHP (PHPUnit) | 50 | 63 | **113** |
| JS (Jest) | 0 | 41 | **41** |
| **Combined** | **50** | **104** | **154** |

## Coverage Areas

- [x] `PayPal_API_Client`: CRUD, error handling, retry logic, URL validation, BN code injection
- [x] `PayPal_OAuth`: credential encryption, token caching, environment switching
- [x] `PayPal_REST_Controller`: permission checks, input validation, error response formatting
- [x] `PayPal_Attribute_Mapper`: validation rules, bidirectional mapping, merge logic
- [x] Block editor form: client-side validation, error message mapping
- [x] Preview component: rendering, layout variants, currency formatting
- [x] Save component: API-managed, legacy, and fallback paths
- [x] Deprecated handler: block migration, markup matching

Refs: WOOPTP-153
