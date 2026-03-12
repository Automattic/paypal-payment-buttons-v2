# WOOPTP-149: Block Editor Form UI for API-Driven Button Creation

## Summary

Replaces the legacy paste-code textarea in `edit.js` with an API-driven form UI. Merchants can now create PayPal buttons by filling in product details directly in the block editor, with the plugin handling all PayPal API communication server-side.

## Changes

### New Files

1. **`projects/packages/paypal-payments/src/paypal-payment-buttons/edit.js`**
   - React component with 4 distinct UI states:
     - **Loading** — Spinner while checking PayPal connection status
     - **Connect** — Form to enter client_id + client_secret with environment selector
     - **Create** — Product form (name, price, currency, description) with "Create Button" action
     - **Preview** — Shows created button with product details and update capability
   - Uses `@wordpress/api-fetch` to call REST endpoints from WOOPTP-146/147
   - Inspector sidebar panels: Product Details, Button Settings, PayPal Connection
   - Legacy paste-code blocks render with a read-only indicator (no migration forced)

2. **`projects/packages/paypal-payments/src/paypal-payment-buttons/editor.scss`**
   - Editor-only styles for all 4 UI states
   - Connection status dot (green = connected)
   - Sandbox environment badge
   - PayPal-branded button preview
   - Price/currency inline row layout

## UI States

### 1. Not Connected
- Clean form with Client ID, Client Secret (password field), Environment selector
- "Connect PayPal" button with loading/error states
- Help text pointing to PayPal Developer Dashboard

### 2. Connected — No Button Created
- Green status indicator + sandbox badge when applicable
- Product Name (text), Price (number), Currency (dropdown), Description (textarea)
- "Create Button" primary action
- Sidebar: Button Layout (stacked/single), Button Text, Return URL

### 3. Connected — Button Created (Preview)
- Styled button preview with product name and price
- Sidebar: editable product details + "Update Button" action
- PayPal Connection panel showing resource ID and disconnect option

### 4. Legacy Block
- Read-only indicator for paste-code blocks
- Sidebar retains Button Layout and Button Text controls
- No forced migration — existing blocks continue working

## Architecture

- **Connection check** runs once on mount via `useEffect` → `GET /jetpack/v4/paypal/connection`
- **Create** sends `POST /jetpack/v4/paypal/buttons` with line_items payload
- **Update** sends `PUT /jetpack/v4/paypal/buttons/{resourceId}` with full body (no PATCH)
- Block attributes updated from API response: `isApiManaged`, `resourceId`, `paymentLink`
- Frontend-only attributes (`buttonText`, `buttonType`) never sent to API

## Currencies

26 currencies supported, matching `PayPal_Attribute_Mapper::SUPPORTED_CURRENCIES`:
USD, EUR, GBP, CAD, AUD, JPY, CHF, SEK, NOK, DKK, NZD, SGD, HKD, MXN, BRL, PLN, CZK, HUF, ILS, MYR, PHP, TWD, THB, INR, CNY, RUB

## Checklist

- [x] Form renders in block editor when PayPal is connected
- [x] Merchant can fill in product details and create button
- [x] Success state shows button preview
- [x] Error states handled gracefully with user-friendly messages
- [x] Paste-code fallback works when PayPal not connected
- [x] Legacy blocks render with read-only indicator
- [x] Inspector sidebar controls for button layout, text, and product editing
- [x] Update button sends PUT with full body
- [x] Sandbox badge displayed when in sandbox environment
- [ ] Jest tests for component (WOOPTP-153)
- [ ] Manual testing against PayPal sandbox (WOOPTP-159)

Refs: WOOPTP-149
