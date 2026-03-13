# WOOPTP-166: Fix PayPal SVG Block Icon

## Summary

The PayPal block displayed a generic block icon instead of the PayPal SVG logo in the editor inserter and toolbar.

## Root Cause

`registerJetpackBlockFromMetadata` in `register-jetpack-block.js` unconditionally overwrites `settings.icon` with `getBlockIconProp(metadata)`. The `block.json` declares `"icon": "paypal"` which is not a valid WordPress dashicon — `getBlockIconProp` parses it but returns nothing useful. Meanwhile, the SVG component from `icon.js` was passed via `settings.icon` but was always overwritten.

## Fix

Changed `register-jetpack-block.js` line 93:

```js
// Before
icon: getBlockIconProp( metadata ),

// After
icon: settings.icon || getBlockIconProp( metadata ),
```

This lets the SVG component from `settings.icon` take precedence, falling back to `getBlockIconProp(metadata)` for blocks that don't provide their own icon.

## Files Changed

| File | Change |
|------|--------|
| `register-jetpack-block.js` | Prefer `settings.icon` over metadata icon |

## Testing

- PayPal SVG logo (blue PP) displays in block inserter
- PayPal SVG logo displays in block toolbar
- Blocks with standard dashicons continue to work correctly

## PR

- Jetpack fork: https://github.com/slash1andy/jetpack/pull/2 (MERGED)
