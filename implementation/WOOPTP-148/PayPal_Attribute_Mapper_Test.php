<?php
/**
 * Tests for the PayPal_Attribute_Mapper class.
 *
 * @package automattic/jetpack-paypal-payments
 */

namespace Automattic\Jetpack\PaypalPayments;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/**
 * Class PayPal_Attribute_Mapper_Test
 *
 * @covers \Automattic\Jetpack\PaypalPayments\PayPal_Attribute_Mapper
 */
#[CoversClass( PayPal_Attribute_Mapper::class )]
class PayPal_Attribute_Mapper_Test extends TestCase {

	// ---------------------------------------------------------------
	// attributes_to_api_request()
	// ---------------------------------------------------------------

	/**
	 * Test minimal required attributes produce correct API request.
	 */
	public function test_attributes_to_api_request_minimal() {
		$attributes = array(
			'productName' => 'Widget',
			'price'       => '29.99',
			'currencyCode' => 'USD',
		);

		$result = PayPal_Attribute_Mapper::attributes_to_api_request( $attributes );

		$this->assertSame( 'BUY_NOW', $result['type'] );
		$this->assertSame( 'LINK', $result['integration_mode'] );
		$this->assertSame( 'MULTIPLE', $result['reusable'] );
		$this->assertCount( 1, $result['line_items'] );
		$this->assertSame( 'Widget', $result['line_items'][0]['name'] );
		$this->assertSame( '29.99', $result['line_items'][0]['unit_amount']['value'] );
		$this->assertSame( 'USD', $result['line_items'][0]['unit_amount']['currency_code'] );
		$this->assertArrayNotHasKey( 'return_url', $result );
		$this->assertArrayNotHasKey( 'description', $result['line_items'][0] );
		$this->assertArrayNotHasKey( 'image_url', $result['line_items'][0] );
	}

	/**
	 * Test full attributes produce correct API request with all optional fields.
	 */
	public function test_attributes_to_api_request_full() {
		$attributes = array(
			'productName'        => 'Premium Widget',
			'price'              => '149.00',
			'currencyCode'       => 'EUR',
			'productDescription' => 'The finest widget money can buy.',
			'imageUrl'           => 'https://example.com/widget.jpg',
			'returnUrl'          => 'https://example.com/thank-you',
			'buttonText'         => 'Buy Widget', // Frontend-only, should NOT appear in API request.
			'buttonType'         => 'single',     // Frontend-only, should NOT appear in API request.
		);

		$result = PayPal_Attribute_Mapper::attributes_to_api_request( $attributes );

		$this->assertSame( 'Premium Widget', $result['line_items'][0]['name'] );
		$this->assertSame( '149.00', $result['line_items'][0]['unit_amount']['value'] );
		$this->assertSame( 'EUR', $result['line_items'][0]['unit_amount']['currency_code'] );
		$this->assertSame( 'The finest widget money can buy.', $result['line_items'][0]['description'] );
		$this->assertSame( 'https://example.com/widget.jpg', $result['line_items'][0]['image_url'] );
		$this->assertSame( 'https://example.com/thank-you', $result['return_url'] );

		// Frontend-only fields must not leak into API request.
		$this->assertArrayNotHasKey( 'buttonText', $result );
		$this->assertArrayNotHasKey( 'buttonType', $result );
	}

	/**
	 * Test defaults when attributes are missing or empty.
	 */
	public function test_attributes_to_api_request_defaults() {
		$result = PayPal_Attribute_Mapper::attributes_to_api_request( array() );

		$this->assertSame( '', $result['line_items'][0]['name'] );
		$this->assertSame( '0.00', $result['line_items'][0]['unit_amount']['value'] );
		$this->assertSame( 'USD', $result['line_items'][0]['unit_amount']['currency_code'] );
	}

	/**
	 * Test that HTML in product name is sanitized.
	 */
	public function test_attributes_to_api_request_sanitizes_html() {
		$attributes = array(
			'productName' => '<script>alert("xss")</script>Widget',
			'price'       => '10.00',
		);

		$result = PayPal_Attribute_Mapper::attributes_to_api_request( $attributes );

		$this->assertStringNotContainsString( '<script>', $result['line_items'][0]['name'] );
	}

