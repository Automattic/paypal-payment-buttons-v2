# External Documentation Update Tracker — PayPal Payment Buttons V2 (v0.8.0)

**Created:** 2026-03-15
**Milestone:** Jetpack 15.7 / WordCamp Asia (April 9–11, 2026)
**PR Deadline:** March 31, 2026

All pages below currently describe the **legacy paste-code workflow** and must be updated to reflect the **v0.8.0 API-driven credential wizard**. Core changes to communicate across all pages:

- Users now connect via **Client ID + Client Secret** (not by pasting PayPal-generated HTML)
- A **guided wizard** walks through: Welcome → PayPal Developer Dashboard → Enter Credentials → Connected
- **Production is the default environment** (was sandbox) — sandbox is an explicit opt-in
- Credentials are validated on connect; invalid credentials and apps without Payment Links access are rejected with a clear error message
- The **legacy paste-code buttons continue to work** for existing merchants (backward compatible)

---

## Priority 1 — Core workflow docs (full rewrite required)

### 1. WordPress.com Support: Pay with PayPal
**URL:** https://wordpress.com/support/wordpress-editor/blocks/pay-with-paypal/
**Owner:** WordPress.com Docs team
**Current state:** Describes paste-code workflow end-to-end. No mention of Client ID/Secret, wizard, or production default.
**Required changes:**
- Replace paste-code setup instructions with the wizard flow (Client ID, Client Secret, production default)
- Add section: "Legacy buttons" — explain that paste-code buttons still work and are read-only in the editor
- Remove or archive sandbox setup as the primary path (make it a note under advanced/testing)
- Verify paid plan requirement is still accurate and reflected correctly
**Gate status:** ⬜ Pending

---

### 2. Jetpack Support: Pay with PayPal
**URL:** https://jetpack.com/support/pay-with-paypal
**Owner:** Jetpack Docs team
**Current state:** Paste-code workflow. Explicitly states Growth, Security, or Complete plan required.
**Required changes:**
- Replace paste-code setup with wizard flow
- Verify and update paid plan requirements for v0.8.0
- Add "Legacy buttons" section
- Update sandbox instructions (sandbox is now opt-in, not default)
- Add troubleshooting pointers (link to troubleshooting-guide.md or inline equivalents)
**Gate status:** ⬜ Pending

---

### 3. GitHub: Automattic/paypal-payment-buttons (plugin README)
**URL:** https://github.com/Automattic/paypal-payment-buttons
**Owner:** Andrew / Automattic engineering (we own this repo)
**Current state:** Version 0.3.2. Describes two paste-code button types (stacked, single). No API credentials.
**Required changes:**
- Bump version references to v0.8.0
- Replace setup instructions with wizard flow (Client ID/Secret, production default)
- Update "How it works" to describe API-driven vs legacy buttons
- Update sandbox instructions (opt-in, not default)
- Update PHP/WordPress version requirements if changed
- Update changelog section
**Gate status:** ⬜ Pending — **Andrew owns this directly**

---

### 4. WordPress.org Plugin Directory: PayPal Payment Buttons
**URL:** https://wordpress.org/plugins/paypal-payment-buttons/
**Owner:** Andrew / Automattic engineering (plugin submission)
**Current state:** Describes paste-code workflow. Version 0.3.2 listed. WordPress 6.7+, PHP 7.2+.
**Required changes:**
- readme.txt already updated in WOOPTP-155 — confirm this is the deployed version
- Verify the published readme.txt on .org matches `WOOPTP-155/readme.txt`
- If not deployed yet, this updates when the plugin version is pushed to .org
**Note:** This is driven by the plugin release — not a manual doc edit.
**Gate status:** ⬜ Pending plugin release

---

## Priority 2 — Overview/earn pages (targeted updates)

### 5. WordPress.com Mobile App Support: How Do I Earn Money?
**URL:** https://apps.wordpress.com/support/mobile/my-sites/how-do-i-earn-money/
**Owner:** WordPress.com Docs team
**Current state:** Overview page. Mentions "Enable Pay with PayPal" without setup details. References Jetpack Creator, Security, or Complete plan for self-hosted.
**Required changes:**
- Update any PayPal setup description to reference the new wizard (credential-based)
- Verify paid plan callout is still accurate
- This is a light touch — primary details live in the dedicated support pages above
**Gate status:** ⬜ Pending

