# PayPal Payment Buttons V2 — Live Demo

## One-click demo

Click the link below to launch a fully working demo in your browser. Nothing to install — it runs entirely in WordPress Playground.

**[Launch Demo](https://playground.wordpress.net/?blueprint-url=https://raw.githubusercontent.com/Automattic/paypal-payment-buttons-v2/trunk/playground-blueprint.json)**

Setup takes a minute or two — you'll see progress messages while it installs plugins.

## After it loads

Everything is already set up and activated for you: the PayPal Payment Buttons plugin (v0.4.1) with production-default credentials and the guided credential wizard.

### View the demo posts

1. In the left sidebar, click **Posts**.
2. You'll see three demo posts:
   - **PayPal Button — Stacked Layout** — A gold PayPal button with a "Debit or Credit Card" option below it ($29.99 USD)
   - **PayPal Button — Single Layout** — Just the PayPal button by itself ($9.99 USD)
   - **PayPal Button — Multiple Currencies** — Two buttons on one page, one in EUR and one in GBP
3. Click any post title, then click **View Post** to see how it looks on the front end.

## Things to try

- **See the buttons as a visitor would** — Click "View Post" on any demo post to see the rendered PayPal buttons.
- **Edit a button** — Open a demo post, click Edit, then click the PayPal button block. The settings panel on the right lets you change the product name, price, currency, and layout.
- **Create a new button from scratch** — Go to Posts > Add New Post, click the **+** button in the top-left of the editor, search for "PayPal", and add the PayPal Payment Buttons block.

## What's new in v0.4.1

- **Guided credential wizard** (WOOPTP-162) — 4-step onboarding flow replaces the bare credentials form
- **Production default** (WOOPTP-163) — Environment defaults to production, not sandbox
- **Token pre-validation** (WOOPTP-164) — Connect flow verifies Payment Links API access upfront
- **Token expiry resilience** (WOOPTP-165) — Absolute expiry timestamps guard against cache eviction
- **Frontend rendering parity** (WOOPTP-161) — Published buttons match the block editor preview exactly

## Good to know

- **Production mode by default.** The plugin now defaults to production (WOOPTP-163). Demo credentials are pre-configured — no real transactions occur in Playground since it's an ephemeral environment.
- **Nothing is saved permanently.** Playground runs entirely in your browser. Close the tab and everything resets. Click the link again to start fresh.
- **Login credentials** (if you get logged out): username `admin`, password `password`.
