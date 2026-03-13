# WOOPTP-162: Guided credential entry UX

## Summary

Replaces the bare connection form with a step-by-step guided wizard that walks merchants through connecting their PayPal Developer account. Reduces setup friction and error rates while keeping the `client_credentials` auth flow.

## Changes

### `edit.js` (supersedes WOOPTP-151)

**New wizard flow replacing bare form:**
- **Welcome step:** Brief intro + "Get Started" CTA
- **Dashboard step:** Numbered instructions + deep link to PayPal Developer Dashboard apps page (`https://developer.paypal.com/dashboard/applications/`)
- **Credentials step:** Client ID + Client Secret fields with inline validation, show/hide toggle, and environment switcher
- **Success step:** Confirmation with "Create Your First Button" CTA

**Credential entry improvements:**
- Auto-trim whitespace on paste (common copy-paste issue)
- Client ID format validation (warns if too short or doesn't start with "A")
- Show/hide toggle for Client Secret field
- Environment defaults to Production (not Sandbox)
- Sandbox toggle is a subtle link at bottom of credentials step, not a prominent dropdown

**Error handling within wizard:**
- Invalid credentials: stays on credentials step with inline error
- 403 (Payment Links not enabled): specific guidance message
- Network error: retry-friendly messaging

### `editor.scss` (supersedes WOOPTP-151)

- Step indicator (numbered circles with connecting lines)
- Wizard step layouts (welcome, dashboard, credentials, success)
- Success icon (green checkmark circle)
- Field warning styles (yellow for soft validation vs red for hard errors)
- Environment toggle link styling

## Test Plan

- [ ] Full wizard flow: Welcome → Dashboard → Credentials → Success → Create Button
- [ ] Pasted credentials with whitespace are auto-trimmed
- [ ] Client ID format warning shows for invalid-looking IDs
- [ ] Show/hide toggle works on Client Secret field
- [ ] Invalid credentials show inline error on credentials step
- [ ] Back navigation works at each step
- [ ] "Open PayPal Dashboard" opens correct URL in new tab
- [ ] Environment defaults to Production
- [ ] Sandbox toggle link switches environment and shows warning banner
- [ ] Success step transitions to button creation form
- [ ] Keyboard navigation through wizard steps works
- [ ] Screen reader announces step changes

## Screenshots

N/A — block editor UI changes, best tested in WordPress Playground or local dev.
