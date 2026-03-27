#!/usr/bin/env bash
#
# playground-release.sh — Build, zip, and release a playground-ready plugin.
#
# Syncs compiled dist artifacts from the Jetpack monorepo into the
# compat-plugin, creates a zip, tags, creates a GitHub release, and
# updates the playground blueprint URL.
#
# Usage:
#   ./scripts/playground-release.sh <version>
#
# Example:
#   ./scripts/playground-release.sh 0.10.0
#
# Prerequisites:
#   - Jetpack monorepo built (pnpm run -C projects/packages/paypal-payments build-production)
#   - gh CLI authenticated with access to Automattic/paypal-payment-buttons-v2
#   - Node 22+ for Jetpack build (use nvm use 22.19.0)
#
set -euo pipefail

VERSION="${1:?Usage: $0 <version>}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
JETPACK_ROOT="${JETPACK_ROOT:-/Users/andrewwikel/Local Sites/jetpack}"
JETPACK_DIST="$JETPACK_ROOT/projects/packages/paypal-payments/dist"
JETPACK_SRC="$JETPACK_ROOT/projects/packages/paypal-payments/src/paypal-payment-buttons"
COMPAT="$REPO_ROOT/compat-plugin/paypal-payment-buttons"
TAG="v${VERSION}-playground"

echo "=== PayPal Payment Buttons Playground Release v${VERSION} ==="
echo ""

# ---------------------------------------------------------------
# 1. Validate
# ---------------------------------------------------------------
if [ ! -d "$JETPACK_DIST/paypal-payment-buttons" ]; then
	echo "ERROR: Jetpack dist not found at $JETPACK_DIST"
	echo "Run: source ~/.nvm/nvm.sh && nvm use 22.19.0 && cd '$JETPACK_ROOT' && pnpm run -C projects/packages/paypal-payments build-production"
	exit 1
fi

if ! command -v gh &> /dev/null; then
	echo "ERROR: gh CLI not found. Install: https://cli.github.com/"
	exit 1
fi

# ---------------------------------------------------------------
# 2. Sync dist artifacts from Jetpack
# ---------------------------------------------------------------
echo "--- Syncing dist from Jetpack ---"
rm -rf "$COMPAT/dist/paypal-payment-buttons" "$COMPAT/dist/block" "$COMPAT/dist/images"
cp -r "$JETPACK_DIST/paypal-payment-buttons" "$COMPAT/dist/paypal-payment-buttons"
cp -r "$JETPACK_DIST/block" "$COMPAT/dist/block"
[ -d "$JETPACK_DIST/images" ] && cp -r "$JETPACK_DIST/images" "$COMPAT/dist/images"
cp "$JETPACK_DIST/legacy-simple-payments"* "$COMPAT/dist/" 2>/dev/null || true
echo "  dist synced ✓"

# ---------------------------------------------------------------
# 3. Sync PHP source + block.json from Jetpack
# ---------------------------------------------------------------
echo "--- Syncing PHP source ---"
for f in class-paypal-payment-buttons.php class-paypal-oauth.php class-paypal-api-client.php \
         class-paypal-attribute-mapper.php class-paypal-rest-controller.php class-paypal-admin-page.php \
         class-paypal-email-sender.php class-paypal-payment-links-list-table.php; do
	[ -f "$JETPACK_SRC/$f" ] && cp "$JETPACK_SRC/$f" "$COMPAT/src/paypal-payment-buttons/$f"
done
cp "$JETPACK_SRC/block.json" "$COMPAT/src/paypal-payment-buttons/block.json"
echo "  PHP source synced ✓"

# ---------------------------------------------------------------
# 4. Update plugin header version
# ---------------------------------------------------------------
echo "--- Updating plugin version to ${VERSION} ---"
sed -i '' "s/^ \* Version: .*/ * Version: ${VERSION}/" "$COMPAT/paypal-payment-buttons.php"
echo "  version updated ✓"

# ---------------------------------------------------------------
# 5. Create zip
# ---------------------------------------------------------------
echo "--- Creating zip ---"
ZIP_PATH="$REPO_ROOT/paypal-payment-buttons-v${VERSION}.zip"
cd "$REPO_ROOT/compat-plugin"
zip -r "$ZIP_PATH" paypal-payment-buttons/ -x '*.DS_Store' > /dev/null
echo "  created: $ZIP_PATH ($(du -h "$ZIP_PATH" | cut -f1))"

# ---------------------------------------------------------------
# 6. Update playground blueprint
# ---------------------------------------------------------------
echo "--- Updating playground blueprint ---"
sed -i '' "s|releases/download/v[0-9.]*-playground/|releases/download/${TAG}/|g" "$REPO_ROOT/playground-blueprint.json"
sed -i '' "s|Preview (v[0-9.]*)|Preview (v${VERSION})|g" "$REPO_ROOT/playground-blueprint.json"
echo "  blueprint updated ✓"

# ---------------------------------------------------------------
# 7. Commit compat-plugin + blueprint changes
# ---------------------------------------------------------------
echo "--- Committing ---"
cd "$REPO_ROOT"
git add compat-plugin/ playground-blueprint.json "paypal-payment-buttons-v${VERSION}.zip"
git commit -m "chore(playground): release v${VERSION}

Synced dist from Jetpack build, updated plugin header, and created
playground-ready zip for WordPress Playground demo.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
echo "  committed ✓"

# ---------------------------------------------------------------
# 8. Tag and push
# ---------------------------------------------------------------
echo "--- Pushing ---"
git push origin trunk
git tag "$TAG"
git push origin "$TAG"
echo "  pushed trunk + tag ${TAG} ✓"

# ---------------------------------------------------------------
# 9. Create GitHub release
# ---------------------------------------------------------------
echo "--- Creating GitHub release ---"
gh release create "$TAG" "$ZIP_PATH" \
	--repo Automattic/paypal-payment-buttons-v2 \
	--title "PayPal Payment Buttons v${VERSION} (Playground)" \
	--notes "Playground-ready release for [WordPress Playground](https://playground.wordpress.net/).

## What's new
- Theme-native checkout button (\`wp-element-button\`) — inherits active theme styles
- Default button text: \"Buy Now\"
- Removed PayPal-branded gold button and stacked layout
- \"Powered by PayPal\" attribution preserved

## Try it
[Open in WordPress Playground](https://playground.wordpress.net/?blueprint-url=https://raw.githubusercontent.com/Automattic/paypal-payment-buttons-v2/trunk/playground-blueprint.json)"
echo "  release created ✓"

# ---------------------------------------------------------------
# Done
# ---------------------------------------------------------------
echo ""
echo "=== Done ==="
echo "Release: https://github.com/Automattic/paypal-payment-buttons-v2/releases/tag/${TAG}"
echo "Playground: https://playground.wordpress.net/?blueprint-url=https://raw.githubusercontent.com/Automattic/paypal-payment-buttons-v2/trunk/playground-blueprint.json"
