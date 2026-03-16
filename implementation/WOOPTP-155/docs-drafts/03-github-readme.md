# PayPal Payment Buttons — GitHub README

> **Target URL:** https://github.com/Automattic/paypal-payment-buttons
> **Owner:** Andrew / Automattic engineering
> **Action:** Full rewrite of README.md for the standalone plugin repository

---

# PayPal Payment Buttons

Accept payments with PayPal — create branded Buy Now buttons and shareable payment links directly in the WordPress block editor.

## Description

PayPal Payment Buttons lets you accept payments on your WordPress site using PayPal's Pay Links & Buttons API. Create professional, PayPal-branded Buy Now buttons — and shareable payment links — without leaving the block editor.

### Key Features

- **API-driven button and link creation** — Enter product name, price, and currency; the plugin creates a PayPal payment resource automatically, giving you both an embeddable button and a shareable payment URL
- **Guided setup wizard** — Step-by-step connection flow walks you through getting PayPal Developer credentials and connecting your account
- **PayPal-branded buttons** — Gold PayPal button with optional Debit/Credit Card secondary button
- **Live preview** — See exactly how your button will look before publishing
- **26 currencies supported** — USD, EUR, GBP, JPY, and 22 more with proper currency symbol formatting
- **Stacked or single layout** — Two-button stack (PayPal + Debit/Credit) or PayPal-only
- **Secure credential storage** — Credentials are stored with integrity protection using WordPress security keys
- **Backward compatible** — Existing paste-code buttons continue to work unchanged

## Requirements

- WordPress 6.8 or later
- PHP 7.4 or later with OpenSSL extension
- A PayPal Business or Developer account

## Installation

### From WordPress Plugin Directory

1. In your WordPress admin, go to **Plugins → Add New**
2. Search for "PayPal Payment Buttons"
3. Click **Install Now**, then **Activate**

### Manual Installation

1. Download the latest release from this repository
2. Upload to `/wp-content/plugins/paypal-payment-buttons/`
3. Activate through the **Plugins** screen

### Within Jetpack

This plugin is also available as part of the Jetpack plugin. If you're using Jetpack, the Pay with PayPal block is included automatically.

## Setup

### 1. Get PayPal API Credentials

1. Log in to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/)
2. Go to **Apps & Credentials**
3. Select **Live** for production (real payments) or **Sandbox** for testing
4. Click **Create App** or select an existing app
5. Copy the **Client ID** and **Client Secret**

### 2. Connect in WordPress

1. Add a **PayPal Payment Buttons** block to any post or page
2. The setup wizard guides you through:
   - **Welcome** → Click "Get Started"
   - **Dashboard** → Links to PayPal Developer Dashboard for credentials
   - **Credentials** → Paste your Client ID and Client Secret
3. The plugin validates your credentials and confirms the connection

The plugin defaults to **Production** mode. To test first, click "Use Sandbox for testing" at the bottom of the credentials step and use Sandbox credentials from the PayPal Developer Dashboard.

### 3. Create a Button

1. Enter a **Product Name**, **Price**, and **Currency**
2. Optionally add a **Description**
3. Click **Create Button**
4. A live preview appears — publish your post to make it live

## How It Works

The plugin connects to PayPal's [Pay Links & Buttons API](https://developer.paypal.com/docs/api/payment-links/v1/) using OAuth 2.0 client credentials. When you create a button:

1. Your credentials authenticate via OAuth token exchange
2. The plugin creates a payment resource on PayPal's servers
3. PayPal returns a payment link URL (e.g., `https://www.paypal.com/ncp/payment/PLB-XXXX`)
4. The block stores the resource ID and payment link as block attributes
5. On the frontend, a styled PayPal button links to that payment URL

### Revenue Attribution

Payment links include the partner attribution code (`at_code` query parameter) for revenue tracking through PayPal's partner program.

## Button Layouts

| Layout | Description |
|--------|-------------|
| **Stacked** | PayPal button with a "Debit or Credit Card" secondary button below |
| **Single** | PayPal button only |

## Legacy Support

Buttons created with the earlier paste-code workflow continue to work. They display a "Legacy" indicator in the editor but render normally on the frontend. No migration is needed.

## Sandbox Testing

1. In the PayPal Developer Dashboard, select the **Sandbox** tab
2. Create a Sandbox app and copy its credentials
3. In the block editor, toggle to Sandbox mode
4. Create test buttons — no real money is involved
5. When ready, disconnect and reconnect with Production (Live) credentials

## Development

### Build

```bash
pnpm install
pnpm run build
```

### Tests

```bash
# PHP (PHPUnit)
php vendor/bin/phpunit

# JavaScript (Jest)
pnpm run test:js
```

## Changelog

### 0.8.0

- **New:** API-driven button and payment link creation via PayPal's Pay Links & Buttons API
- **New:** Guided setup wizard with credential validation
- **New:** OAuth 2.0 connection flow with encrypted credential storage
- **New:** Live button preview in the block editor
- **New:** Frontend rendering matches editor preview exactly
- **New:** 26 supported currencies with proper symbol formatting
- **New:** Edit/preview mode toggle for existing buttons
- **New:** Client-side and server-side input validation
- **New:** Automatic token refresh with retry logic and exponential backoff
- **New:** PayPal URL domain whitelist for payment link validation
- **Fixed:** PayPal SVG icon in block inserter and toolbar
- **Improved:** User-friendly error messages for all PayPal API errors
- **Improved:** Backward compatibility with paste-code blocks

### 0.3.2

- Tested up to WordPress 6.9
- Updated dependencies

### 0.3.1

- Updated short description

### 0.3.0

- Improved PayPal button parsing robustness
- Removed admin page
- Updated readme and distribution assets

### 0.2.0

- Initial release with PayPal Payment Button block

## License

GPLv2 or later. See [LICENSE.txt](LICENSE.txt).
