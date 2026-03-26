/**
 * PayPal API mock for Playwright E2E tests.
 *
 * Intercepts WordPress REST API calls to /jetpack/v4/paypal/* and returns
 * deterministic responses. Avoids hitting real PayPal endpoints during tests.
 *
 * Uses a single route handler to avoid glob pattern conflicts (e.g., connect* matching connection*).
 *
 * @package
 * @since 0.8.0
 */

/**
 * Default mock PayPal API responses.
 */
const MOCK_RESPONSES = {
	connection: {
		connected: true,
		environment: 'sandbox',
	},
	connectionDisconnected: {
		connected: false,
		environment: 'sandbox',
	},
	connect: {
		connected: true,
		environment: 'sandbox',
		message: 'PayPal account connected successfully.',
	},
	disconnect: {
		connected: false,
		message: 'PayPal account disconnected.',
	},
	createButton: {
		id: 'PLB-TESTMOCK001',
		type: 'BUY_NOW',
		integration_mode: 'LINK',
		reusable: 'MULTIPLE',
		status: 'ACTIVE',
		payment_link: 'https://www.sandbox.paypal.com/ncp/payment/TESTMOCK001',
		line_items: [
			{
				name: 'Test Product',
				unit_amount: {
					currency_code: 'USD',
					value: '29.99',
				},
				quantity: '1',
			},
		],
	},
	updateButton: {
		id: 'PLB-TESTMOCK001',
		type: 'BUY_NOW',
		integration_mode: 'LINK',
		reusable: 'MULTIPLE',
		status: 'ACTIVE',
		payment_link: 'https://www.sandbox.paypal.com/ncp/payment/TESTMOCK001',
		line_items: [
			{
				name: 'Updated Product',
				unit_amount: {
					currency_code: 'USD',
					value: '39.99',
				},
				quantity: '1',
			},
		],
	},
	deleteButton: {
		deleted: true,
		resource_id: 'PLB-TESTMOCK001',
		message: 'Payment resource deleted successfully.',
	},
	error400: {
		code: 'paypal_api_invalid_request',
		message: 'Please fix the following: name is required',
		data: { status: 400 },
	},
	error403: {
		code: 'paypal_api_not_authorized',
		message: 'Your PayPal account is not authorized for Payment Links & Buttons.',
		data: { status: 403 },
	},
	error404: {
		code: 'paypal_api_resource_not_found',
		message: 'This PayPal button no longer exists.',
		data: { status: 404 },
	},
	connectError: {
		code: 'paypal_credentials_invalid',
		message: 'The Client ID or Client Secret is incorrect.',
		data: { status: 401 },
	},
};

/**
 * Set up PayPal API route mocks for a Playwright page.
 *
 * Uses a single glob route to avoid pattern conflicts.
 *
 * @param {import('@playwright/test').Page} page      - Playwright page.
 * @param {object}                          overrides - Optional response overrides keyed by route name.
 */
async function setupPayPalMocks( page, overrides = {} ) {
	const responses = { ...MOCK_RESPONSES, ...overrides };

	await page.route( '**/wp-json/jetpack/v4/paypal/**', ( route ) => {
		const url = route.request().url();
		const method = route.request().method();
		const path = new URL( url ).pathname;

		// GET /connection
		if ( path.endsWith( '/connection' ) ) {
			return route.fulfill( {
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify( responses.connection ),
			} );
		}

		// POST /connect
		if ( path.endsWith( '/connect' ) && method === 'POST' ) {
			const body = route.request().postDataJSON();
			if ( body?.client_id === 'bad_id' || body?.client_secret === 'bad_secret' ) {
				return route.fulfill( {
					status: 401,
					contentType: 'application/json',
					body: JSON.stringify( responses.connectError ),
				} );
			}
			return route.fulfill( {
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify( responses.connect ),
			} );
		}

		// POST /disconnect
		if ( path.endsWith( '/disconnect' ) ) {
			return route.fulfill( {
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify( responses.disconnect ),
			} );
		}

		// /buttons/PLB-* (single button operations)
		if ( path.match( /\/buttons\/PLB-/ ) ) {
			if ( method === 'PUT' ) {
				return route.fulfill( {
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify( responses.updateButton ),
				} );
			}
			if ( method === 'DELETE' ) {
				return route.fulfill( {
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify( responses.deleteButton ),
				} );
			}
			return route.fulfill( {
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify( responses.createButton ),
			} );
		}

		// /buttons (create or list)
		if ( path.endsWith( '/buttons' ) ) {
			if ( method === 'POST' ) {
				const body = route.request().postDataJSON();
				const response = {
					...responses.createButton,
					line_items: body?.line_items || responses.createButton.line_items,
				};
				if ( body?.line_items?.[ 0 ]?.name ) {
					response.line_items[ 0 ].name = body.line_items[ 0 ].name;
				}
				return route.fulfill( {
					status: 201,
					contentType: 'application/json',
					body: JSON.stringify( response ),
				} );
			}
			return route.fulfill( {
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify( { items: [], total_items: 0 } ),
			} );
		}

		// Unknown paypal route — pass through.
		route.continue();
	} );
}

/**
 * Set up disconnected state mock (PayPal not connected).
 *
 * @param {import('@playwright/test').Page} page - Playwright page.
 */
async function setupDisconnectedMocks( page ) {
	await setupPayPalMocks( page, {
		connection: MOCK_RESPONSES.connectionDisconnected,
	} );
}

module.exports = {
	MOCK_RESPONSES,
	setupPayPalMocks,
	setupDisconnectedMocks,
};
