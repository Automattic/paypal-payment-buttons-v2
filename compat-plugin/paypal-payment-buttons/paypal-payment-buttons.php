<?php
/**
 * Plugin Name: PayPal Payment Buttons
 * Plugin URI: https://wordpress.org/plugins/paypal-payment-buttons
 * Description: Add PayPal payment buttons to your WordPress site with ease.
 * Version: 0.12.2
 * Author: Automattic
 * Author URI: https://jetpack.com/
 * License: GPLv2 or later
 * Text Domain: paypal-payment-buttons
 */
if ( ! defined( 'ABSPATH' ) ) { exit( 0 ); }
define( 'PAYPAL_PAYMENT_BUTTONS_DIR', plugin_dir_path( __FILE__ ) );
define( 'PAYPAL_PAYMENT_BUTTONS_ROOT_FILE', __FILE__ );
spl_autoload_register( function ( $class ) {
	$prefix = 'Automattic\\Jetpack\\PaypalPayments\\';
	if ( strncmp( $prefix, $class, strlen( $prefix ) ) !== 0 ) { return; }
	$relative = substr( $class, strlen( $prefix ) );
	$file = __DIR__ . '/src/paypal-payment-buttons/class-' . strtolower( str_replace( '_', '-', $relative ) ) . '.php';
	if ( file_exists( $file ) ) { require_once $file; }
} );
if ( ! class_exists( 'Automattic\\Jetpack\\Assets' ) ) {
	require_once __DIR__ . '/src/paypal-payment-buttons/class-assets-stub.php';
	class_alias( 'Automattic\\Jetpack\\PaypalPayments\\Assets_Stub', 'Automattic\\Jetpack\\Assets' );
}
if ( ! class_exists( 'Automattic\\Jetpack\\Blocks' ) ) {
	require_once __DIR__ . '/src/paypal-payment-buttons/class-blocks-stub.php';
	class_alias( 'Automattic\\Jetpack\\PaypalPayments\\Blocks_Stub', 'Automattic\\Jetpack\\Blocks' );
}
require_once __DIR__ . '/src/class-paypal-payment-buttons.php';
PayPal_Payment_Buttons::init();