	/**
	 * Test that empty optional fields are excluded from the request.
	 */
	public function test_attributes_to_api_request_excludes_empty_optionals() {
		$attributes = array(
			'productName'        => 'Widget',
			'price'              => '5.00',
			'productDescription' => '',
			'imageUrl'           => '',
			'returnUrl'          => '',
		);

		$result = PayPal_Attribute_Mapper::attributes_to_api_request( $attributes );

		$this->assertArrayNotHasKey( 'description', $result['line_items'][0] );
		$this->assertArrayNotHasKey( 'image_url', $result['line_items'][0] );
		$this->assertArrayNotHasKey( 'return_url', $result );
	}

	// ---------------------------------------------------------------
	// api_response_to_attributes()
	// ---------------------------------------------------------------

	/**
	 * Test full API response maps correctly to block attributes.
	 */
	public function test_api_response_to_attributes_full() {
		$response = array(
			'id'           => 'PLB-8H2K9J3N5P7Q',
			'payment_link' => 'https://www.paypal.com/paymentpage/PLB-8H2K9J3N5P7Q',
			'return_url'   => 'https://example.com/return',
			'line_items'   => array(
				array(
					'name'        => 'Premium Widget',
					'description' => 'A great widget.',
					'unit_amount' => array(
						'currency_code' => 'EUR',
						'value'         => '99.50',
					),
					'image_url'   => 'https://example.com/img.png',
				),
			),
			'links'        => array(
				array(
					'href'   => 'https://www.paypal.com/v1/checkout/payment-resources/PLB-8H2K9J3N5P7Q',
					'rel'    => 'self',
					'method' => 'GET',
				),
			),
		);

		$result = PayPal_Attribute_Mapper::api_response_to_attributes( $response );

		$this->assertTrue( $result['isApiManaged'] );
		$this->assertSame( 'PLB-8H2K9J3N5P7Q', $result['resourceId'] );
		$this->assertSame( 'https://www.paypal.com/paymentpage/PLB-8H2K9J3N5P7Q', $result['paymentLink'] );
		$this->assertSame( 'Premium Widget', $result['productName'] );
		$this->assertSame( '99.50', $result['price'] );
		$this->assertSame( 'EUR', $result['currencyCode'] );
		$this->assertSame( 'A great widget.', $result['productDescription'] );
		$this->assertSame( 'https://example.com/img.png', $result['imageUrl'] );
		$this->assertSame( 'https://example.com/return', $result['returnUrl'] );
	}

	/**
	 * Test minimal API response maps correctly.
	 */
	public function test_api_response_to_attributes_minimal() {
		$response = array(
			'id'           => 'PLB-ABC123',
			'payment_link' => 'https://www.paypal.com/paymentpage/PLB-ABC123',
			'line_items'   => array(
				array(
					'name'        => 'Widget',
					'unit_amount' => array(
						'currency_code' => 'USD',
						'value'         => '10.00',
					),
				),
			),
		);

		$result = PayPal_Attribute_Mapper::api_response_to_attributes( $response );

		$this->assertTrue( $result['isApiManaged'] );
		$this->assertSame( 'PLB-ABC123', $result['resourceId'] );
		$this->assertSame( 'Widget', $result['productName'] );
		$this->assertSame( '10.00', $result['price'] );
		$this->assertArrayNotHasKey( 'productDescription', $result );
		$this->assertArrayNotHasKey( 'imageUrl', $result );
		$this->assertArrayNotHasKey( 'returnUrl', $result );
	}

	/**
	 * Test that payment_link is extracted from HATEOAS links when not in top-level field.
	 */
	public function test_api_response_extracts_payment_link_from_hateoas() {
		$response = array(
			'id'         => 'PLB-HATEOAS',
			'line_items' => array(
				array(
					'name'        => 'Test',
					'unit_amount' => array(
						'currency_code' => 'USD',
						'value'         => '1.00',
					),
				),
			),
			'links'      => array(
				array(
					'href'   => 'https://www.paypal.com/v1/checkout/payment-resources/PLB-HATEOAS',
					'rel'    => 'self',
					'method' => 'GET',
				),
				array(
					'href'   => 'https://www.paypal.com/ncp/payment/PLB-HATEOAS',
					'rel'    => 'payment_link',
					'method' => 'GET',
				),
			),
		);

		$result = PayPal_Attribute_Mapper::api_response_to_attributes( $response );

		$this->assertSame( 'https://www.paypal.com/ncp/payment/PLB-HATEOAS', $result['paymentLink'] );
	}

