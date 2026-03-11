<?php
/**
 * PayPal Pay Links & Buttons API client.
 *
 * Provides typed CRUD operations for the /v1/checkout/payment-resources
 * endpoint. All requests are authenticated via PayPal_OAuth and include
 * the BN code attribution header.
 *
 * @package automattic/jetpack-paypal-payments
 * @since 0.7.0
 */

namespace Automattic\Jetpack\PaypalPayments;

if ( ! defined( 'ABSPATH' ) ) {
	exit( 0 );
}

/**
 * Class PayPal_API_Client
 *
 * Wraps PayPal's Pay Links & Buttons API with typed methods for
 * creating, listing, getting, updating, and deleting payment resources.
 */
class PayPal_API_Client {

	/**
	 * Payment resources API endpoint path.
	 *
	 * @var string
	 */
	const RESOURCES_ENDPOINT = '/v1/checkout/payment-resources';

	/**
	 * Default timeout for API requests in seconds.
	 *
	 * @var int
	 */
	const REQUEST_TIMEOUT = 30;

	/**
	 * Create a payment resource (button/link).
	 *
	 * @param array $resource_data {
	 *     Payment resource data.
	 *
	 *     @type string $type             Payment type. Currently only 'BUY_NOW'.
	 *     @type string $integration_mode 'LINK' or 'BUTTON'.
	 *     @type string $reusable         'MULTIPLE' (default) — link reusable.
	 *     @type string $return_url       Optional redirect after payment.
	 *     @type array  $line_items       Required. Array of line item objects.
	 * }
	 * @return array|\WP_Error Decoded response body on success (HTTP 201), WP_Error on failure.
	 */
	public static function create_resource( $resource_data ) {
		return self::make_request(
			'POST',
			self::RESOURCES_ENDPOINT,
			$resource_data,
			201
		);
	}

	/**
	 * List payment resources with optional pagination.
	 *
	 * @param int    $page_size  Number of results per page. Default 10.
	 * @param string $page_token Pagination cursor from a previous response. Default empty.
	 * @return array|\WP_Error Decoded response body on success (HTTP 200), WP_Error on failure.
	 */
	public static function list_resources( $page_size = 10, $page_token = '' ) {
		$query_args = array(
			'page_size' => absint( $page_size ),
		);

		if ( ! empty( $page_token ) ) {
			$query_args['page_token'] = sanitize_text_field( $page_token );
		}

		$endpoint = add_query_arg( $query_args, self::RESOURCES_ENDPOINT );

		return self::make_request( 'GET', $endpoint, null, 200 );
	}

	/**
	 * Get a single payment resource by ID.
	 *
	 * @param string $resource_id PayPal resource ID (format: PLB-XXXXXXXXXXXX).
	 * @return array|\WP_Error Decoded response body on success (HTTP 200), WP_Error on failure.
	 */
	public static function get_resource( $resource_id ) {
		$resource_id = self::sanitize_resource_id( $resource_id );
		if ( is_wp_error( $resource_id ) ) {
			return $resource_id;
		}

		return self::make_request(
			'GET',
			self::RESOURCES_ENDPOINT . '/' . $resource_id,
			null,
			200
		);
	}

	/**
	 * Update a payment resource (full replacement via PUT).
	 *
	 * @param string $resource_id   PayPal resource ID (format: PLB-XXXXXXXXXXXX).
	 * @param array  $resource_data Complete updated resource data (same schema as create).
	 * @return array|\WP_Error Decoded response body on success (HTTP 200), WP_Error on failure.
	 */
	public static function update_resource( $resource_id, $resource_data ) {
		$resource_id = self::sanitize_resource_id( $resource_id );
		if ( is_wp_error( $resource_id ) ) {
			return $resource_id;
		}

		return self::make_request(
			'PUT',
			self::RESOURCES_ENDPOINT . '/' . $resource_id,
			$resource_data,
			200
		);
	}

