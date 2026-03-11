# PayPal Pay Links & Buttons API Reference

> Extracted from https://docs.paypal.ai/payments/pay-links-buttons-api on 2026-03-11.
> This document serves as the implementation reference for the PayPal Payment Buttons V2 project.

## Overview

The Payment Links and Buttons API creates and manages PayPal-hosted checkout experiences. A payment link is a shareable URL that takes customers to a PayPal-hosted payment page. Each payment link is unique to a product but can be shared and reused multiple times.

**Key capabilities:**
- Accept payments through PayPal-hosted links
- Multiple payment methods: PayPal, Venmo, Pay Later, Apple Pay, credit/debit cards
- Real-time email notifications to both buyers and merchants
- PayPal Seller Protection for eligible sales

**Important limitation:** The API does NOT generate button code snippets. It returns a payment link URL that you use to build your own embeddable button.

## Authentication

- OAuth 2.0 Bearer token
- Obtain via `POST /v1/oauth2/token` with client_id + client_secret
- Prerequisites: PayPal Business Account with "Payment Links and Buttons" option enabled in Apps & Credentials

## Base URLs

| Environment | Base URL |
|-------------|----------|
| Sandbox     | `https://api-m.sandbox.paypal.com` |
| Production  | `https://api.paypal.com` |

## Endpoints

| Operation | Method | Endpoint |
|-----------|--------|----------|
| Create    | POST   | `/v1/checkout/payment-resources` |
| List      | GET    | `/v1/checkout/payment-resources` |
| Get       | GET    | `/v1/checkout/payment-resources/{id}` |
| Update    | PUT    | `/v1/checkout/payment-resources/{id}` |
| Delete    | DELETE | `/v1/checkout/payment-resources/{id}` |

**Note:** The API uses PUT (full replace) instead of PATCH for updates.

## Request Schema (POST / PUT)

### Top-level fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Payment type. Currently: `BUY_NOW` |
| `integration_mode` | string | Yes | `LINK` (shareable URL) or `BUTTON` |
| `reusable` | string | No | `MULTIPLE` (default) — link can be used many times |
| `return_url` | string | No | Redirect URL after payment completion |
| `line_items` | array | Yes | Array of product/line item objects |

### line_items[] fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | **Yes** | Product or service name |
| `product_id` | string | No | Merchant tracking / inventory ID |
| `description` | string | No | Product description for customer |
| `unit_amount` | object | **Yes*** | `{ currency_code, value }` — fixed price. *Not required if variant-level pricing is used. |
| `taxes` | array | No | Tax configuration (see below) |
| `shipping` | array | No | Shipping configuration (see below) |
| `collect_shipping_address` | boolean | No | Require shipping address at checkout |
| `customer_notes` | array | No | Custom input fields at checkout |
| `variants` | object | No | Product options (size, color, etc.) |
| `adjustable_quantity` | object | No | `{ maximum: number }` — max purchasable units |

### unit_amount object

```json
{
  "currency_code": "USD",
  "value": "39.99"
}
```

### taxes[] configuration

Two approaches:
1. **Percentage:** `{ "name": "Sales Tax", "type": "PERCENTAGE", "value": "8.25" }`
2. **Profile (merchant settings):** `{ "name": "Sales Tax", "type": "PREFERENCE", "value": "PROFILE" }`

### shipping[] configuration

Two approaches:
1. **Flat rate:** `{ "type": "FLAT", "value": "12.50" }`
2. **Profile (merchant settings):** `{ "type": "PREFERENCE", "value": "PROFILE" }`

### customer_notes[] configuration

```json
{
  "label": "Gift Message (Optional)",
  "required": false
}
```

### variants configuration

Supports up to 5 dimensions, each with up to 10 options. First dimension marked `primary: true` can have per-option pricing.