	/**
	 * Test empty API response still produces safe defaults.
	 */
	public function test_api_response_to_attributes_empty() {
		$result = PayPal_Attribute_Mapper::api_response_to_attributes( array() );

		$this->assertTrue( $result['isApiManaged'] );
		$this->assertSame( '', $result['resourceId'] );
		$this->assertSame( '', $result['paymentLink'] );
	}

	/**
	 * Test API response with empty line_items array.
	 */
	public function test_api_response_to_attributes_empty_line_items() {
		$response = array(
			'id'           => 'PLB-EMPTY',
			'payment_link' => 'https://www.paypal.com/paymentpage/PLB-EMPTY',
			'line_items'   => array(),
		);

		$result = PayPal_Attribute_Mapper::api_response_to_attributes( $response );

		$this->assertSame( 'PLB-EMPTY', $result['resourceId'] );
		$this->assertArrayNotHasKey( 'productName', $result );
		$this->assertArrayNotHasKey( 'price', $result );
	}

	/**
	 * Test API response with line item missing unit_amount.
	 */
	public function test_api_response_to_attributes_missing_unit_amount() {
		$response = array(
			'id'           => 'PLB-NOAMT',
			'payment_link' => 'https://www.paypal.com/paymentpage/PLB-NOAMT',
			'line_items'   => array(
				array(
					'name' => 'Broken Widget',
				),
			),
		);

		$result = PayPal_Attribute_Mapper::api_response_to_attributes( $response );

		$this->assertSame( 'Broken Widget', $result['productName'] );
		$this->assertArrayNotHasKey( 'price', $result );
		$this->assertArrayNotHasKey( 'currencyCode', $result );
	}

	// ---------------------------------------------------------------
	// validate_attributes()
	// ---------------------------------------------------------------

	/**
	 * Test valid attributes pass validation.
	 */
	public function test_validate_attributes_valid() {
		$attributes = array(
			'productName' => 'Widget',
			'price'       => '29.99',
			'currencyCode' => 'USD',
		);

		$this->assertTrue( PayPal_Attribute_Mapper::validate_attributes( $attributes ) );
	}

	/**
	 * Test full valid attributes pass validation.
	 */
	public function test_validate_attributes_valid_full() {
		$attributes = array(
			'productName'        => 'Premium Widget',
			'price'              => '149.00',
			'currencyCode'       => 'EUR',
			'productDescription' => 'A description.',
			'imageUrl'           => 'https://example.com/img.png',
			'returnUrl'          => 'https://example.com/return',
			'buttonText'         => 'Buy Now',
		);

		$this->assertTrue( PayPal_Attribute_Mapper::validate_attributes( $attributes ) );
	}

	/**
	 * Test missing product name fails validation.
	 */
	public function test_validate_attributes_missing_name() {
		$attributes = array(
			'price'       => '10.00',
			'currencyCode' => 'USD',
		);

		$result = PayPal_Attribute_Mapper::validate_attributes( $attributes );

		$this->assertInstanceOf( 'WP_Error', $result );
		$this->assertSame( 'missing_product_name', $result->get_error_code() );
	}

	/**
	 * Test empty product name fails validation.
	 */
	public function test_validate_attributes_empty_name() {
		$attributes = array(
			'productName' => '',
			'price'       => '10.00',
		);

		$result = PayPal_Attribute_Mapper::validate_attributes( $attributes );

		$this->assertInstanceOf( 'WP_Error', $result );
		$this->assertSame( 'missing_product_name', $result->get_error_code() );
	}

	/**
	 * Test whitespace-only product name fails validation.
	 */
	public function test_validate_attributes_whitespace_name() {
		$attributes = array(
			'productName' => '   ',
			'price'       => '10.00',
		);

		$result = PayPal_Attribute_Mapper::validate_attributes( $attributes );

		$this->assertInstanceOf( 'WP_Error', $result );
		$this->assertSame( 'missing_product_name', $result->get_error_code() );
	}

