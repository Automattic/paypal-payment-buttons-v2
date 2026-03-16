# Pay with PayPal Block — WordPress.com Support Page

> **Target URL:** https://wordpress.com/support/wordpress-editor/blocks/pay-with-paypal/
> **Owner:** WordPress.com Docs team
> **Action:** Full rewrite — replaces current paste-code workflow with API-driven credential wizard

---

## Pay with PayPal

The Pay with PayPal block lets you accept payments on your WordPress site using PayPal. Add a PayPal-branded Buy Now button to any post or page — visitors click it and complete payment on PayPal's secure checkout page.

Every button you create also generates a shareable payment link you can use anywhere: in emails, on social media, or embedded in text.

### What You'll Need

- A PayPal Business or Developer account
- API credentials (Client ID and Client Secret) from the PayPal Developer Dashboard

### Connect Your PayPal Account

When you add the Pay with PayPal block to a post or page for the first time, a setup wizard walks you through connecting your account:

1. **Get Started** — Click to begin the connection process.
2. **Get your credentials** — The wizard links you to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/). Once there:
   - Go to **Apps & Credentials**
   - Select the **Live** tab (for real payments)
   - Click **Create App** (or open an existing app)
   - Copy the **Client ID** and **Client Secret**
3. **Enter credentials** — Paste your Client ID and Client Secret into the block. The plugin connects to PayPal and verifies your credentials automatically.
4. **Connected** — You're ready to create payment buttons.

The plugin defaults to **Production** mode, meaning you can accept real payments immediately. If you want to test first, toggle to **Sandbox** mode at the bottom of the credentials step — you'll need a separate Sandbox app from the PayPal Developer Dashboard.

### Create a Payment Button

Once connected:

1. Enter a **Product Name** (what you're selling)
2. Enter a **Price** and select a **Currency** (26 currencies supported)
3. Optionally add a **Description**
4. Click **Create Button**

The plugin creates a payment resource via PayPal's API and shows a live preview of your button — exactly how it will appear on your published page.

### Button Layouts

- **Stacked** — PayPal button with a secondary "Debit or Credit Card" button below it
- **Single** — PayPal button only

### Edit or Delete a Button

After creating a button, you can:

- Click **Edit Button** in the sidebar to update the product name, price, or description
- Click **Delete Button** to remove it and start over

### Existing (Legacy) Buttons

If you previously created PayPal buttons using the paste-code method, those buttons continue to work unchanged. They display a "Legacy" indicator in the editor but render normally on the frontend. There is no forced migration — old buttons work as-is.

### Supported Currencies

USD, EUR, GBP, CAD, AUD, JPY, CHF, SEK, NOK, DKK, NZD, SGD, HKD, MXN, BRL, PLN, CZK, HUF, ILS, MYR, PHP, TWD, THB, INR, CNY, and RUB.

### Disconnecting PayPal

You can disconnect your PayPal account at any time from the block sidebar. Disconnecting removes your stored credentials, but existing published buttons continue to work — payment links are hosted by PayPal and don't depend on the plugin connection.

### Troubleshooting

**"The Client ID or Client Secret is incorrect"**
Make sure you're copying credentials from the correct environment tab in the PayPal Developer Dashboard. Production credentials won't work in Sandbox mode, and vice versa.

**"Your PayPal app does not have access to Payment Links & Buttons"**
Your PayPal app needs the Payment Links & Buttons feature enabled. Check your app settings in the PayPal Developer Dashboard, or create a new app with the correct permissions.

**"Could not connect to PayPal"**
Your server may be blocking outgoing HTTPS requests. Contact your hosting provider to ensure `api.paypal.com` is accessible.