	/**
	 * Delete a payment resource.
	 *
	 * @param string $resource_id PayPal resource ID (format: PLB-XXXXXXXXXXXX).
	 * @return true|\WP_Error True on success (HTTP 204), WP_Error on failure.
	 */
	public static function delete_resource( $resource_id ) {
		$resource_id = self::sanitize_resource_id( $resource_id );
		if ( is_wp_error( $resource_id ) ) {
			return $resource_id;
		}

		$result = self::make_request(
			'DELETE',
			self::RESOURCES_ENDPOINT . '/' . $resource_id,
			null,
			204
		);

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return true;
	}

	/**
	 * Make an authenticated request to the PayPal API.
	 *
	 * Handles token retrieval, header construction (including BN code),
	 * response validation, and error mapping.
	 *
	 * @param string     $method          HTTP method (GET, POST, PUT, DELETE).
	 * @param string     $endpoint        API endpoint path (appended to base URL).
	 * @param array|null $body            Request body data (JSON-encoded for POST/PUT).
	 * @param int        $expected_status Expected HTTP status code for success.
	 * @return array|null|\WP_Error Decoded response body, null for 204, or WP_Error.
	 */
	private static function make_request( $method, $endpoint, $body, $expected_status ) {
		$token = PayPal_OAuth::get_access_token();
		if ( is_wp_error( $token ) ) {
			return $token;
		}

		$url = PayPal_OAuth::get_base_url() . $endpoint;

		$args = array(
			'method'  => $method,
			'timeout' => self::REQUEST_TIMEOUT,
			'headers' => array(
				'Authorization'                => 'Bearer ' . $token,
				'Content-Type'                 => 'application/json',
				'Accept'                       => 'application/json',
				'PayPal-Partner-Attribution-Id' => PayPal_Payment_Buttons::PAYPAL_PARTNER_ATTRIBUTION_ID,
			),
		);

		if ( null !== $body && in_array( $method, array( 'POST', 'PUT' ), true ) ) {
			$args['body'] = wp_json_encode( $body );
		}

		$response = wp_remote_request( $url, $args );

		if ( is_wp_error( $response ) ) {
			return new \WP_Error(
				'paypal_api_request_failed',
				sprintf(
					/* translators: %s: error message from the HTTP request */
					__( 'PayPal API request failed: %s', 'jetpack-paypal-payments' ),
					$response->get_error_message()
				)
			);
		}

		$status_code = wp_remote_retrieve_response_code( $response );

		// Success path.
		if ( $status_code === $expected_status ) {
			// 204 No Content has no body.
			if ( 204 === $status_code ) {
				return null;
			}

			$response_body = wp_remote_retrieve_body( $response );
			$data          = json_decode( $response_body, true );

			if ( null === $data && '' !== $response_body ) {
				return new \WP_Error(
					'paypal_api_invalid_json',
					__( 'PayPal returned a response that could not be parsed as JSON.', 'jetpack-paypal-payments' ),
					array( 'status' => $status_code )
				);
			}

			return $data;
		}

		// Error path — map PayPal error response to WP_Error.
		return self::parse_error_response( $response, $status_code );
	}

