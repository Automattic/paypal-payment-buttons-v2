# WordPress.org Plugin Page — Note

> **Target URL:** https://wordpress.org/plugins/paypal-payment-buttons/
> **Owner:** Plugin release process
> **Action:** No manual edit needed — this page is driven by the `readme.txt` in the plugin repository

## Status

The WordPress.org plugin page is automatically generated from the plugin's `readme.txt` file when a new version is submitted to the plugin directory.

The updated `readme.txt` for v0.8.0 is already written and reviewed:
- **Source:** `implementation/WOOPTP-155/readme.txt`
- **Also in consolidated:** `implementation/CONSOLIDATED/docs/readme.txt`
- **Council review:** P1 + P2 corrections applied

When the v0.8.0 release is pushed to WordPress.org via SVN, the plugin page will update automatically with:
- New description (API-driven workflow)
- Updated installation instructions (Client ID/Secret, wizard flow)
- Updated FAQ (production default, sandbox opt-in, legacy backward compatibility)
- Full v0.8.0 changelog
- Updated requirements (WordPress 6.8+, PHP 7.4+)

## Action Required

None — this updates automatically at release time. Confirm that the `readme.txt` in the SVN submission matches `WOOPTP-155/readme.txt`.
