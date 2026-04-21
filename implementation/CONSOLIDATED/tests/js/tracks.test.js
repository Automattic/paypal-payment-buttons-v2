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

	it( 'pushes to window._tkq with recordEvent verb and payload', () => {
		recordEvent( 'paypal_button_created', { currency: 'USD', has_variants: false } );
		expect( Array.isArray( window._tkq ) ).toBe( true );
		expect( window._tkq ).toHaveLength( 1 );
		expect( window._tkq[ 0 ] ).toEqual( [
			'recordEvent',
			'paypal_button_created',
			{ currency: 'USD', has_variants: false },
		] );
	} );

	it( 'defaults properties to an empty object when omitted', () => {
		recordEvent( 'paypal_wizard_started' );
		expect( window._tkq[ 0 ] ).toEqual( [ 'recordEvent', 'paypal_wizard_started', {} ] );
	} );

	it( 'appends to an existing _tkq queue without clobbering', () => {
		window._tkq = [ [ 'identify', { user: 'pre-existing' } ] ];
		recordEvent( 'paypal_button_deleted', { environment: 'sandbox' } );
		expect( window._tkq ).toHaveLength( 2 );
		expect( window._tkq[ 1 ][ 0 ] ).toBe( 'recordEvent' );
	} );

	it( 'no-ops silently for an empty event name', () => {
		recordEvent( '' );
		expect( window._tkq ).toBeUndefined();
	} );

	it( 'swallows errors if _tkq.push is not available', () => {
		// Replace _tkq with an object whose push throws.
		window._tkq = { push: () => { throw new Error( 'blocked' ); } };
		expect( () => recordEvent( 'paypal_connection_failed', { error_code: 'x' } ) ).not.toThrow();
	} );
} );
