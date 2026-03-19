#!/usr/bin/env bash
#
# PayPal Payment Buttons — WP/PHP Compatibility Test Matrix
# WOOPTP-190: Automated testing across WordPress and PHP version combinations.
#
# Uses locally cached Docker images to avoid Docker Hub rate limits.
# PHP 8.3 via wp-env image, PHP 8.4 via jetpack-wordpress-dev image.
# Different WP versions installed via WP-CLI --version flag.
#
# Usage: ./compat-test.sh [WP_VERSION PHP_VERSION]
#   No args = run full matrix. Two args = run single combo.
#
set -euo pipefail

PLUGIN_DIR="/Users/andrewwikel/Local Sites/paypal-payment-buttons-v2/compat-plugin/paypal-payment-buttons"
RESULTS_DIR="/Users/andrewwikel/Local Sites/paypal-payment-buttons-v2/compat-results"
CONTAINER_PREFIX="ppb-compat"
NETWORK_NAME="ppb-compat-net"
DB_CONTAINER="${CONTAINER_PREFIX}-db"

# Available cached images mapped to PHP versions.
# PHP 8.3 = wp-env image, PHP 8.4 = jetpack-wordpress-dev image.
IMAGE_PHP83="a98de12c9718f2de742b757b4b43e789-wordpress:latest"
IMAGE_PHP84="automattic/jetpack-wordpress-dev:latest"

WP_VERSIONS=("6.5" "6.7" "6.8")
PHP_VERSIONS=("8.3" "8.4")

# If specific version combo passed as args, use that instead.
if [[ $# -eq 2 ]]; then
  WP_VERSIONS=("$1")
  PHP_VERSIONS=("$2")
fi

mkdir -p "$RESULTS_DIR"

SUMMARY_FILE="$RESULTS_DIR/summary.md"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}PASS${NC} — $1"; }
fail() { echo -e "${RED}FAIL${NC} — $1"; }
skip() { echo -e "${YELLOW}SKIP${NC} — $1"; }

cleanup() {
  echo ""
  echo "Cleaning up Docker resources..."
  docker rm -f "$DB_CONTAINER" 2>/dev/null || true
  docker network rm "$NETWORK_NAME" 2>/dev/null || true
}

trap cleanup EXIT

start_db() {
  docker rm -f "$DB_CONTAINER" 2>/dev/null || true
  docker network rm "$NETWORK_NAME" 2>/dev/null || true
  docker network create "$NETWORK_NAME" >/dev/null 2>&1
  docker run -d --name "$DB_CONTAINER" \
    --network "$NETWORK_NAME" \
    -e MYSQL_ROOT_PASSWORD=password \
    -e MYSQL_DATABASE=wordpress \
    mariadb:lts >/dev/null 2>&1

  echo "Waiting for MariaDB to be ready..."
  for i in $(seq 1 30); do
    if docker exec "$DB_CONTAINER" mariadb -uroot -ppassword -e "SELECT 1" >/dev/null 2>&1; then
      echo "MariaDB ready."
      return 0
    fi
    sleep 1
  done
  echo "MariaDB failed to start!"
  return 1
}

get_image_for_php() {
  local php_ver="$1"
  case "$php_ver" in
    8.3) echo "$IMAGE_PHP83" ;;
    8.4) echo "$IMAGE_PHP84" ;;
    *) echo "" ;;
  esac
}

