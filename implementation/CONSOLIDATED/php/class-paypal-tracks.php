<?php
/**
 * PayPal Payment Buttons — Tracks analytics helper.
 *
 * Thin wrapper over Automattic\Jetpack\Tracking for server-side events,
 * plus a helper that emits an inline client-side push for frontend renders
 * where there is typically no authenticated user.
 *
 * Gracefully no-ops when Jetpack Tracking is unavailable (standalone mode).
 * All events use the `paypal_` prefix and must carry non-PII properties only.
 *
 * @package automattic/jetpack-paypal-payments
 * @since 0.13.0
 */

namespace Automattic\Jetpack\PaypalPayments;

/**
 * Class PayPal_Tracks
 */
class PayPal_Tracks {
	/**
	 * Shared Tracking instance.
	 *
	 * @var \Automattic\Jetpack\Tracking|null
	 */
	private static $tracking = null;

	/**
	 * Whether server-side Jetpack Tracking is available in this install.
	 *
	 * @return bool
	 */
	public static function is_available() {
		return class_exists( '\Automattic\Jetpack\Tracking' );
	}

	/**
	 * Get (or lazily build) the shared Tracking instance.
	 *
	 * @return \Automattic\Jetpack\Tracking|null
	 */
	private static function get_tracking() {
		if ( ! self::is_available() ) {
			return null;
		}
		if ( null === self::$tracking ) {
			self::$tracking = new \Automattic\Jetpack\Tracking( 'jetpack-paypal-payments' );
		}
		return self::$tracking;
	}

	/**
	 * Record a server-side Tracks event.
	 *
	 * Safe no-op when Jetpack Tracking is unavailable.
	 * Uses the currently logged-in user's context.
	 *
	 * @param string $event_name Event name (must be prefixed with `paypal_`).
	 * @param array  $properties Optional non-PII properties.
	 */
	public static function record_event( $event_name, $properties = array() ) {
		if ( empty( $event_name ) ) {
			return;
		}
		$tracking = self::get_tracking();
		if ( ! $tracking ) {
			return;
		}
		$tracking->record_user_event( $event_name, (array) $properties );
	}

	/**
	 * Build an inline <script> tag that pushes a single event to
	 * Jetpack Tracks on the frontend. Intended for render-time events
	 * where the viewer is typically unauthenticated (and therefore
	 * record_user_event would drop the event).
	 *
	 * Returns an empty string when Jetpack Tracking is unavailable so
	 * no-op standalone mode does not emit dead script tags.
	 *
	 * @param string $event_name Event name.
	 * @param array  $properties Optional non-PII properties.
	 * @return string HTML <script> tag, or empty string when unavailable.
	 */
	public static function get_inline_event_script( $event_name, $properties = array() ) {
		if ( empty( $event_name ) || ! self::is_available() ) {
			return '';
		}

		$payload = wp_json_encode(
			array( 'recordEvent', (string) $event_name, (object) $properties ),
			JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP
		);

		if ( false === $payload ) {
			return '';
		}

		return sprintf(
			'<script>window._tkq=window._tkq||[];window._tkq.push(%s);</script>',
			$payload
		);
	}
}
