# WOOPTP-147: PayPal API Client + Button CRUD REST Endpoints

## Summary

Implements the PayPal Pay Links & Buttons API client (`PayPal_API_Client`) and exposes button CRUD operations through WordPress REST API endpoints. This builds on WOOPTP-146's OAuth foundation to let the block editor create, read, update, and delete PayPal payment resources via `/jetpack/v4/paypal/buttons`.

## Changes

### New Files

1. **`projects/packages/paypal-payments/src/paypal-payment-buttons/class-paypal-api-client.php`**
   - Typed CRUD methods: `create_resource()`, `list_resources()`, `get_resource()`, `update_resource()`, `delete_resource()`
   - Private `make_request()` handles auth token retrieval, BN code attribution header, response parsing
   - Error mapping: PayPal error format → `WP_Error` with user-friendly messages per HTTP status
   - 401 responses automatically clear the token cache for transparent retry
   - Resource ID validation: enforces `PLB-XXXXXXXXXXXX` format via regex
   - PUT (not PATCH) for updates — full replacement as per PayPal API spec

2. **`projects/packages/paypal-payments/tests/php/PayPal_API_Client_Test.php`**
   - 28 unit tests covering:
     - Auth dependency (all 5 CRUD methods fail without credentials)
     - Resource ID validation (empty, invalid format, injection attempts)
     - Successful CRUD operations with mocked HTTP responses
     - Error handling (400, 401, 404, 422, 429, 500)
     - 401 token cache clearing behavior
     - HTTP transport errors
     - Invalid JSON response handling
     - Request format verification (method, headers, URL, timeout, pagination params)
     - Sandbox URL construction

### Modified Files

3. **`projects/packages/paypal-payments/src/paypal-payment-buttons/class-paypal-rest-controller.php`**
   - Added 5 button CRUD REST routes under `jetpack/v4/paypal/buttons`:
     - `POST /buttons` — create a payment resource
     - `GET /buttons` — list with pagination (`page_size`, `page_token`)
     - `GET /buttons/{resource_id}` — get single resource (ID validated via URL regex)
     - `PUT /buttons/{resource_id}` — full replacement update
     - `DELETE /buttons/{resource_id}` — delete resource
   - Added handler methods: `handle_create_button()`, `handle_list_buttons()`, `handle_get_button()`, `handle_update_button()`, `handle_delete_button()`
   - Added helpers: `get_button_create_args()` (shared schema for create/update), `build_resource_data()`, `sanitize_line_items()`, `api_error_to_rest_error()`
   - All endpoints require `manage_options` capability

## Architecture Notes

- **API Client ↔ REST Controller separation**: `PayPal_API_Client` talks to PayPal, `PayPal_REST_Controller` talks to the block editor. The controller sanitizes WP input and maps API errors to REST responses.
- **BN Code attribution**: Every API request includes `PayPal-Partner-Attribution-Id: WooNCPS_Ecom_Wordpress` header.
- **Line items schema**: Mirrors PayPal's spec — `name`, `unit_amount` (with `currency_code` + `value`), optional `description`, `quantity`, `image_url`.
- **Phase 1 constraints**: `type` limited to `BUY_NOW`, `integration_mode` supports `LINK` and `BUTTON`.
- **No new autoload config needed**: Package uses `classmap` autoload from `src/`, so new classes are auto-discovered.

## Security Considerations

- All REST endpoints gated by `manage_options` capability
- Resource IDs validated against `PLB-[A-Za-z0-9]+` regex before use in API URLs
- Line item fields sanitized with `sanitize_text_field()` and `esc_url_raw()`
- PayPal error responses sanitized before surfacing to users
- No raw user input concatenated into API URLs

## Testing

```bash
# Run API client tests
cd projects/packages/paypal-payments
composer phpunit -- --filter PayPal_API_Client_Test

# Run all package tests
composer phpunit
```

## Checklist

- [x] API client with full CRUD operations
- [x] REST endpoints for block editor integration
- [x] Resource ID format validation
- [x] Deep sanitization of line items
- [x] PayPal error → WP_Error mapping with user-friendly messages
- [x] 401 auto-clears token cache
- [x] BN code attribution on all requests
- [x] PUT (not PATCH) for updates
- [x] Pagination support on list endpoint
- [x] 28 unit tests with mocked HTTP
- [x] All endpoints require `manage_options`
- [ ] Manual testing against PayPal sandbox (requires credentials)