	/**
	 * Test product name exceeding max length fails validation.
	 */
	public function test_validate_attributes_name_too_long() {
		$attributes = array(
			'productName' => str_repeat( 'a', PayPal_Attribute_Mapper::MAX_NAME_LENGTH + 1 ),
			'price'       => '10.00',
		);

		$result = PayPal_Attribute_Mapper::validate_attributes( $attributes );

		$this->assertInstanceOf( 'WP_Error', $result );
		$this->assertSame( 'product_name_too_long', $result->get_error_code() );
	}

	/**
	 * Test missing price fails validation.
	 */
	public function test_validate_attributes_missing_price() {
		$attributes = array(
			'productName' => 'Widget',
		);

		$result = PayPal_Attribute_Mapper::validate_attributes( $attributes );

		$this->assertInstanceOf( 'WP_Error', $result );
		$this->assertSame( 'missing_price', $result->get_error_code() );
	}

	/**
	 * Test various invalid price formats.
	 */
	#[DataProvider( 'invalid_price_provider' )]
	public function test_validate_attributes_invalid_price( $price ) {
		$attributes = array(
			'productName' => 'Widget',
			'price'       => $price,
		);

		$result = PayPal_Attribute_Mapper::validate_attributes( $attributes );

		$this->assertInstanceOf( 'WP_Error', $result );
		$this->assertSame( 'invalid_price', $result->get_error_code() );
	}

	/**
	 * Data provider for invalid prices.
	 *
	 * @return array
	 */
	public static function invalid_price_provider() {
		return array(
			'negative'        => array( '-10.00' ),
			'zero'            => array( '0' ),
			'zero decimal'    => array( '0.00' ),
			'text'            => array( 'free' ),
			'html injection'  => array( '<script>10</script>' ),
			'sql injection'   => array( "10'; DROP TABLE--" ),
			'three decimals'  => array( '10.999' ),
			'comma separator' => array( '1,000.00' ),
			'spaces'          => array( '10 .00' ),
		);
	}

	/**
	 * Test various valid price formats.
	 */
	#[DataProvider( 'valid_price_provider' )]
	public function test_validate_attributes_valid_price( $price ) {
		$attributes = array(
			'productName' => 'Widget',
			'price'       => $price,
		);

		$this->assertTrue( PayPal_Attribute_Mapper::validate_attributes( $attributes ) );
	}

	/**
	 * Data provider for valid prices.
	 *
	 * @return array
	 */
	public static function valid_price_provider() {
		return array(
			'integer'      => array( '10' ),
			'one decimal'  => array( '10.5' ),
			'two decimals' => array( '10.50' ),
			'small price'  => array( '0.01' ),
			'large price'  => array( '99999' ),
			'pennies'      => array( '0.99' ),
		);
	}

	/**
	 * Test unsupported currency code fails validation.
	 */
	public function test_validate_attributes_invalid_currency() {
		$attributes = array(
			'productName'  => 'Widget',
			'price'        => '10.00',
			'currencyCode' => 'FAKE',
		);

		$result = PayPal_Attribute_Mapper::validate_attributes( $attributes );

		$this->assertInstanceOf( 'WP_Error', $result );
		$this->assertSame( 'invalid_currency', $result->get_error_code() );
	}

	/**
	 * Test all supported currencies pass validation.
	 */
	public function test_validate_attributes_all_supported_currencies() {
		foreach ( PayPal_Attribute_Mapper::SUPPORTED_CURRENCIES as $currency ) {
			$attributes = array(
				'productName'  => 'Widget',
				'price'        => '10.00',
				'currencyCode' => $currency,
			);

			$this->assertTrue(
				PayPal_Attribute_Mapper::validate_attributes( $attributes ),
				"Currency $currency should be valid"
			);
		}
	}

	/**
	 * Test description exceeding max length fails validation.
	 */
	public function test_validate_attributes_description_too_long() {
		$attributes = array(
			'productName'        => 'Widget',
			'price'              => '10.00',
			'productDescription' => str_repeat( 'a', PayPal_Attribute_Mapper::MAX_DESCRIPTION_LENGTH + 1 ),
		);

		$result = PayPal_Attribute_Mapper::validate_attributes( $attributes );

		$this->assertInstanceOf( 'WP_Error', $result );
		$this->assertSame( 'description_too_long', $result->get_error_code() );
	}

