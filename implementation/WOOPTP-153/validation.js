/**
 * PayPal Payment Buttons — Validation Utilities.
 *
 * Extracted from edit.js for testability. These functions validate
 * form inputs client-side before API submission and map API errors
 * to user-friendly messages.
 *
 * @package automattic/jetpack-paypal-payments
 * @since 0.8.0
 */

import { __ } from '@wordpress/i18n';

/**
 * Validation constants — match server-side limits.
 */
export const MAX_NAME_LENGTH = 127;
export const MAX_DESCRIPTION_LENGTH = 256;

/**
 * Set of valid ISO currency codes supported by PayPal.
 */
export const VALID_CURRENCY_CODES = new Set( [
	'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK',
	'NZD', 'SGD', 'HKD', 'MXN', 'BRL', 'PLN', 'CZK', 'HUF', 'ILS', 'MYR',
	'PHP', 'TWD', 'THB', 'INR', 'CNY', 'RUB',
] );

/**
 * Validate a price string.
 *
 * @param {string} value The price value.
 * @return {string|null} Error message or null if valid.
 */
export function validatePrice( value ) {
	if ( ! value || value.trim() === '' ) {
		return __( 'Price is required.', 'jetpack-paypal-payments' );
	}

	const num = parseFloat( value );
	if ( isNaN( num ) || num <= 0 ) {
		return __( 'Price must be a positive number.', 'jetpack-paypal-payments' );
	}

	// Check max 2 decimal places.
	if ( ! /^\d+(\.\d{1,2})?$/.test( value.trim() ) ) {
		return __( 'Price can have at most 2 decimal places (e.g., "29.99").', 'jetpack-paypal-payments' );
	}

	return null;
}

/**
 * Validate a product name.
 *
 * @param {string} value The product name.
 * @return {string|null} Error message or null if valid.
 */
export function validateProductName( value ) {
	if ( ! value || value.trim() === '' ) {
		return __( 'Product name is required.', 'jetpack-paypal-payments' );
	}

	if ( value.length > MAX_NAME_LENGTH ) {
		return __( `Product name must be ${ MAX_NAME_LENGTH } characters or fewer.`, 'jetpack-paypal-payments' );
	}

	return null;
}

/**
 * Validate a description (optional field).
 *
 * @param {string} value The description.
 * @return {string|null} Error message or null if valid.
 */
export function validateDescription( value ) {
	if ( value && value.length > MAX_DESCRIPTION_LENGTH ) {
		return __( `Description must be ${ MAX_DESCRIPTION_LENGTH } characters or fewer.`, 'jetpack-paypal-payments' );
	}

	return null;
}

/**
 * Map an API error response to a user-friendly message.
 *
 * The server-side already returns user-friendly messages, but this
 * provides client-side fallbacks for network errors and edge cases.
 *
 * @param {Object} err The error object from apiFetch.
 * @return {string} User-friendly error message.
 */
export function getUserFriendlyError( err ) {
	// Server already provides friendly messages — use them.
	if ( err.message ) {
		return err.message;
	}

	// Network-level errors (no response from server).
	if ( err.code === 'fetch_error' ) {
		return __(
			'Could not reach the server. Please check your internet connection and try again.',
			'jetpack-paypal-payments'
		);
	}

	return __( 'An unexpected error occurred. Please try again.', 'jetpack-paypal-payments' );
}
