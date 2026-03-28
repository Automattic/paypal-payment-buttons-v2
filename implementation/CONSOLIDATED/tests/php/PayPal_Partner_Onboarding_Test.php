<?php
/**
 * Tests for the PayPal_Partner_Onboarding class.
 *
 * @package automattic/jetpack-paypal-payments
 */

namespace Automattic\Jetpack\PaypalPayments;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;

/**
 * Class PayPal_Partner_Onboarding_Test
 *
 * @coversDefaultClass Automattic\Jetpack\PaypalPayments\PayPal_Partner_Onboarding
 * @covers \Automattic\Jetpack\PaypalPayments\PayPal_Partner_Onboarding
 */
#[CoversClass( PayPal_Partner_Onboarding::class )]
class PayPal_Partner_Onboarding_Test extends TestCase {

	/**
	 * Clean up after each test.
	 */
	protected function tearDown(): void {
		parent::tearDown();

		delete_transient( PayPal_Partner_Onboarding::SELLER_NONCE_TRANSIENT_KEY );
		delete_option( PayPal_Partner_Onboarding::MERCHANT_ID_OPTION_KEY );
		delete_option( PayPal_Partner_Onboarding::ONBOARDING_METHOD_OPTION_KEY );
		delete_option( PayPal_OAuth::CREDENTIALS_OPTION_KEY );
		delete_option( PayPal_OAuth::ENVIRONMENT_OPTION_KEY );
	}

	/**
	 * Test partner ID returns production constant by default.
	 */
	public function test_partner_id_returns_production_constant() {
		$this->assertEquals(
			PayPal_Partner_Onboarding::AUTOMATTIC_PARTNER_ID,
			PayPal_Partner_Onboarding::get_partner_id()
		);
	}

	/**
	 * Test partner ID returns sandbox constant when in sandbox mode.
	 */
	public function test_partner_id_returns_sandbox_constant() {
		PayPal_OAuth::set_environment( 'sandbox' );
		$this->assertEquals(
			PayPal_Partner_Onboarding::AUTOMATTIC_SANDBOX_PARTNER_ID,
			PayPal_Partner_Onboarding::get_partner_id()
		);
	}

	/**
	 * Test partner ID constants are non-empty.
	 */
	public function test_partner_id_constants_are_defined() {
		$this->assertNotEmpty( PayPal_Partner_Onboarding::AUTOMATTIC_PARTNER_ID );
		$this->assertNotEmpty( PayPal_Partner_Onboarding::AUTOMATTIC_SANDBOX_PARTNER_ID );
	}

	/**
	 * Test merchant ID retrieval when not set.
	 */
	public function test_merchant_id_empty_by_default() {
		$this->assertEmpty( PayPal_Partner_Onboarding::get_merchant_id() );
	}

	/**
	 * Test generate_signup_link rejects HTTP return URLs in production.
	 */
	public function test_generate_signup_link_rejects_insecure_url() {
		$result = PayPal_Partner_Onboarding::generate_signup_link(
			'http://example.com/return',
			'production'
		);

		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertEquals( 'paypal_onboarding_insecure_url', $result->get_error_code() );
	}

	/**
	 * Test complete_onboarding fails without seller nonce.
	 */
	public function test_complete_onboarding_requires_seller_nonce() {
		$result = PayPal_Partner_Onboarding::complete_onboarding(
			'test_auth_code',
			'test_shared_id',
			'TEST_MERCHANT_ID'
		);

		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertEquals( 'paypal_onboarding_no_nonce', $result->get_error_code() );
	}

	/**
	 * Test check_merchant_status fails without merchant info.
	 */
	public function test_check_merchant_status_requires_merchant_info() {
		$result = PayPal_Partner_Onboarding::check_merchant_status();

		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertEquals( 'paypal_no_merchant_info', $result->get_error_code() );
	}

	/**
	 * Test cleanup removes all onboarding options.
	 */
	public function test_cleanup_removes_onboarding_data() {
		set_transient( PayPal_Partner_Onboarding::SELLER_NONCE_TRANSIENT_KEY, 'test_nonce', 30 * MINUTE_IN_SECONDS );
		update_option( PayPal_Partner_Onboarding::MERCHANT_ID_OPTION_KEY, 'test_merchant' );
		update_option( PayPal_Partner_Onboarding::ONBOARDING_METHOD_OPTION_KEY, 'partner_referrals' );

		PayPal_Partner_Onboarding::cleanup();

		$this->assertFalse( get_transient( PayPal_Partner_Onboarding::SELLER_NONCE_TRANSIENT_KEY ) );
		$this->assertFalse( get_option( PayPal_Partner_Onboarding::MERCHANT_ID_OPTION_KEY ) );
		$this->assertFalse( get_option( PayPal_Partner_Onboarding::ONBOARDING_METHOD_OPTION_KEY ) );
	}

	/**
	 * Test cleanup does not affect partner ID (now a constant, not stored in options).
	 */
	public function test_cleanup_preserves_partner_id() {
		$partner_id_before = PayPal_Partner_Onboarding::get_partner_id();

		PayPal_Partner_Onboarding::cleanup();

		$this->assertEquals( $partner_id_before, PayPal_Partner_Onboarding::get_partner_id() );
	}

	/**
	 * Test WPCOM signup link endpoint constant is defined.
	 */
	public function test_wpcom_endpoint_defined() {
		$this->assertNotEmpty( PayPal_Partner_Onboarding::WPCOM_SIGNUP_LINK_ENDPOINT );
		$this->assertStringContainsString( 'paypal/onboarding/signup-link', PayPal_Partner_Onboarding::WPCOM_SIGNUP_LINK_ENDPOINT );
	}

	/**
	 * Test onboarding products constant.
	 */
	public function test_onboarding_products() {
		$this->assertContains( 'EXPRESS_CHECKOUT', PayPal_Partner_Onboarding::ONBOARDING_PRODUCTS );
	}

	/**
	 * Test onboarding features constant.
	 */
	public function test_onboarding_features() {
		$features = PayPal_Partner_Onboarding::ONBOARDING_FEATURES;
		$this->assertContains( 'PAYMENT', $features );
		$this->assertContains( 'REFUND', $features );
		$this->assertContains( 'ACCESS_MERCHANT_INFORMATION', $features );
	}
}