---

### 6. Jetpack Support: Features Earn
**URL:** https://jetpack.com/support/features-earn/
**Owner:** Jetpack Docs team
**Current state:** High-level overview. Mentions "Pay with PayPal block — accepts credit/debit cards via PayPal." References Jetpack Bundle (Growth, Security, Complete) or legacy Creator plan.
**Required changes:**
- Update PayPal block description to reflect API-driven setup (one-sentence description of wizard approach)
- Verify paid plan references are still accurate
- Light touch — this is a feature overview, not a step-by-step guide
**Gate status:** ⬜ Pending

---

## Priority 3 — Third-party owned (coordination required)

### 7. PayPal Official Help: PayPal Payment Buttons on WordPress
**URL:** https://www.paypal.com/us/cshelp/article/how-do-i-set-up-and-use-paypal-payment-buttons-on-a-wordpress-website--help1294
**Owner:** PayPal (Jeeva/Rachna/Stella)
**Current state:** Describes plugin install + block insertion. No paste-code specifics. Does not mention Client ID/Secret.
**Required changes:**
- PayPal should update to reflect v0.8.0: users will need to create a PayPal Developer app, obtain Client ID and Client Secret, and connect via the wizard
- Link to PayPal Developer Dashboard app creation steps
- Update screenshots/flow if applicable
**Action:** Andrew to confirm with Jarred — request PayPal docs team update this article for v0.8.0 launch
**Gate status:** ⬜ Pending Jarred confirmation

---

## Flagged as outdated — broad Jetpack update needed

### 8. Jetpack Resources: Set Up an Online Payment / Simple Payment Button
**URL:** https://jetpack.com/resources/set-up-an-online-payment-simple-payment-button/
**Owner:** Jetpack Marketing/Docs
**Current state:** Describes the **old Simple Payments block** using PayPal email address only. References "Premium or Professional Jetpack plan." Entirely predates both the paste-code block and the API-driven wizard.
**Status:** ⚠️ **Flagged as outdated — broad Jetpack update needed.** This article describes a deprecated feature (PayPal email-based payments) and should be updated or retired. Not specific to v0.8.0 — this is a systemic Jetpack docs debt item.
**Action:** Flag to Jetpack Docs team for broader cleanup. Out of scope for this PR gate but should not remain live without a redirect or update.
**Gate status:** ⚠️ Flagged — not blocking this PR

---

## Summary

| # | URL | Owner | Draft | Gate Status |
|---|-----|-------|-------|-------------|
| 1 | wordpress.com/support/.../pay-with-paypal/ | WordPress.com Docs | `docs-drafts/01-wordpress-com-support.md` | ✅ Draft ready — send to WP.com Docs |
| 2 | jetpack.com/support/pay-with-paypal | Jetpack Docs | `docs-drafts/02-jetpack-support-pay-with-paypal.md` | ✅ Draft ready — send to Jetpack Docs |
| 3 | github.com/Automattic/paypal-payment-buttons | Andrew (direct) | `docs-drafts/03-github-readme.md` | ✅ Draft ready — Andrew applies directly |
| 4 | wordpress.org/plugins/paypal-payment-buttons/ | Driven by plugin release | `docs-drafts/04-wordpress-org-note.md` | ✅ Driven by readme.txt at release |
| 5 | apps.wordpress.com/support/.../earn/ | WordPress.com Docs | `docs-drafts/05-wordpress-com-earn-mobile.md` | ✅ Draft ready — send to WP.com Docs |
| 6 | jetpack.com/support/features-earn/ | Jetpack Docs | `docs-drafts/06-jetpack-features-earn.md` | ✅ Draft ready — send to Jetpack Docs |
| 7 | paypal.com/...help1294 | PayPal (via Jarred) | `docs-drafts/07-paypal-help-article.md` | ✅ Draft ready — Andrew to confirm with Jarred |
| 8 | jetpack.com/resources/set-up-an-online-payment... | Jetpack Marketing/Docs | — | ⚠️ Flagged — not blocking |

**All drafts complete (2026-03-15).** Items 1–7 have ready-to-send documentation drafts.
Jetpack-specific drafts (02, 06) also mirrored to fork at `projects/packages/paypal-payments/docs/`.
**Not blocking:** Item 8 (systemic Jetpack docs debt).
