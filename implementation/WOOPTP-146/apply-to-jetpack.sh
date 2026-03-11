#!/bin/bash
#
# Apply WOOPTP-146 files to your local Jetpack monorepo checkout.
#
# Usage:
#   cd /path/to/your/jetpack-monorepo
#   bash /path/to/apply-to-jetpack.sh
#
# Then:
#   git checkout -b feature/paypal-oauth-connection trunk
#   git add -A
#   git commit -m "feat(paypal): implement PayPal OAuth 2.0 connection flow
#
# Implements client credentials auth for PayPal Pay Links & Buttons API.
# Adds credential storage, token caching, REST endpoints for connection
# management, and 20 unit tests.
#
# Refs: WOOPTP-146"
#   git push -u origin feature/paypal-oauth-connection

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ ! -d "projects/packages/paypal-payments" ]; then
    echo "ERROR: Run this script from the root of your Jetpack monorepo."
    exit 1
fi

echo "==> Copying new files..."
cp "$SCRIPT_DIR/class-paypal-oauth.php" \
    projects/packages/paypal-payments/src/paypal-payment-buttons/class-paypal-oauth.php

cp "$SCRIPT_DIR/class-paypal-rest-controller.php" \
    projects/packages/paypal-payments/src/paypal-payment-buttons/class-paypal-rest-controller.php

cp "$SCRIPT_DIR/PayPal_OAuth_Test.php" \
    projects/packages/paypal-payments/tests/php/PayPal_OAuth_Test.php

echo "==> Copying modified files..."
cp "$SCRIPT_DIR/class-paypal-payment-buttons.php.modified" \
    projects/packages/paypal-payments/src/paypal-payment-buttons/class-paypal-payment-buttons.php

cp "$SCRIPT_DIR/plugin-class-paypal-payment-buttons.php.modified" \
    projects/plugins/paypal-payment-buttons/src/class-paypal-payment-buttons.php

echo ""
echo "Done! Files applied. Next steps:"
echo "  1. git checkout -b feature/paypal-oauth-connection trunk"
echo "  2. git add -A && git diff --cached --stat"
echo "  3. git commit  (use the message from PR-DESCRIPTION.md)"
echo "  4. git push -u origin feature/paypal-oauth-connection"
echo "  5. Open PR on GitHub"
