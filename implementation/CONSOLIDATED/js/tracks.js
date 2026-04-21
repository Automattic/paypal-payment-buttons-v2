/**
 * Tracks analytics helper for PayPal Payment Buttons.
 *
 * Pushes events to Jetpack Tracks via the global `window._tkq` queue.
 * When Tracks is not loaded (standalone plugin mode, ad blockers, etc.)
 * the push is a safe no-op.
 *
 * All events use the `paypal_` prefix and must carry non-PII properties only.
 *
 * @package
 * @since 0.13.0
 */

/**
 * Record a Tracks event.
 *
 * @param {string} eventName  Event name, e.g. `paypal_button_created`.
 * @param {object} properties Optional event properties. Must be non-PII.
 */
export function recordEvent( eventName, properties = {} ) {
	if ( ! eventName ) {
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
