/**
 * Tracks analytics helper for PayPal Payment Buttons.
 *
 * Pushes events to Jetpack Tracks via the global `window._tkq` queue.
 * When Tracks is not loaded (standalone plugin mode, ad blockers, etc.)
 * the push is a safe no-op.
 *
 * Event naming: names must be fully qualified with the `jetpack_` prefix
 * (e.g. `jetpack_paypal_button_created`). This matches the validation
 * enforced by `@automattic/jetpack-analytics`. Pass non-PII properties only.
 *
 * @package
 * @since 0.13.0
 */

const REQUIRED_PREFIX = 'jetpack_';

/**
 * Record a Tracks event.
 *
 * @param {string} eventName  Event name — must start with `jetpack_`.
 * @param {object} properties Optional event properties. Must be non-PII.
 */
export function recordEvent( eventName, properties = {} ) {
	if ( ! eventName ) {
		return;
	}
	if ( eventName.indexOf( REQUIRED_PREFIX ) !== 0 ) {
		// Mirror the @automattic/jetpack-analytics guard — drop silently.
		// In development, surface the mistake without breaking production.
		if ( typeof process !== 'undefined' && process.env?.NODE_ENV === 'development' ) {
			// eslint-disable-next-line no-console
			console.warn( `[paypal-payment-buttons] Tracks event "${ eventName }" must be prefixed with "${ REQUIRED_PREFIX }"` );
		}
		return;
	}
	try {
		if ( typeof window === 'undefined' ) {
			return;
		}
		window._tkq = window._tkq || [];
		window._tkq.push( [ 'recordEvent', eventName, properties ] );
	} catch ( e ) {
		// Silently ignore — Tracks is a fire-and-forget best-effort signal.
	}
}
