<?php
/**
 * PayPal Payment Buttons — Tracks analytics helper.
 *
 * Thin wrapper over Automattic\Jetpack\Tracking for server-side events,
 * plus a helper that emits an inline client-side push for frontend renders
 * where there is typically no authenticated user.
 *
 * Gracefully no-ops when Jetpack Tracking is unavailable (standalone mode).
 *
 * Event naming: server-side calls pass bare names like `paypal_button_created`;
 * Tracking auto-prefixes with the product name (default `jetpack`) to produce
 * `jetpack_paypal_button_created`. Client-side pushes and inline renders must
 * pass the fully-qualified `jetpack_paypal_*` name since they bypass the
 * prefix logic. All properties must be non-PII.
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
	 * Uses the default `jetpack` product name so events are auto-prefixed
	 * with `jetpack_`, matching the prefix convention enforced by the
	 * `@automattic/jetpack-analytics` JS package.
	 *
	 * @return \Automattic\Jetpack\Tracking|null
	 */
	private static function get_tracking() {
		if ( ! self::is_available() ) {
			return null;
		}
		if ( null === self::$tracking ) {
			self::$tracking = new \Automattic\Jetpack\Tracking();
		}
		return self::$tracking;
	}

	/**
	 * Record a server-side Tracks event.
	 *
	 * Pass the bare event name (e.g. `paypal_button_created`). The Tracking
	 * class will auto-prefix with `jetpack_` to produce the final event
	 * name `jetpack_paypal_button_created`.
	 *
	 * Safe no-op when Jetpack Tracking is unavailable.
	 *
	 * @param string $event_name Bare event name (will be prefixed with `jetpack_`).
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
	 * Register and enqueue the Jetpack Tracks client scripts (stats.wp.com/w.js
	 * and the tracks-callables helper). Without this, `window._tkq` queues up
	 * events but never flushes them.
	 *
	 * Safe no-op when Jetpack Tracking is unavailable.
	 *
	 * Callers should invoke this from their own `enqueue_*_scripts` hooks
	 * on screens where Tracks events will be fired (block editor, admin
	 * page, or the frontend when a block is rendered).
	 */
	public static function enqueue_scripts() {
		if ( ! self::is_available() ) {
			return;
		}
		// Idempotent — safe to call even if Jetpack has already registered the script.
		\Automattic\Jetpack\Tracking::register_tracks_functions_scripts( true );
	}

	/**
	 * Build an inline <script> tag that pushes a single event to
	 * Jetpack Tracks on the frontend. Intended for render-time events
	 * where the viewer is typically unauthenticated (and therefore
	 * record_user_event would drop the event).
	 *
	 * This path bypasses the Tracking product-prefix logic — pass the
	 * fully-qualified event name including the `jetpack_` prefix.
	 *
	 * Returns an empty string when Jetpack Tracking is unavailable so
	 * no-op standalone mode does not emit dead script tags.
	 *
	 * @param string $event_name Fully-qualified event name (e.g. `jetpack_paypal_button_rendered`).
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
