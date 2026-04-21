<?php
/**
 * Tests for the PayPal_Tracks helper.
 *
 * @package automattic/jetpack-paypal-payments
 */

namespace Automattic\Jetpack\PaypalPayments;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;

/**
 * Class PayPal_Tracks_Test
 */
#[CoversClass( PayPal_Tracks::class )]
class PayPal_Tracks_Test extends TestCase {

	/**
	 * Verify the availability check reflects whether Jetpack Tracking is loaded.
	 * In the unit test environment we expect it to be unavailable — if that
	 * changes upstream, this assertion will still pass (the helper just needs
	 * to return a bool matching reality).
	 */
	public function test_is_available_returns_bool_matching_class_presence() {
		$this->assertSame(
			class_exists( '\Automattic\Jetpack\Tracking' ),
			PayPal_Tracks::is_available()
		);
	}

	/**
	 * record_event must never throw when Tracking is unavailable.
	 * This is the "graceful no-op" guarantee from WOOPTP-194.
	 */
	public function test_record_event_is_silent_noop_when_tracking_unavailable() {
		if ( PayPal_Tracks::is_available() ) {
			$this->markTestSkipped( 'Jetpack Tracking is loaded — no-op path not exercised.' );
		}

		PayPal_Tracks::record_event( 'paypal_button_created', array( 'currency' => 'USD' ) );
		PayPal_Tracks::record_event( '' );
		PayPal_Tracks::record_event( 'paypal_button_created' );

		$this->assertTrue( true, 'record_event must not throw when Tracking is unavailable.' );
	}

	/**
	 * get_inline_event_script returns an empty string when Tracking is
	 * unavailable so standalone mode does not emit dead script tags.
	 */
	public function test_get_inline_event_script_is_empty_when_unavailable() {
		if ( PayPal_Tracks::is_available() ) {
			$this->markTestSkipped( 'Jetpack Tracking is loaded — empty-string path not exercised.' );
		}

		$this->assertSame( '', PayPal_Tracks::get_inline_event_script( 'paypal_button_rendered' ) );
		$this->assertSame( '', PayPal_Tracks::get_inline_event_script( '' ) );
	}

	/**
	 * get_inline_event_script always returns '' for an empty event name,
	 * even if Jetpack Tracking is present. Guards against caller mistakes.
	 */
	public function test_get_inline_event_script_rejects_empty_event_name() {
		$this->assertSame( '', PayPal_Tracks::get_inline_event_script( '' ) );
	}
}
