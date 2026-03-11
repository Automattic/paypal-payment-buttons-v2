# Questions for Jarred — PayPal Pay Links & Buttons API

**From:** Andrew Wikel (Automattic / Woo Payment Partnerships)
**Date:** 2026-03-11
**Re:** PayPal Payment Buttons V2 — Jetpack integration using Pay Links & Buttons API
**Linear:** [WOOPTP-158](https://linear.app/a8c/issue/WOOPTP-158/follow-up-questions-for-jarred-paypal-remaining-api-unknowns)

---

Hi Jarred,

Thanks for the pointer to the Pay Links & Buttons API docs — we've reviewed them in full and have a solid handle on the integration. Most of our questions from Monday's call are resolved. Three items aren't covered in the public docs and we'd appreciate your input before we finalize the implementation.

## 1. Partner Attribution (BN Code) on `/v1/checkout/payment-resources`

We need to pass our BN code `WooNCPS_Ecom_Wordpress` on every API call for revenue share tracking. On other PayPal APIs we use the `PayPal-Partner-Attribution-Id` header. The Pay Links & Buttons docs don't explicitly mention this header.

**Questions:**
- Is `PayPal-Partner-Attribution-Id` supported on the `/v1/checkout/payment-resources` endpoints (POST, GET, PUT, DELETE)?
- Same format as other PayPal APIs — just the header with the BN code string value?
- Is there any alternative or additional partner attribution mechanism specific to Payment Links?

**Why it matters:** This is how Automattic tracks revenue attribution. If the header isn't supported on this endpoint, we need an alternative before we can ship.

**Our default:** We'll implement the header and test in sandbox. If it silently fails, we need to know.

## 2. Webhook Support for Payment Events

The docs mention email notifications to buyers and merchants after payment, but there's no mention of webhooks.

**Questions:**
- Does the Pay Links & Buttons API fire webhook events (e.g., `PAYMENT.SALE.COMPLETED`, `CHECKOUT.ORDER.COMPLETED`) when a customer completes payment through a payment link?
- If yes, which event types, and do they include the `PLB-` resource ID in the payload?
- If no webhooks, is there a polling endpoint or any programmatic way to check payment status for a given payment resource?
- Or is this purely fire-and-forget — PayPal handles fulfillment notifications via email only?

**Why it matters:** Determines whether we can show payment status in the WordPress admin, or if merchants rely entirely on PayPal email notifications and the PayPal dashboard.

**Our default:** Phase 1 ships without webhook support. We'll add it in Phase 2 if available.

## 3. API Rate Limits

The docs don't specify rate limits for `/v1/checkout/payment-resources`.

**Questions:**
- What are the request rate limits (per-minute and/or per-hour) for this endpoint?
- Are limits scoped per-app (client_id) or per-merchant account?
- Does the API return rate limit headers (e.g., `X-RateLimit-Remaining`, `Retry-After`)?
- Any differences between sandbox and production limits?

**Why it matters:** Affects our retry/backoff strategy and whether we need request queuing on the WordPress side.

**Our default:** Conservative exponential backoff (3 retries, 1s/2s/4s delays) as a safe baseline.

---

## Context

- We're building V2 of the PayPal Payment Buttons block for Jetpack / WordPress.com
- Target: Jetpack 15.7, shipping before WordCamp Asia (April 9-11)
- Phase 1: BUY_NOW type, API-driven creation in the block editor, OAuth client credentials auth
- None of these questions block development — we're proceeding with safe defaults — but answers are needed before final code review

Happy to share the full PRD or API reference doc if helpful. Thanks!