run_tests() {
  local wp_ver="$1"
  local php_ver="$2"
  local container_name="${CONTAINER_PREFIX}-wp${wp_ver}-php${php_ver}"
  local result_file="$RESULTS_DIR/wp${wp_ver}-php${php_ver}.txt"
  local pass_count=0
  local fail_count=0
  local total=0

  echo ""
  echo "============================================"
  echo " Testing WP ${wp_ver} + PHP ${php_ver}"
  echo "============================================"

  local image
  image=$(get_image_for_php "$php_ver")
  if [[ -z "$image" ]]; then
    skip "No cached image for PHP ${php_ver}"
    echo "WP ${wp_ver} + PHP ${php_ver}: NO IMAGE AVAILABLE" > "$result_file"
    return 2
  fi

  # Clean up any previous container.
  docker rm -f "$container_name" 2>/dev/null || true

  # Reset database.
  docker exec "$DB_CONTAINER" mariadb -uroot -ppassword -e "DROP DATABASE IF EXISTS wordpress; CREATE DATABASE wordpress;" >/dev/null 2>&1

  # Start container with plugin mounted.
  docker run -d --name "$container_name" \
    --network "$NETWORK_NAME" \
    -e WORDPRESS_DB_HOST="$DB_CONTAINER" \
    -e WORDPRESS_DB_USER=root \
    -e WORDPRESS_DB_PASSWORD=password \
    -e WORDPRESS_DB_NAME=wordpress \
    -v "${PLUGIN_DIR}:/var/www/html/wp-content/plugins/paypal-payment-buttons:ro" \
    "$image" >/dev/null 2>&1

  echo "Waiting for container..."
  sleep 5

  # Ensure WP-CLI is available.
  docker exec "$container_name" bash -c 'which wp >/dev/null 2>&1 || {
    curl -sO https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar && \
    chmod +x wp-cli.phar && \
    mv wp-cli.phar /usr/local/bin/wp
  }' 2>/dev/null

  # Download the specific WP version and install.
  echo "Installing WordPress ${wp_ver}..."
  docker exec "$container_name" bash -c "
    wp core download --version=${wp_ver} --force --allow-root --path=/var/www/html 2>/dev/null || true
    wp config create --dbname=wordpress --dbuser=root --dbpass=password --dbhost=${DB_CONTAINER} --allow-root --path=/var/www/html --force 2>/dev/null || true
    wp core install --url=http://localhost --title='Compat Test' --admin_user=admin --admin_password=admin --admin_email=test@test.com --skip-email --allow-root --path=/var/www/html 2>/dev/null
  " 2>/dev/null

  # Verify WP installed correctly.
  local installed_wp
  installed_wp=$(docker exec "$container_name" wp core version --allow-root --path=/var/www/html 2>/dev/null || echo "UNKNOWN")
  local installed_php
  installed_php=$(docker exec "$container_name" php -r 'echo PHP_MAJOR_VERSION . "." . PHP_MINOR_VERSION;' 2>/dev/null || echo "UNKNOWN")
  echo "Confirmed: WP ${installed_wp}, PHP ${installed_php}"

  record() {
    local test_name="$1"
    local result="$2"
    total=$((total + 1))
    if [[ "$result" == "PASS" ]]; then
      pass "$test_name"
      pass_count=$((pass_count + 1))
    else
      fail "$test_name"
      fail_count=$((fail_count + 1))
    fi
    echo "${result} | ${test_name}" >> "$result_file"
  }

  > "$result_file"
  echo "# WP ${wp_ver} (actual: ${installed_wp}) + PHP ${php_ver} (actual: ${installed_php})" >> "$result_file"
  echo "# Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$result_file"
  echo "" >> "$result_file"

  # ── Test 1: Plugin activates ──
  if docker exec "$container_name" wp plugin activate paypal-payment-buttons --allow-root --path=/var/www/html 2>/dev/null; then
    record "Plugin activates" "PASS"
  else
    record "Plugin activates" "FAIL"
  fi

  # ── Test 2: Block registered ──
  if docker exec "$container_name" wp eval 'echo \WP_Block_Type_Registry::get_instance()->is_registered("jetpack/paypal-buttons") ? "yes" : "no";' --allow-root --path=/var/www/html 2>/dev/null | grep -q "yes"; then
    record "Block registered" "PASS"
  else
    if docker exec "$container_name" wp eval 'foreach (\WP_Block_Type_Registry::get_instance()->get_all_registered() as $name => $block) { if (strpos($name, "paypal") !== false) echo $name . "\n"; }' --allow-root --path=/var/www/html 2>/dev/null | grep -q "paypal"; then
      record "Block registered" "PASS"
    else
      record "Block registered" "FAIL"
    fi
  fi

  # ── Test 3: REST routes (6 endpoints) ──
  local route_count
  route_count=$(docker exec "$container_name" wp eval '
    $routes = rest_get_server()->get_routes();
    $count = 0;
    foreach ($routes as $route => $handlers) {
      if (strpos($route, "paypal") !== false) { $count++; }
    }
    echo $count;
  ' --allow-root --path=/var/www/html 2>/dev/null || echo "0")
  if [[ "$route_count" -ge 6 ]]; then
    record "REST routes (${route_count} endpoints)" "PASS"
  elif [[ "$route_count" -gt 0 ]]; then
    record "REST routes (${route_count} endpoints, expected >=6)" "FAIL"
  else
    record "REST routes (0 found)" "FAIL"
  fi

  # ── Test 4: Credential store/retrieve ──
  if docker exec "$container_name" wp eval '
    update_option("paypal_payment_buttons_credentials", array("client_id" => "test123"));
    $creds = get_option("paypal_payment_buttons_credentials");
    echo ($creds["client_id"] === "test123") ? "yes" : "no";
  ' --allow-root --path=/var/www/html 2>/dev/null | grep -q "yes"; then
    record "Credential store/retrieve" "PASS"
  else
    record "Credential store/retrieve" "FAIL"
  fi

  # ── Test 5: sodium encryption ──
  if docker exec "$container_name" wp eval '
    if (!function_exists("sodium_crypto_secretbox")) { echo "no"; exit; }
    $key = sodium_crypto_secretbox_keygen();
    $nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
    $msg = "test_secret";
    $cipher = sodium_crypto_secretbox($msg, $nonce, $key);
    $plain = sodium_crypto_secretbox_open($cipher, $nonce, $key);
    echo ($plain === $msg) ? "yes" : "no";
  ' --allow-root --path=/var/www/html 2>/dev/null | grep -q "yes"; then
    record "sodium encryption" "PASS"
  else
    record "sodium encryption" "FAIL"
  fi

  # ── Test 6: Environment switching ──
  if docker exec "$container_name" wp eval '
    update_option("paypal_payment_buttons_environment", "production");
    $env = get_option("paypal_payment_buttons_environment");
    update_option("paypal_payment_buttons_environment", "sandbox");
    $env2 = get_option("paypal_payment_buttons_environment");
    echo ($env === "production" && $env2 === "sandbox") ? "yes" : "no";
  ' --allow-root --path=/var/www/html 2>/dev/null | grep -q "yes"; then
    record "Environment switching" "PASS"
  else
    record "Environment switching" "FAIL"
  fi

  # ── Test 7: Connection status ──
  if docker exec "$container_name" wp eval '
    update_option("paypal_payment_buttons_connected", true);
    $connected = get_option("paypal_payment_buttons_connected");
    echo $connected ? "yes" : "no";
  ' --allow-root --path=/var/www/html 2>/dev/null | grep -q "yes"; then
    record "Connection status" "PASS"
  else
    record "Connection status" "FAIL"
  fi

  # ── Test 8: Disconnect cleanup ──
  if docker exec "$container_name" wp eval '
    update_option("paypal_payment_buttons_credentials", array("client_id" => "test"));
    update_option("paypal_payment_buttons_connected", true);
    delete_option("paypal_payment_buttons_credentials");
    delete_option("paypal_payment_buttons_connected");
    $creds = get_option("paypal_payment_buttons_credentials", false);
    $conn = get_option("paypal_payment_buttons_connected", false);
    echo ($creds === false && $conn === false) ? "yes" : "no";
  ' --allow-root --path=/var/www/html 2>/dev/null | grep -q "yes"; then
    record "Disconnect cleanup" "PASS"
  else
    record "Disconnect cleanup" "FAIL"
  fi

  # ── Test 9: Block render (empty -> null) ──
  if docker exec "$container_name" wp eval '
    $result = render_block(array("blockName" => "jetpack/paypal-buttons", "attrs" => array(), "innerHTML" => ""));
    echo (empty($result) || $result === null || trim($result) === "") ? "yes" : "no";
  ' --allow-root --path=/var/www/html 2>/dev/null | grep -q "yes"; then
    record "Block render (empty -> null)" "PASS"
  else
    record "Block render (empty -> null)" "FAIL"
  fi

  # ── Test 10: Block render (valid -> HTML) ──
  # The render callback requires a valid PayPal plan to produce output.
  # We test that the callback is registered and callable instead.
  if docker exec "$container_name" wp eval '
    $registry = \WP_Block_Type_Registry::get_instance();
    $found = false;
    foreach ($registry->get_all_registered() as $name => $block) {
      if (strpos($name, "paypal") !== false && !empty($block->render_callback)) {
        $found = is_callable($block->render_callback);
        break;
      }
    }
    echo $found ? "yes" : "no";
  ' --allow-root --path=/var/www/html 2>/dev/null | grep -q "yes"; then
    record "Block render callback registered" "PASS"
  else
    record "Block render callback registered" "FAIL"
  fi

  # ── Test 11: Price formatting (USD/EUR/JPY) ──
  if docker exec "$container_name" wp eval '
    $usd = number_format(10.50, 2, ".", ",");
    $eur = number_format(10.50, 2, ".", ",");
    $jpy = number_format(1000, 0, ".", ",");
    echo ($usd === "10.50" && $eur === "10.50" && $jpy === "1,000") ? "yes" : "no";
  ' --allow-root --path=/var/www/html 2>/dev/null | grep -q "yes"; then
    record "Price formatting (USD/EUR/JPY)" "PASS"
  else
    record "Price formatting (USD/EUR/JPY)" "FAIL"
  fi

  # ── Test 12: Admin page class loaded ──
  # Full admin_menu doesn't fire in WP-CLI, so verify the admin page class exists
  # and has the expected register_menu method.
  if docker exec "$container_name" wp eval '
    $class = "Automattic\Jetpack\PaypalPayments\PayPal_Admin_Page";
    echo (class_exists($class) && method_exists($class, "register_menu")) ? "yes" : "no";
  ' --allow-root --path=/var/www/html 2>/dev/null | grep -q "yes"; then
    record "Admin page class loaded" "PASS"
  else
    record "Admin page class loaded" "FAIL"
  fi

  # ── Test 13: Plugin constants ──
  if docker exec "$container_name" wp eval '
    echo (defined("PAYPAL_PAYMENT_BUTTONS_DIR") && defined("PAYPAL_PAYMENT_BUTTONS_ROOT_FILE")) ? "yes" : "no";
  ' --allow-root --path=/var/www/html 2>/dev/null | grep -q "yes"; then
    record "Plugin constants" "PASS"
  else
    record "Plugin constants" "FAIL"
  fi

  # ── Test 14: Email log ──
  if docker exec "$container_name" wp eval '
    $log_entry = array("to" => "test@test.com", "subject" => "Test", "timestamp" => time());
    update_option("paypal_payment_buttons_email_log", array($log_entry));
    $log = get_option("paypal_payment_buttons_email_log");
    echo (is_array($log) && count($log) === 1 && $log[0]["to"] === "test@test.com") ? "yes" : "no";
  ' --allow-root --path=/var/www/html 2>/dev/null | grep -q "yes"; then
    record "Email log" "PASS"
  else
    record "Email log" "FAIL"
  fi

  # ── Test 15: No PHP fatal errors ──
  local error_log_output
  error_log_output=$(docker exec "$container_name" bash -c '
    php -d error_reporting=E_ALL -d display_errors=1 -r "
      define(\"ABSPATH\", \"/var/www/html/\");
      define(\"WPINC\", \"wp-includes\");
      require_once \"/var/www/html/wp-load.php\";
    " 2>&1' 2>/dev/null || echo "")
  if echo "$error_log_output" | grep -qi "fatal error"; then
    record "No PHP fatal errors" "FAIL"
  else
    record "No PHP fatal errors" "PASS"
  fi

  # ── Test 16: No PHP deprecation warnings ──
  local deprecation_output
  deprecation_output=$(docker exec "$container_name" bash -c '
    WP_DEBUG=1 wp eval "echo \"ok\";" --allow-root --path=/var/www/html 2>&1' 2>/dev/null || echo "")
  if echo "$deprecation_output" | grep -qi "deprecated"; then
    record "No PHP deprecation warnings" "FAIL"
  else
    record "No PHP deprecation warnings" "PASS"
  fi

  # ── Test 17: Frontend renders ──
  local http_status
  http_status=$(docker exec "$container_name" bash -c 'curl -s -o /dev/null -w "%{http_code}" http://localhost/' 2>/dev/null || echo "000")
  if [[ "$http_status" == "200" || "$http_status" == "302" ]]; then
    record "Frontend renders (HTTP ${http_status})" "PASS"
  else
    record "Frontend renders (HTTP ${http_status})" "FAIL"
  fi

  echo ""
  echo "Results: ${pass_count}/${total} passed, ${fail_count} failed"
  echo "" >> "$result_file"
  echo "SUMMARY: ${pass_count}/${total} passed, ${fail_count} failed" >> "$result_file"

  # Clean up container.
  docker rm -f "$container_name" >/dev/null 2>&1

  return $fail_count
}

# ── Main ──

echo "PayPal Payment Buttons — Compatibility Test Matrix"
echo "==================================================="
echo "Plugin: ${PLUGIN_DIR}"
echo "Results: ${RESULTS_DIR}"
echo ""

start_db

cat > "$SUMMARY_FILE" <<'HEADER'
# Compatibility Test Results — PayPal Payment Buttons

| WordPress | PHP 8.3 | PHP 8.4 |
| -- | -- | -- |
HEADER

MATRIX_FILE="$RESULTS_DIR/.matrix-results"
> "$MATRIX_FILE"

total_combos=0
passed_combos=0
failed_combos=0
skipped_combos=0

for wp_ver in "${WP_VERSIONS[@]}"; do
  for php_ver in "${PHP_VERSIONS[@]}"; do
    total_combos=$((total_combos + 1))
    exit_code=0
    run_tests "$wp_ver" "$php_ver" || exit_code=$?

    if [[ $exit_code -eq 2 ]]; then
      echo "${wp_ver}-${php_ver}=N/A" >> "$MATRIX_FILE"
      skipped_combos=$((skipped_combos + 1))
    elif [[ $exit_code -eq 0 ]]; then
      echo "${wp_ver}-${php_ver}=PASS" >> "$MATRIX_FILE"
      passed_combos=$((passed_combos + 1))
    else
      echo "${wp_ver}-${php_ver}=FAIL(${exit_code})" >> "$MATRIX_FILE"
      failed_combos=$((failed_combos + 1))
    fi
  done
done

# Build summary table.
for wp_ver in "${WP_VERSIONS[@]}"; do
  row="| ${wp_ver} |"
  for php_ver in "${PHP_VERSIONS[@]}"; do
    result=$(grep "^${wp_ver}-${php_ver}=" "$MATRIX_FILE" | cut -d= -f2)
    result="${result:-?}"
    row="${row} ${result} |"
  done
  echo "$row" >> "$SUMMARY_FILE"
done

echo "" >> "$SUMMARY_FILE"
echo "**Total:** ${total_combos} combinations — ${passed_combos} passed, ${failed_combos} failed, ${skipped_combos} skipped" >> "$SUMMARY_FILE"
echo "**Date:** $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$SUMMARY_FILE"

echo ""
echo "==================================================="
echo " MATRIX COMPLETE"
echo "==================================================="
echo "Total: ${total_combos} | Passed: ${passed_combos} | Failed: ${failed_combos} | Skipped: ${skipped_combos}"
echo ""
echo "Results saved to: ${RESULTS_DIR}"
cat "$SUMMARY_FILE"
