/**
 * Tests for the Tracks analytics helper.
 */

import { recordEvent } from '../../src/paypal-payment-buttons/tracks';

describe( 'tracks.recordEvent', () => {
	let originalTkq;

	beforeEach( () => {
		originalTkq = window._tkq;
		delete window._tkq;
	} );

	afterEach( () => {
		if ( originalTkq === undefined ) {
			delete window._tkq;
		} else {
			window._tkq = originalTkq;
		}
	} );

	it( 'pushes jetpack_-prefixed events to window._tkq', () => {
		recordEvent( 'jetpack_paypal_button_created', {
			currency: 'USD',
			has_variants: false,
		} );
		expect( Array.isArray( window._tkq ) ).toBe( true );
		expect( window._tkq ).toHaveLength( 1 );
		expect( window._tkq[ 0 ] ).toEqual( [
			'recordEvent',
			'jetpack_paypal_button_created',
			{ currency: 'USD', has_variants: false },
		] );
	} );

	it( 'defaults properties to an empty object when omitted', () => {
		recordEvent( 'jetpack_paypal_wizard_started' );
		expect( window._tkq[ 0 ] ).toEqual( [
			'recordEvent',
			'jetpack_paypal_wizard_started',
			{},
		] );
	} );

	it( 'appends to an existing _tkq queue without clobbering', () => {
		window._tkq = [ [ 'identify', { user: 'pre-existing' } ] ];
		recordEvent( 'jetpack_paypal_button_deleted', { environment: 'sandbox' } );
		expect( window._tkq ).toHaveLength( 2 );
		expect( window._tkq[ 1 ][ 0 ] ).toBe( 'recordEvent' );
	} );

	it( 'drops events that are not prefixed with jetpack_', () => {
		recordEvent( 'paypal_button_created', { currency: 'USD' } );
		expect( window._tkq ).toBeUndefined();
	} );

	it( 'no-ops silently for an empty event name', () => {
		recordEvent( '' );
		expect( window._tkq ).toBeUndefined();
	} );

	it( 'swallows errors if _tkq.push is not available', () => {
		window._tkq = {
			push: () => {
				throw new Error( 'blocked' );
			},
		};
		expect( () =>
			recordEvent( 'jetpack_paypal_connection_failed', { error_code: 'x' } )
		).not.toThrow();
	} );
} );
