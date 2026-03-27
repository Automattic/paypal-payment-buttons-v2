# PayPal Payment Buttons V2 — Live Demo

## One-click demo

Click the link below to launch a fully working demo in your browser. Nothing to install — it runs entirely in WordPress Playground.

**[Launch Demo](https://playground.wordpress.net/?blueprint-url=https://raw.githubusercontent.com/Automattic/paypal-payment-buttons-v2/trunk/playground-blueprint.json)**

Setup takes a minute or two — you'll see progress messages while it installs plugins.

## After it loads

Everything is already set up and activated for you: the PayPal Payment Buttons plugin (v0.9.0) with demo credentials pre-seeded as if a merchant completed the "Connect with PayPal" Partner Referrals onboarding flow.

### View the demo posts

1. In the left sidebar, click **Posts**.
2. You'll see four demo posts:
   - **PayPal Button — Standard** — A theme-native "Buy Now" button with "Powered by PayPal" attribution ($29.99 USD)
   - **PayPal Button — Minimal** — A single "Buy Now" button ($9.99 USD)
   - **PayPal Button — Multiple Currencies** — Two buttons on one page, one in EUR and one in GBP
   - **PayPal Button — Product Variants** — A T-shirt with 3 color options (including per-option pricing) and 4 sizes
3. Click any post title, then click **View Post** to see how it looks on the front end.

## Things to try

- **See the buttons as a visitor would** — Click "View Post" on any demo post to see the rendered PayPal buttons.
- **Edit a button** — Open a demo post, click Edit, then click the PayPal button block. The settings panel on the right lets you change the product name, price, and currency.
- **Create a new button from scratch** — Go to Posts > Add New Post, click the **+** button in the top-left of the editor, search for "PayPal", and add the PayPal Payment Buttons block.
- **Disconnect and reconnect** — In the block settings, click "Disconnect" to reset credentials. You'll see the connect screen with both the "Connect with PayPal" button (Partner Referrals) and the "Enter credentials manually" fallback option.

## How merchants connect (v0.9.0+)

V2 supports two connection methods:

### Primary: Connect with PayPal (Partner Referrals)

This is the default experience for merchants on WordPress.com, Jetpack, and the standalone plugin:

1. Merchant adds the PayPal Payment Buttons block to a post or page.
2. Clicks **Connect with PayPal**.
3. A PayPal mini-browser opens — merchant logs in with their PayPal Business account.
4. Merchant reviews permissions and clicks **Agree and Connect**.
5. PayPal exchanges an authorization code (with PKCE) for merchant credentials automatically.
6. The block editor shows the connected state — merchant can start creating products.

No developer dashboard visit, no credential copying. The Partner Referrals API (`/v2/customer/partner-referrals`) handles the entire handshake.

### Fallback: Manual credential entry

For merchants who prefer manual setup or are troubleshooting:

1. Merchant clicks **Enter credentials manually** (below the Connect button).
2. Goes to [developer.paypal.com](https://developer.paypal.com) → My Apps & Credentials → Create App.
3. Enables the **Payment Links & Buttons** feature on the app.
4. Copies the **Client ID** and **Client Secret**.
5. Pastes them into the 4-step credential wizard (Welcome → Developer Dashboard → Credentials → Connected).
6. Plugin validates credentials and confirms Payment Links API access.

### What the Playground demo shows

The Playground seeds credentials as if Partner Referrals onboarding completed successfully. The `onboarding_method` is set to `partner_referrals` and a demo `merchant_id` is stored. This lets you explore the fully connected experience — product creation, variants, QR codes, email sending — without needing a real PayPal account.

To see the **disconnected/connect screen**, disconnect from the block settings panel.

## What's new in v0.9.0

- **Connect with PayPal** (Partner Referrals) — One-click onboarding via PayPal mini-browser with PKCE auth code exchange
- **Guided credential wizard** (WOOPTP-162) — 4-step fallback onboarding flow with PayPal logo and sandbox explanation
- **Production default** (WOOPTP-163) — Environment defaults to production, not sandbox
- **Token pre-validation** (WOOPTP-164) — Connect flow verifies Payment Links API access upfront
- **Token expiry resilience** (WOOPTP-165) — Absolute expiry timestamps guard against cache eviction
- **Frontend rendering parity** (WOOPTP-161) — Published buttons match the block editor preview exactly
- **QR code generation** (WOOPTP-183) — "Show QR Code" toggle on frontend pages for in-person sharing
- **Product variants** (WOOPTP-174) — Size, color, and other options with per-option pricing
- **Shipping & tax support** (WOOPTP-172/173) — Flat-rate shipping and percentage-based tax configuration
- **Adjustable quantity** (WOOPTP-170) — Let buyers choose quantity at checkout
- **Customer notes** (WOOPTP-171) — Custom input fields at checkout
- **Send payment link via email** (WOOPTP-181) — Email payment links to customers from the admin dashboard
- **Credential encryption** (WOOPTP-189) — Credentials encrypted at rest via sodium_crypto_secretbox
- **RUB currency removed** — Per PayPal guidance, Russian Ruble removed from currency list
- **Sanitization hardening** — $_GET superglobal sanitization per Pluginomattic guidelines
- **20+ UX and security fixes** — Adversarial review, ARIA semantics, confirmation dialogs, and more

## Good to know

- **Production mode by default.** The plugin now defaults to production (WOOPTP-163). Demo credentials are pre-configured — no real transactions occur in Playground since it's an ephemeral environment.
- **Nothing is saved permanently.** Playground runs entirely in your browser. Close the tab and everything resets. Click the link again to start fresh.
- **Login credentials** (if you get logged out): username `admin`, password `password`.
