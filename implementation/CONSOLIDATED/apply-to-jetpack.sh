#!/usr/bin/env bash
#
# apply-to-jetpack.sh — Copy CONSOLIDATED files into the Jetpack monorepo fork.
#
# Usage:
#   ./apply-to-jetpack.sh [JETPACK_ROOT]
#
# Default JETPACK_ROOT: /Users/andrewwikel/Local Sites/jetpack
#
# This script copies all canonical files from CONSOLIDATED into their target
# paths in the Jetpack monorepo. It does NOT commit — review the diff first.
#
# Target: projects/packages/paypal-payments/src/paypal-payment-buttons/
#
set -euo pipefail

JETPACK_ROOT="${1:-/Users/andrewwikel/Local Sites/jetpack}"
CONSOLIDATED="$(cd "$(dirname "$0")" && pwd)"

# Validate paths.
if [ ! -d "$JETPACK_ROOT/projects/packages/paypal-payments" ]; then
	echo "ERROR: Jetpack monorepo not found at $JETPACK_ROOT"
	echo "Usage: $0 /path/to/jetpack"
	exit 1
fi

BLOCK_SRC="$JETPACK_ROOT/projects/packages/paypal-payments/src/paypal-payment-buttons"
TESTS_PHP="$JETPACK_ROOT/projects/packages/paypal-payments/tests/php"
TESTS_JS="$JETPACK_ROOT/projects/packages/paypal-payments/tests/js/paypal-payment-buttons-block-tests"
TESTS_E2E="$JETPACK_ROOT/projects/packages/paypal-payments/tests/e2e"
DOCS_DIR="$JETPACK_ROOT/projects/packages/paypal-payments/docs"

echo "=== Applying CONSOLIDATED to Jetpack monorepo ==="
echo "Source: $CONSOLIDATED"
echo "Target: $JETPACK_ROOT"
echo ""

# ---------------------------------------------------------------
# PHP source files → src/paypal-payment-buttons/
# ---------------------------------------------------------------
echo "--- PHP source files ---"
for f in class-paypal-oauth.php class-paypal-rest-controller.php class-paypal-api-client.php class-paypal-attribute-mapper.php class-paypal-payment-buttons.php; do
	cp -v "$CONSOLIDATED/php/$f" "$BLOCK_SRC/$f"
done

# ---------------------------------------------------------------
# JS source files → src/paypal-payment-buttons/
# ---------------------------------------------------------------
echo ""
echo "--- JS source files ---"
for f in edit.js save.js deprecated.js index.js paypal-button-preview.js validation.js; do
	cp -v "$CONSOLIDATED/js/$f" "$BLOCK_SRC/$f"
done

# webpack config goes to the package root.
cp -v "$CONSOLIDATED/js/webpack.config.blocks.js" "$JETPACK_ROOT/projects/packages/paypal-payments/webpack.config.blocks.js"

# ---------------------------------------------------------------
# SCSS → src/paypal-payment-buttons/
# ---------------------------------------------------------------
echo ""
echo "--- SCSS files ---"
for f in editor.scss style.scss; do
	cp -v "$CONSOLIDATED/scss/$f" "$BLOCK_SRC/$f"
done

# ---------------------------------------------------------------
# Block manifests → src/paypal-payment-buttons/
# ---------------------------------------------------------------
echo ""
echo "--- Block manifests ---"
cp -v "$CONSOLIDATED/block/block.json" "$BLOCK_SRC/block.json"
cp -v "$CONSOLIDATED/block/block-v2.json" "$BLOCK_SRC/block-v2.json"

# ---------------------------------------------------------------
# PHP tests → tests/php/
# ---------------------------------------------------------------
echo ""
echo "--- PHP tests ---"
mkdir -p "$TESTS_PHP"
for f in PayPal_OAuth_Test.php PayPal_API_Client_Test.php PayPal_Attribute_Mapper_Test.php PayPal_REST_Controller_Test.php PayPal_API_Client_Retry_Test.php; do
	cp -v "$CONSOLIDATED/tests/php/$f" "$TESTS_PHP/$f"
done

# ---------------------------------------------------------------
# JS tests → tests/js/paypal-payment-buttons-block-tests/
# ---------------------------------------------------------------
echo ""
echo "--- JS tests ---"
mkdir -p "$TESTS_JS"
for f in validation.test.js paypal-button-preview.test.js save.test.js deprecated.test.js edit.test.js api-fetch-mock.js; do
	cp -v "$CONSOLIDATED/tests/js/$f" "$TESTS_JS/$f"
done

# ---------------------------------------------------------------
# E2E tests → tests/e2e/
# ---------------------------------------------------------------
echo ""
echo "--- E2E tests ---"
mkdir -p "$TESTS_E2E"
for f in paypal-payment-buttons.spec.js paypal-api-mock.js playwright.config.js; do
	cp -v "$CONSOLIDATED/tests/e2e/$f" "$TESTS_E2E/$f"
done

# ---------------------------------------------------------------
# Docs → docs/
# ---------------------------------------------------------------
echo ""
echo "--- Docs ---"
mkdir -p "$DOCS_DIR"
for f in readme.txt rest-api-reference.md troubleshooting-guide.md test_plan.md; do
	cp -v "$CONSOLIDATED/docs/$f" "$DOCS_DIR/$f"
done

# ---------------------------------------------------------------
# Summary
# ---------------------------------------------------------------
echo ""
echo "=== Done ==="
echo ""
echo "Files applied. Review the diff before committing:"
echo "  cd $JETPACK_ROOT"
echo "  git diff --stat"
echo "  git diff"
echo ""
echo "NOTE: register-jetpack-block.js change (WOOPTP-166) was already"
echo "merged via fork PR #2 — not included in this script."
