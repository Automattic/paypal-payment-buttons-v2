# WOOPTP-148: Block Editor Form UI + Frontend Rendering

## Summary

Implements the block editor React component and frontend rendering for API-managed PayPal Payment Buttons. This is the core user-facing work that wires the backend (WOOPTP-146 OAuth, WOOPTP-147 API Client) to the WordPress block editor.

**Linear:** WOOPTP-148

## Changes

### Block Editor Component (`edit.js`)

The new `edit.js` replaces the legacy paste-code textarea with a fully API-driven flow:

1. **Connection check** — On mount, checks `GET /jetpack/v4/paypal/connection` to determine if PayPal is connected.
2. **Connect PayPal form** — When not connected, shows a form for Client ID + Secret. Calls `POST /jetpack/v4/paypal/connect` and validates credentials via live token exchange.
3. **Product creation form** — When connected, shows fields for:
   - Product Name (required)
   - Price (required, numeric)
   - Currency (select from common currencies)
   - Description (optional)
   - Button Label (default: "Buy Now")
4. **Create/Update button** — Calls `POST /jetpack/v4/paypal/buttons` (or `PUT` for updates) to create the payment resource on PayPal. Stores `resourceId`, `paymentUrl`, and `apiManaged: true` in block attributes.
5. **Button preview** — After creation, shows a live preview with the product name, price, and styled PayPal button.
6. **Edit/Delete** — Sidebar controls to edit or delete the button. Delete calls `DELETE /jetpack/v4/paypal/buttons/{id}` and resets the block.
7. **Legacy detection** — Blocks with `buttonType`/`hostedButtonId`/`scriptSrc` attributes are recognized as legacy and shown a non-destructive notice.

### Updated `block.json`

New attributes for API-managed blocks:
- `apiManaged` (boolean) — Distinguishes V2 API-managed blocks from legacy paste-code blocks
- `resourceId` (string) — PayPal resource ID (`PLB-XXX` format)
- `paymentUrl` (string) — PayPal payment link URL
- `productName`, `price`, `currency`, `productDescription`, `buttonLabel` — Product fields

Legacy attributes (`buttonType`, `scriptSrc`, `hostedButtonId`, `buttonText`) preserved for backward compatibility.

### Updated `render_block()` in `class-paypal-payment-buttons.php`

- Refactored into `render_api_managed_button()` and `render_legacy_button()` private methods
- API-managed buttons render a form pointing to the `paymentUrl` with BN code attribution (`at_code` query parameter)
- PayPal payment URL validated via `sanitize_paypal_script_url()` (same domain whitelist as legacy)
- Legacy buttons render identically to before — no behavior changes

### Frontend Styles (`style.css`)

Minimal CSS for API-managed button rendering: product name/price display, PayPal-branded submit button, payment method icons, "Powered by PayPal" badge.

### Editor Styles (`editor.scss`)

Styles for the connection form, product creation form, and button preview in the block editor.

### Tests (`edit.test.js`)

20 Jest tests covering:
- Loading state (spinner while checking connection)
- Connection form rendering and validation
- Connect API call and error handling
- Product form rendering and validation
- Create API call with correct payload
- Button preview rendering
- Edit mode toggle and update API call
- Delete API call and attribute reset
- Legacy block detection
- Disconnect flow

## Testing Instructions

### Manual Testing

1. **Fresh block (not connected):**
   - Add a PayPal Payment Buttons block
   - Should see "Connect your PayPal account" form
   - Enter sandbox credentials → should connect and show product form

2. **Create a button:**
   - Fill in product name ("Test Widget"), price ("19.99"), currency (USD)
   - Click "Create Button"
   - Should see button preview with product name, price, and PayPal button

3. **Edit a button:**
   - In sidebar, click "Edit Button"
   - Change price to "24.99"
   - Click "Update Button"
   - Preview should update

4. **Delete a button:**
   - In sidebar, click "Delete Button"
   - Block should reset to product creation form

5. **Legacy block:**
   - Load a page with an existing paste-code PayPal block
   - Should show legacy notice, not break rendering

6. **Frontend rendering:**
   - Save and view the page
   - API-managed button should render with PayPal-branded form
   - Click should open PayPal payment page in new tab
   - BN code should be in the URL (`at_code=WooNCPS_Ecom_Wordpress`)

### Automated Tests

```bash
# Run Jest tests
pnpm jest implementation/WOOPTP-148/edit.test.js
```

## Backward Compatibility

- Existing paste-code blocks (`buttonType: 'single'` or `'stacked'`) continue to render via the `render_legacy_button()` path — no changes to legacy output
- New blocks default to `apiManaged: false` and only become API-managed after successful button creation
- Legacy blocks in the editor show a non-destructive notice suggesting the new flow
- No migration required — both paths coexist

## Security

- PayPal credentials entered in the connection form are sent server-side only via the existing `POST /jetpack/v4/paypal/connect` endpoint (WOOPTP-146)
- Client secret is never stored in block attributes or exposed to the frontend
- Payment URLs validated against PayPal domain whitelist before rendering
- BN code injected server-side as URL parameter
- All REST endpoints require `manage_options` capability
