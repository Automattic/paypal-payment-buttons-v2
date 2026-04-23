<?php
/**
 * PayPal Payment Button shortcode.
 *
 * Registers [paypal_button] for embedding PayPal payment buttons
 * outside the block editor (Classic Editor, text widgets, page builders).
 *
 * @package automattic/jetpack-paypal-payments
 * @since 0.13.0
 */

namespace Automattic\Jetpack\PaypalPayments;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class PayPal_Shortcode
 *
 * Handles the [paypal_button] shortcode registration and rendering.
 */
class PayPal_Shortcode {

	/**
	 * Shortcode tag.
	 *
	 * @var string
	 */
	const TAG = 'paypal_button';

	/**
	 * Transient cache TTL in seconds.
	 *
	 * @var int
	 */
	const CACHE_TTL = 300; // 5 minutes.

	/**
	 * Register the shortcode.
	 */
	public static function init() {
		add_shortcode( self::TAG, array( __CLASS__, 'render' ) );
	}

	/**
	 * Render the [paypal_button] shortcode.
	 *
	 * Usage: [paypal_button id="PLB-XXXXXXXXXXXX"]
	 *
	 * @param array|string $atts Shortcode attributes.
	 * @return string Rendered HTML or empty string on failure.
	 */
	public static function render( $atts ) {
		$atts = shortcode_atts(
			array(
				'id' => '',
			),
			$atts,
			self::TAG
		);

		$resource_id = sanitize_text_field( $atts['id'] );

		if ( empty( $resource_id ) || ! PayPal_Attribute_Mapper::is_valid_resource_id( $resource_id ) ) {
			return '';
		}

		if ( ! PayPal_OAuth::has_credentials() ) {
			return '';
		}

		// Fetch the resource with caching.
		$resource = self::get_cached_resource( $resource_id );
		if ( null === $resource ) {
			return '';
		}

		$attributes = PayPal_Attribute_Mapper::api_response_to_attributes( $resource );

		// Enqueue frontend styles for non-block context.
		PayPal_Payment_Buttons::enqueue_frontend_styles();

		return PayPal_Payment_Buttons::render_button( $attributes );
	}

	/**
	 * Fetch a PayPal resource with transient + object caching.
	 *
	 * Uses a 5-minute transient to avoid hitting PayPal's API on every page load,
	 * plus wp_cache for same-request deduplication when the same shortcode
	 * appears multiple times on a page.
	 *
	 * @param string $resource_id The PayPal resource ID (PLB-...).
	 * @return array|null The resource data, or null on failure.
	 */
	private static function get_cached_resource( $resource_id ) {
		$cache_key = 'paypal_sc_' . sanitize_key( $resource_id );

		// Check object cache first (same-request dedup).
		$resource = wp_cache_get( $cache_key, 'paypal_shortcode' );
		if ( false !== $resource ) {
			return $resource;
		}

		// Check transient (cross-request cache).
		$transient_key = 'paypal_btn_' . sanitize_key( $resource_id );
		$resource      = get_transient( $transient_key );

		if ( false === $resource ) {
			$resource = PayPal_API_Client::get_resource( $resource_id );
			if ( is_wp_error( $resource ) ) {
				return null;
			}
			set_transient( $transient_key, $resource, self::CACHE_TTL );
		}

		wp_cache_set( $cache_key, $resource, 'paypal_shortcode' );

		return $resource;
	}
}
