# WOOPTP-152: Backward Compatibility with Existing Paste-Code Blocks

## Summary

Ensures existing PayPal Payment Buttons blocks created with the v0.4.0-alpha paste-code workflow continue to render correctly after the V2 upgrade. Adds a `deprecated.js` for WordPress block validation, updates `save.js` to keep legacy markup identical, and creates `index.js` to wire deprecation handlers into block registration.

## Changes

### New Files

1. **`deprecated.js`** — WordPress block deprecation handler
   - Defines `v040Alpha` deprecation entry matching original paste-code save markup
   - `isEligible()` detects legacy blocks (has `scriptSrc`/`hostedButtonId`, no `isApiManaged`)
   - `migrate()` adds `isApiManaged: false` to old attributes
   - `save()` reproduces exact v0.4.0-alpha HTML output for block validation matching
   - Exported as array (newest-first order per WordPress convention)

2. **`index.js`** — Block registration entry point
   - Wires together `edit`, `save`, and `deprecated` into `registerBlockType()`
   - Referenced by `block-v2.json` via `editorScript`

### Modified Files

3. **`save.js`** — Updated legacy rendering path
   - **Removed `--legacy` class** from paste-code block output to match original v0.4.0-alpha markup exactly
   - Without this, WordPress block validation would fail on every existing paste-code block
   - API-managed V2 blocks unchanged

4. **`block-v2.json`** — Updated to v0.8.0
   - Added `editorScript`, `editorStyle`, `style` asset references
   - Version bumped from `0.2.0` to `0.8.0`

## How It Works

```
User opens post with v0.4.0-alpha block
    │
    ▼
WordPress runs current save() with stored attributes
    │
    ▼
Output doesn't match stored HTML?
    │                          │
    Yes                        No → All good
    │
    ▼
Try deprecated[0].save() (v040Alpha)
    │
    ▼
Output matches stored HTML → Run migrate()
    │
    ▼
Block loads with isApiManaged: false
    │
    ▼
edit.js shows read-only legacy indicator
save.js renders identical legacy markup
```

## Backward Compatibility Matrix

| Block Version | Editor Behavior | Frontend Behavior |
|---------------|----------------|-------------------|
| v0.3.x paste-code | Read-only legacy indicator | Original script-based embed |
| v0.4.0-alpha paste-code | Read-only legacy indicator | Original script-based embed |
| v0.8.0 API-managed | Full edit/preview UI | Styled PayPal buttons with payment link |
| New block (connected) | API-driven creation form | Styled PayPal buttons with payment link |
| New block (not connected) | Connection prompt | N/A (not saved until connected) |

## Checklist

- [x] Existing blocks with `scriptSrc`, `hostedButtonId`, `buttonText` render unchanged
- [x] Block attribute schema supports both old and new attribute sets
- [x] No auto-migration of existing blocks (they keep working as-is)
- [x] New blocks default to API-driven flow when PayPal OAuth is connected
- [x] If PayPal is NOT connected, gracefully fall back or prompt connection
- [x] `deprecated.js` handles v0.4.0-alpha → v0.8.0 block validation

Refs: WOOPTP-152
