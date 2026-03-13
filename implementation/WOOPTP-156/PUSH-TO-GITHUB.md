# WOOPTP-156 — Push to GitHub

Two PRs to open. Run each block independently from the appropriate local clone.

---

## PR 1 — `Automattic/paypal-payment-buttons-v2`

**Base branch:** `trunk`
**New branch:** `fix/wooptp-156-paypal-brand-compliance`

```bash
# From your local clone of Automattic/paypal-payment-buttons-v2
git checkout trunk
git pull origin trunk
git checkout -b fix/wooptp-156-paypal-brand-compliance

# The implementation files are already in the repo working tree at:
# implementation/WOOPTP-156/
# If you're working from the paypal-payment-buttons-v2 workspace,
# the files are already in the right place — just stage and commit.

git add implementation/WOOPTP-156/paypal-button-preview.js \
        implementation/WOOPTP-156/editor.scss \
        implementation/WOOPTP-156/save.js \
        implementation/WOOPTP-156/style.scss \
        implementation/WOOPTP-156/PR-DESCRIPTION.md

git commit -m "fix: PayPal brand compliance and design guidelines (WOOPTP-156)

- Add PayPal wordmark SVG inline in save.js (brand requirement)
- Standardise logo height to 20px across editor and frontend
- Change button layout to flex to accommodate logo + text
- Replace :focus with :focus-visible per WP/Jetpack guidelines (WCAG 2.4.7)
- Internationalise button strings via __() in save.js
- Extract brand colours as SCSS variables in style.scss
- Add 'Powered by PayPal' attribution (brand requirement)

Refs: WOOPTP-156"

git push origin fix/wooptp-156-paypal-brand-compliance
```

Then open a **draft PR** at:
https://github.com/Automattic/paypal-payment-buttons-v2/compare/trunk...fix/wooptp-156-paypal-brand-compliance

- **Title:** `fix: PayPal brand compliance and design guidelines (WOOPTP-156)`
- **Body:** Paste the contents of `implementation/WOOPTP-156/PR-DESCRIPTION.md`

---

## PR 2 — `slash1andy/jetpack` (Jetpack Monorepo fork)

**Base branch:** `wooptp-158-159-api-fixes`
**New branch:** `fix/wooptp-156-paypal-brand-compliance`
**Target files:** `projects/packages/paypal-payments/src/paypal-payment-buttons/`

```bash
# From your local clone of slash1andy/jetpack
git checkout wooptp-158-159-api-fixes
git pull origin wooptp-158-159-api-fixes
git checkout -b fix/wooptp-156-paypal-brand-compliance

# Copy the four source files from your paypal-payment-buttons-v2 workspace
# (adjust SRC to the path of your local paypal-payment-buttons-v2 clone)
SRC="/path/to/paypal-payment-buttons-v2/implementation/WOOPTP-156"
DEST="projects/packages/paypal-payments/src/paypal-payment-buttons"

cp "$SRC/paypal-button-preview.js" "$DEST/paypal-button-preview.js"
cp "$SRC/editor.scss"              "$DEST/editor.scss"
cp "$SRC/save.js"                  "$DEST/save.js"
cp "$SRC/style.scss"               "$DEST/style.scss"

git add \
  "$DEST/paypal-button-preview.js" \
  "$DEST/editor.scss" \
  "$DEST/save.js" \
  "$DEST/style.scss"

git commit -m "fix: PayPal brand compliance and design guidelines (WOOPTP-156)

- Add PayPal wordmark SVG inline in save.js (brand requirement)
- Standardise logo height to 20px across editor and frontend
- Change button layout to flex to accommodate logo + text
- Replace :focus with :focus-visible per WP/Jetpack guidelines (WCAG 2.4.7)
- Internationalise button strings via __() in save.js
- Extract brand colours as SCSS variables in style.scss
- Add 'Powered by PayPal' attribution (brand requirement)

Refs: WOOPTP-156"

git push origin fix/wooptp-156-paypal-brand-compliance
```

Then open a **draft PR** at:
https://github.com/slash1andy/jetpack/compare/wooptp-158-159-api-fixes...fix/wooptp-156-paypal-brand-compliance

- **Title:** `fix: PayPal brand compliance and design guidelines (WOOPTP-156)`
- **Body:** Paste the contents of `implementation/WOOPTP-156/PR-DESCRIPTION.md`

---

## File paths at a glance

| File | `paypal-payment-buttons-v2` path | `slash1andy/jetpack` path |
|---|---|---|
| `paypal-button-preview.js` | `implementation/WOOPTP-156/paypal-button-preview.js` | `projects/packages/paypal-payments/src/paypal-payment-buttons/paypal-button-preview.js` |
| `editor.scss` | `implementation/WOOPTP-156/editor.scss` | `projects/packages/paypal-payments/src/paypal-payment-buttons/editor.scss` |
| `save.js` | `implementation/WOOPTP-156/save.js` | `projects/packages/paypal-payments/src/paypal-payment-buttons/save.js` |
| `style.scss` | `implementation/WOOPTP-156/style.scss` | `projects/packages/paypal-payments/src/paypal-payment-buttons/style.scss` |
| `PR-DESCRIPTION.md` | `implementation/WOOPTP-156/PR-DESCRIPTION.md` | _(not needed in Jetpack)_ |