	/**
	 * Parse a PayPal error response into a WP_Error.
	 *
	 * Maps PayPal's standard error response format to descriptive WP_Error
	 * codes and messages.
	 *
	 * @param array|WP_Error $response    The wp_remote_request response.
	 * @param int            $status_code The HTTP status code.
	 * @return \WP_Error The parsed error.
	 */
	private static function parse_error_response( $response, $status_code ) {
		$body = wp_remote_retrieve_body( $response );
		$data = json_decode( $body, true );

		// PayPal error response shape: { name, message, details[] }
		$error_name    = isset( $data['name'] ) ? sanitize_text_field( $data['name'] ) : 'UNKNOWN_ERROR';
		$error_message = isset( $data['message'] ) ? sanitize_text_field( $data['message'] ) : '';
		$error_details = isset( $data['details'] ) && is_array( $data['details'] ) ? $data['details'] : array();

		// Build a human-readable message.
		$message = self::get_error_message( $status_code, $error_name, $error_message );

		// Include detail descriptions if available.
		$detail_messages = array();
		foreach ( $error_details as $detail ) {
			if ( ! empty( $detail['description'] ) ) {
				$detail_messages[] = sanitize_text_field( $detail['description'] );
			}
		}

		if ( ! empty( $detail_messages ) ) {
			$message .= ' ' . implode( ' ', $detail_messages );
		}

		return new \WP_Error(
			'paypal_api_' . strtolower( $error_name ),
			$message,
			array(
				'status'      => $status_code,
				'paypal_name' => $error_name,
				'details'     => $error_details,
			)
		);
	}

	/**
	 * Get a user-friendly error message for a PayPal API error.
	 *
	 * @param int    $status_code   HTTP status code.
	 * @param string $error_name    PayPal error name.
	 * @param string $error_message PayPal error message.
	 * @return string Formatted error message.
	 */
	private static function get_error_message( $status_code, $error_name, $error_message ) {
		switch ( $status_code ) {
			case 400:
				return sprintf(
					/* translators: %s: error detail from PayPal */
					__( 'Invalid request to PayPal: %s', 'jetpack-paypal-payments' ),
					$error_message ?: $error_name
				);
			case 401:
				// Token may have expired between cache and use.
				PayPal_OAuth::clear_cached_token();
				return __( 'PayPal authentication expired. Please try again.', 'jetpack-paypal-payments' );
			case 403:
				return __( 'PayPal account is not authorized for Payment Links & Buttons. Please check your PayPal app settings.', 'jetpack-paypal-payments' );
			case 404:
				return __( 'The PayPal payment resource was not found. It may have been deleted.', 'jetpack-paypal-payments' );
			case 422:
				return sprintf(
					/* translators: %s: error detail from PayPal */
					__( 'PayPal could not process the request: %s', 'jetpack-paypal-payments' ),
					$error_message ?: $error_name
				);
			case 429:
				return __( 'Too many requests to PayPal. Please wait a moment and try again.', 'jetpack-paypal-payments' );
			case 500:
			case 502:
			case 503:
				return __( 'PayPal is temporarily unavailable. Please try again later.', 'jetpack-paypal-payments' );
			default:
				return sprintf(
					/* translators: 1: HTTP status code, 2: error name from PayPal */
					__( 'PayPal API error (HTTP %1$d): %2$s', 'jetpack-paypal-payments' ),
					$status_code,
					$error_message ?: $error_name
				);
		}
	}

	/**
	 * Sanitize and validate a PayPal resource ID.
	 *
	 * Expected format: PLB-XXXXXXXXXXXX (alphanumeric after PLB- prefix).
	 *
	 * @param string $resource_id The resource ID to validate.
	 * @return string|\WP_Error The sanitized ID, or WP_Error if invalid.
	 */
	private static function sanitize_resource_id( $resource_id ) {
		$resource_id = sanitize_text_field( $resource_id );

		if ( empty( $resource_id ) ) {
			return new \WP_Error(
				'paypal_invalid_resource_id',
				__( 'PayPal resource ID is required.', 'jetpack-paypal-payments' )
			);
		}

		// Validate format: PLB- followed by alphanumeric characters.
		if ( ! preg_match( '/^PLB-[A-Z0-9]+$/i', $resource_id ) ) {
			return new \WP_Error(
				'paypal_invalid_resource_id',
				sprintf(
					/* translators: %s: the invalid resource ID */
					__( 'Invalid PayPal resource ID format: %s. Expected format: PLB-XXXXXXXXXXXX.', 'jetpack-paypal-payments' ),
					$resource_id
				)
			);
		}

		return $resource_id;
	}
}
