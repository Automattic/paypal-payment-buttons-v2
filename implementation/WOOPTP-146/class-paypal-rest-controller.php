<?php
/**
 * REST API controller for PayPal Payment Buttons.
 *
 * Provides endpoints for PayPal OAuth connection management
 * and PayPal Pay Links & Buttons API operations.
 *
 * @package automattic/jetpack-paypal-payments
 * @since 0.7.0
 */

namespace Automattic\Jetpack\PaypalPayments;

if ( ! defined( 'ABSPATH' ) ) {
	exit( 0 );
}

use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * Class PayPal_REST_Controller
 *
 * Registers and handles WordPress REST API endpoints for
 * PayPal OAuth connection and button management.
 */
class PayPal_REST_Controller {

	/**
	 * REST API namespace.
	 *
	 * @var string
	 */
	const REST_NAMESPACE = 'jetpack/v4';

	/**
	 * REST API route base for PayPal operations.
	 *
	 * @var string
	 */
	const ROUTE_BASE = '/paypal';

	/**
	 * Register REST API routes.
	 *
	 * @return void
	 */
	public static function register_routes() {
		// Connection management.
		register_rest_route(
			self::REST_NAMESPACE,
			self::ROUTE_BASE . '/connect',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( __CLASS__, 'handle_connect' ),
					'permission_callback' => array( __CLASS__, 'manage_options_permission_check' ),
					'args'                => array(
						'client_id'     => array(
							'required'          => true,
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
							'validate_callback' => array( __CLASS__, 'validate_non_empty_string' ),
							'description'       => __( 'PayPal OAuth client ID.', 'jetpack-paypal-payments' ),
						),
						'client_secret' => array(
							'required'          => true,
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
							'validate_callback' => array( __CLASS__, 'validate_non_empty_string' ),
							'description'       => __( 'PayPal OAuth client secret.', 'jetpack-paypal-payments' ),
						),
						'environment'   => array(
							'required'          => false,
							'type'              => 'string',
							'default'           => 'sandbox',
							'enum'              => array( 'sandbox', 'production' ),
							'sanitize_callback' => 'sanitize_text_field',
							'description'       => __( 'PayPal environment: sandbox or production.', 'jetpack-paypal-payments' ),
						),
					),
				),
			)
		);

		// Connection status.
		register_rest_route(
			self::REST_NAMESPACE,
			self::ROUTE_BASE . '/connection',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'handle_connection_status' ),
					'permission_callback' => array( __CLASS__, 'manage_options_permission_check' ),
				),
			)
		);

		// Disconnect.
		register_rest_route(
			self::REST_NAMESPACE,
			self::ROUTE_BASE . '/disconnect',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( __CLASS__, 'handle_disconnect' ),
					'permission_callback' => array( __CLASS__, 'manage_options_permission_check' ),
				),
			)
		);

		// Environment switch.
		register_rest_route(
			self::REST_NAMESPACE,
			self::ROUTE_BASE . '/environment',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( __CLASS__, 'handle_set_environment' ),
					'permission_callback' => array( __CLASS__, 'manage_options_permission_check' ),
					'args'                => array(
						'environment' => array(
							'required'          => true,
							'type'              => 'string',
							'enum'              => array( 'sandbox', 'production' ),
							'sanitize_callback' => 'sanitize_text_field',
							'description'       => __( 'PayPal environment: sandbox or production.', 'jetpack-paypal-payments' ),
						),
					),
				),
			)
		);
	}

	/**
	 * Permission check: current user can manage_options.
	 *
	 * @return bool|WP_Error True if permitted, WP_Error otherwise.
	 */
	public static function manage_options_permission_check() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return new WP_Error(
				'rest_forbidden',
				__( 'You do not have permission to manage PayPal settings.', 'jetpack-paypal-payments' ),
				array( 'status' => 403 )
			);
		}

		return true;
	}

	/**
	 * Validate that a string parameter is non-empty.
	 *
	 * @param string          $value   The value to validate.
	 * @param WP_REST_Request $request The REST request.
	 * @param string          $param   The parameter name.
	 * @return bool|WP_Error True if valid, WP_Error otherwise.
	 */
	public static function validate_non_empty_string( $value, $request, $param ) {
		if ( ! is_string( $value ) || '' === trim( $value ) ) {
			return new WP_Error(
				'rest_invalid_param',
				sprintf(
					/* translators: %s: parameter name */
					__( 'The %s parameter must be a non-empty string.', 'jetpack-paypal-payments' ),
					$param
				),
				array( 'status' => 400 )
			);
		}

		return true;
	}

	/**
	 * Handle POST /paypal/connect — store credentials and validate via token exchange.
	 *
	 * @param WP_REST_Request $request The REST request.
	 * @return WP_REST_Response|WP_Error Response on success, WP_Error on failure.
	 */
	public static function handle_connect( WP_REST_Request $request ) {
		$client_id     = $request->get_param( 'client_id' );
		$client_secret = $request->get_param( 'client_secret' );
		$environment   = $request->get_param( 'environment' );

		// Set environment first so token exchange uses the right base URL.
		PayPal_OAuth::set_environment( $environment );

		// Store the credentials.
		$stored = PayPal_OAuth::store_credentials( $client_id, $client_secret );
		if ( ! $stored ) {
			return new WP_Error(
				'paypal_credentials_storage_failed',
				__( 'Failed to store PayPal credentials.', 'jetpack-paypal-payments' ),
				array( 'status' => 500 )
			);
		}

		// Validate by attempting a token exchange.
		$validation = PayPal_OAuth::validate_credentials();
		if ( is_wp_error( $validation ) ) {
			// Credentials are invalid — remove them.
			PayPal_OAuth::delete_credentials();

			return new WP_Error(
				'paypal_credentials_invalid',
				sprintf(
					/* translators: %s: error message from PayPal */
					__( 'PayPal credential validation failed: %s', 'jetpack-paypal-payments' ),
					$validation->get_error_message()
				),
				array( 'status' => 401 )
			);
		}

		return new WP_REST_Response(
			array(
				'connected'   => true,
				'environment' => PayPal_OAuth::get_environment(),
				'message'     => __( 'PayPal account connected successfully.', 'jetpack-paypal-payments' ),
			),
			200
		);
	}

	/**
	 * Handle GET /paypal/connection — return current connection status.
	 *
	 * @param WP_REST_Request $request The REST request.
	 * @return WP_REST_Response Response with connection status.
	 */
	public static function handle_connection_status( WP_REST_Request $request ) {
		return new WP_REST_Response(
			PayPal_OAuth::get_connection_status(),
			200
		);
	}

	/**
	 * Handle POST /paypal/disconnect — remove credentials and cached token.
	 *
	 * @param WP_REST_Request $request The REST request.
	 * @return WP_REST_Response Response confirming disconnection.
	 */
	public static function handle_disconnect( WP_REST_Request $request ) {
		PayPal_OAuth::disconnect();

		return new WP_REST_Response(
			array(
				'connected' => false,
				'message'   => __( 'PayPal account disconnected.', 'jetpack-paypal-payments' ),
			),
			200
		);
	}

	/**
	 * Handle POST /paypal/environment — switch between sandbox and production.
	 *
	 * @param WP_REST_Request $request The REST request.
	 * @return WP_REST_Response|WP_Error Response on success, WP_Error on failure.
	 */
	public static function handle_set_environment( WP_REST_Request $request ) {
		$environment = $request->get_param( 'environment' );

		$updated = PayPal_OAuth::set_environment( $environment );

		return new WP_REST_Response(
			array(
				'environment' => PayPal_OAuth::get_environment(),
				'message'     => sprintf(
					/* translators: %s: environment name (sandbox or production) */
					__( 'PayPal environment set to %s. Cached token has been cleared.', 'jetpack-paypal-payments' ),
					$environment
				),
			),
			200
		);
	}
}
