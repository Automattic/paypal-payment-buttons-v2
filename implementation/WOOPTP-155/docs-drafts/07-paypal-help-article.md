# How Do I Set Up PayPal Payment Buttons on a WordPress Website? — PayPal Help Article

> **Target URL:** https://www.paypal.com/us/cshelp/article/how-do-i-set-up-and-use-paypal-payment-buttons-on-a-wordpress-website--help1294
> **Owner:** PayPal (via Jarred De Salme)
> **Action:** Andrew to confirm with Jarred — request PayPal docs team update this article for v0.8.0

---

## Suggested Draft for PayPal's Docs Team

### How do I set up and use PayPal Payment Buttons on a WordPress website?

PayPal Payment Buttons is a WordPress plugin that lets you create PayPal-branded Buy Now buttons and shareable payment links directly in the WordPress block editor.

#### What You'll Need

- A WordPress website (self-hosted WordPress.org or WordPress.com)
- A PayPal Business account
- API credentials (Client ID and Client Secret) from the PayPal Developer Dashboard

#### Step 1: Get Your API Credentials

1. Log in to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/)
2. Go to **Apps & Credentials**
3. Select the **Live** tab for production (real payments)
4. Click **Create App** — give it a name like "WordPress Payment Buttons"
5. Make sure the **Payment Links & Buttons** feature is enabled for your app
6. Copy the **Client ID** and **Client Secret**

#### Step 2: Install the Plugin

**WordPress.com users:**
- The Pay with PayPal block is included with Jetpack. No separate installation needed.

**Self-hosted WordPress users:**
- In your WordPress admin, go to **Plugins → Add New**
- Search for "PayPal Payment Buttons"
- Click **Install Now**, then **Activate**

#### Step 3: Connect Your PayPal Account

1. In the WordPress block editor, add a **PayPal Payment Buttons** block (or **Pay with PayPal** block in Jetpack)
2. The setup wizard guides you through connection:
   - Click **Get Started**
   - Follow the link to the PayPal Developer Dashboard to get your credentials
   - Enter your **Client ID** and **Client Secret**
3. The plugin validates your credentials and confirms the connection

The plugin connects in **Production** mode by default — you can accept real payments immediately.

#### Step 4: Create a Payment Button

1. Enter a **Product Name** and **Price**
2. Select a **Currency** (26 currencies supported)
3. Click **Create Button**
4. A live preview of your PayPal-branded button appears
5. **Publish** your post or page

Visitors click the button and are taken to PayPal's secure checkout page to complete payment.

#### Testing with Sandbox

To test without processing real transactions:
1. In the PayPal Developer Dashboard, select the **Sandbox** tab under Apps & Credentials
2. Create a Sandbox app and copy its credentials
3. In the WordPress block editor, toggle to Sandbox mode before entering credentials
4. When ready for real payments, disconnect and reconnect with your Live credentials

#### Supported Currencies

USD, EUR, GBP, CAD, AUD, JPY, CHF, and 19 more — 26 currencies total with proper symbol formatting.

#### Troubleshooting

- **"Not authorized for Payment Links & Buttons"** — Make sure the Payment Links & Buttons feature is enabled for your app in the Developer Dashboard
- **"Client ID or Client Secret is incorrect"** — Verify you're copying from the correct environment tab (Live vs. Sandbox)
- **Existing buttons still work** — If you previously created buttons using the paste-code method, they continue to work unchanged

#### Learn More

- [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/)
- [PayPal Payment Buttons on WordPress.org](https://wordpress.org/plugins/paypal-payment-buttons/)
- [Jetpack Pay with PayPal](https://jetpack.com/support/pay-with-paypal)

---

## Notes for Andrew → Jarred Handoff

- This article is owned by PayPal's help center team. Andrew to confirm with Jarred that PayPal will update this article before or at v0.8.0 launch.
- Key points for PayPal's team:
  1. Users now need to create a Developer Dashboard app (not just paste code)
  2. The app needs **Payment Links & Buttons** feature enabled
  3. The plugin validates credentials on connect
  4. Production is the default (not sandbox)
  5. Existing paste-code buttons are backward compatible
- Consider adding screenshots of the Developer Dashboard showing where to find Client ID, Client Secret, and the Payment Links & Buttons feature toggle.