```json
{
  "dimensions": [
    {
      "name": "Color",
      "primary": true,
      "options": [
        { "label": "Black", "unit_amount": { "currency_code": "USD", "value": "149.99" } },
        { "label": "White", "unit_amount": { "currency_code": "USD", "value": "149.99" } }
      ]
    },
    {
      "name": "Size",
      "primary": false,
      "options": [
        { "label": "Small" },
        { "label": "Large" }
      ]
    }
  ]
}
```

## Response Schema (POST — 201 Created)

```json
{
  "id": "PLB-8H2K9J3N5P7Q",
  "integration_mode": "LINK",
  "type": "BUY_NOW",
  "reusable": "MULTIPLE",
  "return_url": "https://example.com/return",
  "status": "ACTIVE",
  "create_time": "2025-10-10T12:30:45Z",
  "payment_link": "https://www.paypal.com/paymentpage/PLB-8H2K9J3N5P7Q",
  "line_items": [ ... ],
  "links": [
    { "href": ".../{id}", "rel": "self", "method": "GET" },
    { "href": ".../{id}", "rel": "replace", "method": "PUT" },
    { "href": ".../{id}", "rel": "edit", "method": "PATCH" },
    { "href": ".../{id}", "rel": "delete", "method": "DELETE" },
    { "href": "https://www.paypal.com/ncp/payment/{id}", "rel": "payment_link", "method": "GET" }
  ]
}
```

**Key response fields:**
- `id` — PayPal resource ID (format: `PLB-XXXXXXXXXXXX`)
- `payment_link` — The shareable URL for customers
- `status` — `ACTIVE` after creation
- `links` — HATEOAS navigation links

## List Response (GET — 200 OK)

```json
{
  "resources": [ ... ],
  "links": [
    { "href": "...?page_size=2", "rel": "self" },
    { "href": "...?page_token=eyJ...", "rel": "next" }
  ]
}
```

**Query parameters:**
- `page_size` — Results per page
- `page_token` — Pagination cursor from previous response

## Update (PUT — 200 OK or 204 No Content)

Full replacement — send the complete updated resource body. Same schema as POST request.

## Delete (DELETE — 204 No Content)

Permanently removes the payment link. No response body.

## Error Handling

| HTTP Code | Error Name | Common Cause |
|-----------|-----------|--------------|
| 400 | `INVALID_REQUEST` | Missing required fields (name, amount) |
| 403 | `NOT_AUTHORIZED` | Expired token, insufficient scopes, Payment Links not enabled |
| 404 | `RESOURCE_NOT_FOUND` | Wrong/expired/deleted resource ID |
| 422 | `UNPROCESSABLE_ENTITY` | Invalid amount, unsupported currency, business rule violation |
| 500 | `INTERNAL_SERVER_ERROR` | Temporary disruption — retry |

## Minimal Request Example (Phase 1 target)

This is the simplest possible request for our V2 block integration:

```bash
curl -X POST 'https://api-m.sandbox.paypal.com/v1/checkout/payment-resources' \
  -H 'Authorization: Bearer {access_token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "BUY_NOW",
    "integration_mode": "LINK",
    "reusable": "MULTIPLE",
    "line_items": [{
      "name": "Product Name",
      "unit_amount": {
        "currency_code": "USD",
        "value": "29.99"
      }
    }]
  }'
```

## Implementation Notes for NCPS Block V2

1. **BN Code Attribution:** The existing `WooNCPS_Ecom_Wordpress` BN code needs to be passed in API calls. Standard PayPal approach is via `PayPal-Partner-Attribution-Id` header.

2. **integration_mode:** Use `LINK` — the API returns a payment URL. We render the button ourselves using the PayPal JS SDK (as the current block already does) pointing to this link.

3. **Phase 1 scope:** `name` + `unit_amount` (required fields). Optional: `description`, `return_url`. Variants, taxes, shipping are Phase 2 enhancements.

4. **OAuth flow for WordPress:** Client credentials stored encrypted in `wp_options`. Server-side token exchange only — never expose client_secret to the browser.

5. **Sandbox vs Production:** Toggle based on a settings field. Sandbox base URL: `api-m.sandbox.paypal.com`. Production: `api.paypal.com`.
