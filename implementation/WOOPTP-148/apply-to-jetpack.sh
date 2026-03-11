#!/bin/bash
#
# Apply WOOPTP-148 implementation files to the Jetpack monorepo.
#
# Usage:
#   ./apply-to-jetpack.sh /path/to/jetpack
#
# This copies the block editor UI and updated rendering files into
# the correct locations in the Jetpack monorepo. Run from the
# implementation/WOOPTP-148 directory.
#
# Prerequisites:
#   - WOOPTP-146 (OAuth) and WOOPTP-147 (API Client) already applied
#   - Jetpack monorepo checked out locally
#

set -euo pipefail

JETPACK_ROOT="${1:?Usage: $0 /path/to/jetpack}"
PACKAGE_DIR="$JETPACK_ROOT/projects/packages/paypal-payments/src/paypal-payment-buttons"
TEST_DIR="$JETPACK_ROOT/projects/packages/paypal-payments/tests"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Verify Jetpack monorepo structure exists.
if [ ! -d "$JETPACK_ROOT/projects/packages/paypal-payments" ]; then
	echo "Error: $JETPACK_ROOT does not appear to be a Jetpack monorepo."
	echo "Expected directory: projects/packages/paypal-payments"
	exit 1
fi

echo "Applying WOOPTP-148 files to: $JETPACK_ROOT"

# ─── Block editor component ───
echo "  → Copying edit.js (block editor component)"
cp "$SCRIPT_DIR/edit.js" "$PACKAGE_DIR/edit.js"

# ─── Block JSON (updated attributes) ───
echo "  → Copying block.json (updated attributes)"
cp "$SCRIPT_DIR/block.json" "$PACKAGE_DIR/block.json"

# ─── Editor styles ───
echo "  → Copying editor.scss (editor styles)"
cp "$SCRIPT_DIR/editor.scss" "$PACKAGE_DIR/editor.scss"

# ─── Frontend styles ───
echo "  → Copying style.css (frontend styles)"
cp "$SCRIPT_DIR/style.css" "$PACKAGE_DIR/style.css"

# ─── Updated render_block with API-managed support ───
echo "  → Copying class-paypal-payment-buttons.php (updated render_block)"
cp "$SCRIPT_DIR/class-paypal-payment-buttons.php.modified" \
   "$PACKAGE_DIR/class-paypal-payment-buttons.php"

# ─── Jest tests ───
echo "  → Copying edit.test.js (Jest tests)"
mkdir -p "$TEST_DIR/js"
cp "$SCRIPT_DIR/edit.test.js" "$TEST_DIR/js/edit.test.js"

echo ""
echo "Done! Files applied:"
echo "  - $PACKAGE_DIR/edit.js"
echo "  - $PACKAGE_DIR/block.json"
echo "  - $PACKAGE_DIR/editor.scss"
echo "  - $PACKAGE_DIR/style.css"
echo "  - $PACKAGE_DIR/class-paypal-payment-buttons.php"
echo "  - $TEST_DIR/js/edit.test.js"
echo ""
echo "Next steps:"
echo "  1. cd $JETPACK_ROOT"
echo "  2. pnpm install (if not done)"
echo "  3. pnpm jest projects/packages/paypal-payments/tests/js/edit.test.js"
echo "  4. pnpm build -- --scope=@automattic/jetpack-paypal-payments"