	/**
	 * Test button text exceeding max length fails validation.
	 */
	public function test_validate_attributes_button_text_too_long() {
		$attributes = array(
			'productName' => 'Widget',
			'price'       => '10.00',
			'buttonText'  => str_repeat( 'a', PayPal_Attribute_Mapper::MAX_BUTTON_TEXT_LENGTH + 1 ),
		);

		$result = PayPal_Attribute_Mapper::validate_attributes( $attributes );

		$this->assertInstanceOf( 'WP_Error', $result );
		$this->assertSame( 'button_text_too_long', $result->get_error_code() );
	}

	// ---------------------------------------------------------------
	// is_valid_resource_id()
	// ---------------------------------------------------------------

	/**
	 * Test valid resource ID formats.
	 */
	#[DataProvider( 'valid_resource_id_provider' )]
	public function test_is_valid_resource_id_valid( $resource_id ) {
		$this->assertTrue( PayPal_Attribute_Mapper::is_valid_resource_id( $resource_id ) );
	}

	/**
	 * Data provider for valid resource IDs.
	 *
	 * @return array
	 */
	public static function valid_resource_id_provider() {
		return array(
			'standard'    => array( 'PLB-8H2K9J3N5P7Q' ),
			'short'       => array( 'PLB-ABC' ),
			'long'        => array( 'PLB-8H2K9J3N5P7QR4T6V8W0' ),
			'lowercase'   => array( 'PLB-abc123' ),
			'mixed case'  => array( 'PLB-AbC123xYz' ),
		);
	}

	/**
	 * Test invalid resource ID formats.
	 */
	#[DataProvider( 'invalid_resource_id_provider' )]
	public function test_is_valid_resource_id_invalid( $resource_id ) {
		$this->assertFalse( PayPal_Attribute_Mapper::is_valid_resource_id( $resource_id ) );
	}

	/**
	 * Data provider for invalid resource IDs.
	 *
	 * @return array
	 */
	public static function invalid_resource_id_provider() {
		return array(
			'empty'           => array( '' ),
			'no prefix'       => array( '8H2K9J3N5P7Q' ),
			'wrong prefix'    => array( 'ABC-8H2K9J3N5P7Q' ),
			'xss attempt'     => array( 'PLB-<script>alert(1)</script>' ),
			'sql injection'   => array( "PLB-'; DROP TABLE--" ),
			'spaces'          => array( 'PLB-ABC DEF' ),
			'prefix only'     => array( 'PLB-' ),
			'special chars'   => array( 'PLB-ABC!@#' ),
		);
	}

	// ---------------------------------------------------------------
	// is_api_managed()
	// ---------------------------------------------------------------

	/**
	 * Test V2 block is detected as API managed.
	 */
	public function test_is_api_managed_true() {
		$this->assertTrue(
			PayPal_Attribute_Mapper::is_api_managed( array( 'isApiManaged' => true ) )
		);
	}

	/**
	 * Test V1 block is not detected as API managed.
	 */
	public function test_is_api_managed_false() {
		$this->assertFalse(
			PayPal_Attribute_Mapper::is_api_managed( array( 'isApiManaged' => false ) )
		);
	}

	/**
	 * Test missing flag defaults to not API managed.
	 */
	public function test_is_api_managed_missing() {
		$this->assertFalse(
			PayPal_Attribute_Mapper::is_api_managed( array() )
		);
	}

	/**
	 * Test truthy non-boolean value is not treated as API managed.
	 */
	public function test_is_api_managed_truthy_string() {
		$this->assertFalse(
			PayPal_Attribute_Mapper::is_api_managed( array( 'isApiManaged' => 'true' ) )
		);
	}

	// ---------------------------------------------------------------
	// merge_response_attributes()
	// ---------------------------------------------------------------

