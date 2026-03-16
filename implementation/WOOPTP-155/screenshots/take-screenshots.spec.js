/**
 * Screenshot automation for WordPress.org plugin page.
 *
 * Captures the 5 screenshots defined in readme.txt == Screenshots ==.
 * Run against a WordPress instance with the PayPal Payment Buttons plugin active
 * and demo data loaded (see playground-blueprint.json).
 *
 * Usage:
 *   WP_BASE_URL=http://localhost:8889 npx playwright test take-screenshots.spec.js
 *
 * Output: PNG files in the current directory, named screenshot-1.png through screenshot-5.png.
 *
 * @package PayPal Payment Buttons V2
 */

const { test, expect } = require( '@playwright/test' );

const BASE_URL = process.env.WP_BASE_URL || 'http://localhost:8889';
const ADMIN_USER = process.env.WP_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.WP_ADMIN_PASS || 'password';

const VIEWPORT = { width: 1200, height: 800 };

// Log in to WordPress admin.
async function login( page ) {
	await page.goto( `${ BASE_URL }/wp-login.php` );
	await page.fill( '#user_login', ADMIN_USER );
	await page.fill( '#user_pass', ADMIN_PASS );
	await page.click( '#wp-submit' );
	await page.waitForURL( /wp-admin/ );
}

// Navigate to a new post and add the PayPal block.
async function addPayPalBlock( page ) {
	await page.goto( `${ BASE_URL }/wp-admin/post-new.php` );

	// Wait for editor to load.
	await page.waitForSelector( '.edit-post-visual-editor', { timeout: 15000 } );

	// Dismiss any welcome modal.
	const welcomeModal = page.locator( '.components-modal__header button[aria-label="Close"]' );
	if ( await welcomeModal.isVisible( { timeout: 2000 } ).catch( () => false ) ) {
		await welcomeModal.click();
	}

	// Open block inserter and add PayPal block.
	await page.click( 'button[aria-label="Toggle block inserter"]' );
	await page.fill( 'input[placeholder="Search"]', 'PayPal' );
	await page.click( 'button:has-text("PayPal Payment Buttons")' );

	// Wait for the block to appear.
	await page.waitForSelector( '.wp-block-jetpack-paypal-payment-buttons', { timeout: 10000 } );
}

test.describe( 'WordPress.org Plugin Screenshots', () => {
	test.use( { viewport: VIEWPORT } );

	test( 'Screenshot 1: Connect PayPal — Wizard Credentials Step', async ( { page } ) => {
		await login( page );
		await addPayPalBlock( page );

		// Navigate wizard: Welcome → Dashboard → Credentials
		await page.click( 'button:has-text("Get Started")' );
		await page.waitForSelector( 'button:has-text("I have my credentials")', { timeout: 5000 } );
		await page.click( 'button:has-text("I have my credentials")' );

		// Wait for credential fields.
		await page.waitForSelector( 'input[aria-label="Client ID"]', { timeout: 5000 } );

		// Fill in realistic-looking credentials.
		await page.fill( 'input[aria-label="Client ID"]', 'AXBOqFgtrx_-r_54BcViYWfAwr6wLsqwg1W9T816UK72' );
		await page.fill( 'input[aria-label="Client Secret"]', 'EJVcn22Mvwc07PP3OzUEn5aCOQ8DYvqQ8cbNGgrW' );

		await page.screenshot( {
			path: 'screenshot-1-connect.png',
			fullPage: false,
		} );
	} );

	test( 'Screenshot 2: Create Button — Product Form', async ( { page } ) => {
		await login( page );
		await addPayPalBlock( page );

		// Wait for connection check to complete and form to appear.
		// This assumes credentials are pre-stored (via blueprint or manual setup).
		await page.waitForSelector( 'text=Create PayPal Button', { timeout: 10000 } );

		// Fill in product details.
		const nameField = page.locator( 'input[aria-label="Product Name"]' );
		if ( await nameField.isVisible() ) {
			await nameField.fill( 'Premium Widget' );
		}

		const priceField = page.locator( 'input[aria-label="Price"]' );
		if ( await priceField.isVisible() ) {
			await priceField.fill( '29.99' );
		}

		const descField = page.locator( 'textarea[aria-label="Description"]' );
		if ( await descField.isVisible() ) {
			await descField.fill( 'A premium widget with all the features you need.' );
		}

		await page.screenshot( {
			path: 'screenshot-2-create.png',
			fullPage: false,
		} );
	} );

	test( 'Screenshot 3: Live Preview — Editor Preview After Creation', async ( { page } ) => {
		await login( page );

		// Open an existing demo post with a PayPal button.
		await page.goto( `${ BASE_URL }/wp-admin/edit.php` );
		await page.click( 'a:has-text("PayPal Button — Stacked Layout")' );

		// Wait for the editor and the block preview to load.
		await page.waitForSelector( '.wp-block-jetpack-paypal-payment-buttons', { timeout: 15000 } );

		// Click the PayPal block to select it (shows sidebar controls).
		await page.click( '.wp-block-jetpack-paypal-payment-buttons' );

		// Wait a moment for sidebar to populate.
		await page.waitForTimeout( 1000 );

		await page.screenshot( {
			path: 'screenshot-3-preview.png',
			fullPage: false,
		} );
	} );

	test( 'Screenshot 4: Frontend — Published PayPal Button', async ( { page } ) => {
		// View the published post (no login needed for frontend).
		await page.goto( `${ BASE_URL }/paypal-stacked/` );

		// Wait for the button to render.
		await page.waitForSelector( '.wp-block-jetpack-paypal-payment-buttons', { timeout: 10000 } );

		await page.screenshot( {
			path: 'screenshot-4-frontend.png',
			fullPage: false,
		} );
	} );

	test( 'Screenshot 5: Stacked Layout — Close-up', async ( { page } ) => {
		await page.goto( `${ BASE_URL }/paypal-stacked/` );

		// Wait for the button component.
		const buttonBlock = page.locator( '.wp-block-jetpack-paypal-payment-buttons' );
		await buttonBlock.waitFor( { timeout: 10000 } );

		// Take a cropped screenshot of just the button component.
		await buttonBlock.screenshot( {
			path: 'screenshot-5-stacked.png',
		} );
	} );
} );
