#!/bin/bash
#
# WOOPTP-147: Apply PayPal API Client + Button CRUD changes to local Jetpack monorepo.
#
# Usage:
#   1. Set JETPACK_DIR to your local Jetpack monorepo checkout
#   2. Run: bash apply-to-jetpack.sh
#   3. Follow the git commands printed at the end
#

set -euo pipefail

# --- Configuration ---
JETPACK_DIR="${JETPACK_DIR:-$HOME/path/to/jetpack}"
SOURCE_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
COWORK_DIR="${COWORK_DIR:-/sessions/compassionate-modest-shannon/jetpack-monorepo}"

PACKAGE_SRC="projects/packages/paypal-payments/src/paypal-payment-buttons"
PACKAGE_TESTS="projects/packages/paypal-payments/tests/php"

echo "=== WOOPTP-147: PayPal API Client + Button CRUD ==="
echo ""
echo "Source (Cowork):  $COWORK_DIR"
echo "Target (Jetpack): $JETPACK_DIR"
echo ""

# --- Verify target exists ---
if [ ! -d "$JETPACK_DIR/$PACKAGE_SRC" ]; then
    echo "ERROR: Target directory not found: $JETPACK_DIR/$PACKAGE_SRC"
    echo "Set JETPACK_DIR to your Jetpack monorepo root."
    exit 1
fi

# --- New files ---
echo "Copying new files..."

echo "  → class-paypal-api-client.php"
cp "$COWORK_DIR/$PACKAGE_SRC/class-paypal-api-client.php" \
   "$JETPACK_DIR/$PACKAGE_SRC/class-paypal-api-client.php"

echo "  → PayPal_API_Client_Test.php"
cp "$COWORK_DIR/$PACKAGE_TESTS/PayPal_API_Client_Test.php" \
   "$JETPACK_DIR/$PACKAGE_TESTS/PayPal_API_Client_Test.php"

# --- Modified files ---
echo ""
echo "Copying modified files..."

echo "  → class-paypal-rest-controller.php (added button CRUD routes + handlers)"
cp "$COWORK_DIR/$PACKAGE_SRC/class-paypal-rest-controller.php" \
   "$JETPACK_DIR/$PACKAGE_SRC/class-paypal-rest-controller.php"

# --- Done ---
echo ""
echo "=== Files applied successfully ==="
echo ""
echo "Now run these git commands in $JETPACK_DIR:"
echo ""
echo "  cd $JETPACK_DIR"
echo "  git checkout -b add/wooptp-147-paypal-api-client"
echo "  git add $PACKAGE_SRC/class-paypal-api-client.php"
echo "  git add $PACKAGE_TESTS/PayPal_API_Client_Test.php"
echo "  git add $PACKAGE_SRC/class-paypal-rest-controller.php"
echo "  git commit -m 'feat(paypal-payments): Add PayPal API client and button CRUD REST endpoints (WOOPTP-147)'"
echo "  git push -u origin add/wooptp-147-paypal-api-client"
echo ""
echo "Then open a PR with the description from PR-DESCRIPTION.md."