	/**
	 * Test response attributes merge correctly with existing attributes.
	 */
	public function test_merge_response_attributes() {
		$existing = array(
			'buttonText'  => 'Buy Now',
			'buttonType'  => 'single',
			'productName' => 'Old Widget',
			'price'       => '10.00',
		);

		$response = array(
			'isApiManaged' => true,
			'resourceId'   => 'PLB-NEW123',
			'paymentLink'  => 'https://www.paypal.com/paymentpage/PLB-NEW123',
			'productName'  => 'New Widget',
			'price'        => '20.00',
		);

		$result = PayPal_Attribute_Mapper::merge_response_attributes( $existing, $response );

		// API response values should be present.
		$this->assertTrue( $result['isApiManaged'] );
		$this->assertSame( 'PLB-NEW123', $result['resourceId'] );
		$this->assertSame( 'New Widget', $result['productName'] );
		$this->assertSame( '20.00', $result['price'] );

		// Frontend-only values should be preserved from existing.
		$this->assertSame( 'Buy Now', $result['buttonText'] );
		$this->assertSame( 'single', $result['buttonType'] );
	}

	/**
	 * Test that merge preserves frontend values even when response has different values.
	 */
	public function test_merge_preserves_frontend_only_fields() {
		$existing = array(
			'buttonText' => 'Custom Button Text',
			'buttonType' => 'stacked',
		);

		$response = array(
			'isApiManaged' => true,
			'resourceId'   => 'PLB-XYZ',
		);

		$result = PayPal_Attribute_Mapper::merge_response_attributes( $existing, $response );

		$this->assertSame( 'Custom Button Text', $result['buttonText'] );
		$this->assertSame( 'stacked', $result['buttonType'] );
	}

	// ---------------------------------------------------------------
	// Round-trip: attributes → API → response → attributes
	// ---------------------------------------------------------------

	/**
	 * Test full round-trip: block attrs → API request → API response → block attrs.
	 */
	public function test_round_trip_mapping() {
		$original_attrs = array(
			'productName'        => 'Round Trip Widget',
			'price'              => '49.99',
			'currencyCode'       => 'GBP',
			'productDescription' => 'Travels well.',
			'imageUrl'           => 'https://example.com/widget.jpg',
			'returnUrl'          => 'https://example.com/thanks',
			'buttonText'         => 'Purchase',
			'buttonType'         => 'single',
		);

		// Step 1: Validate.
		$this->assertTrue( PayPal_Attribute_Mapper::validate_attributes( $original_attrs ) );

		// Step 2: Convert to API request.
		$api_request = PayPal_Attribute_Mapper::attributes_to_api_request( $original_attrs );

		// Simulate PayPal API response (same data + id + payment_link).
		$api_response = array_merge( $api_request, array(
			'id'           => 'PLB-ROUNDTRIP',
			'payment_link' => 'https://www.paypal.com/paymentpage/PLB-ROUNDTRIP',
			'status'       => 'ACTIVE',
			'create_time'  => '2026-03-11T12:00:00Z',
		) );

		// Step 3: Convert response back to attributes.
		$response_attrs = PayPal_Attribute_Mapper::api_response_to_attributes( $api_response );

		// Step 4: Merge with original attributes.
		$final_attrs = PayPal_Attribute_Mapper::merge_response_attributes( $original_attrs, $response_attrs );

		// Verify round-trip preserves all values.
		$this->assertTrue( $final_attrs['isApiManaged'] );
		$this->assertSame( 'PLB-ROUNDTRIP', $final_attrs['resourceId'] );
		$this->assertSame( 'https://www.paypal.com/paymentpage/PLB-ROUNDTRIP', $final_attrs['paymentLink'] );
		$this->assertSame( 'Round Trip Widget', $final_attrs['productName'] );
		$this->assertSame( '49.99', $final_attrs['price'] );
		$this->assertSame( 'GBP', $final_attrs['currencyCode'] );
		$this->assertSame( 'Travels well.', $final_attrs['productDescription'] );
		$this->assertSame( 'https://example.com/widget.jpg', $final_attrs['imageUrl'] );
		$this->assertSame( 'https://example.com/thanks', $final_attrs['returnUrl'] );

		// Frontend-only fields preserved.
		$this->assertSame( 'Purchase', $final_attrs['buttonText'] );
		$this->assertSame( 'single', $final_attrs['buttonType'] );
	}
}
