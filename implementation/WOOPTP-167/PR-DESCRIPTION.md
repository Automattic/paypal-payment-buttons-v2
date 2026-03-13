# WOOPTP-167: Standalone Script Stubs for Playground/Standalone Mode

## Summary

The PayPal Payment Buttons block was registered server-side (PHP) but never appeared in the block editor when running as a standalone plugin outside the Jetpack monorepo (e.g., WordPress Playground). The editor showed "Your site doesn't include support for the jetpack/paypal-payment-buttons block."

## Root Cause

The webpack build produces `editor.asset.php` which declares `jetpack-script-data` as a script dependency. This handle comes from the `@automattic/jetpack-script-data` package. Inside the full Jetpack plugin, the Assets package registers this handle. In standalone mode, nothing registers it.

WordPress silently refuses to enqueue any script whose dependency chain contains an unregistered handle. Since `jetpack-script-data` was unregistered, the entire `editor.js` bundle was never loaded, and the block was never registered client-side.

**Diagnosis method:** Created a debug mu-plugin via WordPress Playground blueprint that confirmed:
- Block was registered PHP-side (YES)
- All files existed on disk (YES)
- Script handle was registered (`jetpack-paypal-payment-buttons-editor-script`)
- But the JS never loaded because of the missing dependency

## Fix

Register an empty stub script for `jetpack-script-data` on `init` priority 1 in the standalone plugin's `class-paypal-payment-buttons.php`:

```php
public function register_standalone_script_stubs() {
    if ( ! wp_script_is( 'jetpack-script-data', 'registered' ) ) {
        wp_register_script( 'jetpack-script-data', false, array(), '1.0.0', false );
    }
}
```

The `wp_script_is` guard ensures this is a no-op when running inside the full Jetpack plugin where the real handle is already registered.

## Files Changed

| File | Change |
|------|--------|
| `class-paypal-payment-buttons.php` (plugin) | Add `register_standalone_script_stubs()` method and hook on `init` priority 1 |

## Testing

- Install standalone plugin in WordPress Playground
- Create a new post, insert the PayPal Payment Buttons block — editor UI loads
- Open a post with existing PayPal block — no "doesn't include support" error
- Block still works in full Jetpack plugin context (stub gated by `wp_script_is`)

## PR

- Jetpack fork: https://github.com/slash1andy/jetpack/pull/4 (OPEN)
