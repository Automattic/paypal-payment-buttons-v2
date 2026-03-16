/**
 * Screenshot automation for WordPress.org plugin page.
 *
 * Captures the 5 screenshots defined in readme.txt == Screenshots ==.
 * Designed for wp-now (auto-authenticated) or a local WP instance.
 *
 * Usage:
 *   WP_BASE_URL=http://localhost:8889 npx playwright test take-screenshots.spec.js
 *
 * For standard WP login (not wp-now):
 *   WP_NEEDS_LOGIN=1 WP_BASE_URL=http://localhost:8882 npx playwright test take-screenshots.spec.js
 *
 * @package PayPal Payment Buttons V2
 */

const { test, expect } = require( '@playwright/test' );
const path = require( 'path' );

const BASE_URL = process.env.WP_BASE_URL || 'http://localhost:8889';
const NEEDS_LOGIN = process.env.WP_NEEDS_LOGIN === '1';
const ADMIN_USER = process.env.WP_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.WP_ADMIN_PASS || 'password';
const VIEWPORT = { width: 1200, height: 800 };
const OUTPUT_DIR = __dirname;

async function ensureLoggedIn( page ) {
	if ( ! NEEDS_LOGIN ) {
		return; // wp-now auto-authenticates.
	}
	await page.goto( `${ BASE_URL }/wp-login.php` );
	await page.fill( '#user_login', ADMIN_USER );
	await page.fill( '#user_pass', ADMIN_PASS );
	await page.click( '#wp-submit' );
	await page.waitForURL( /wp-admin/, { timeout: 15000 } );
}

async function dismissEditorModals( page ) {
	// Dismiss welcome modal.
	const closeBtn = page.locator( '.components-modal__header button[aria-label="Close"]' );
	if ( await closeBtn.isVisible( { timeout: 3000 } ).catch( () => false ) ) {
		await closeBtn.click();
	}
	// Also dismiss any "Choose a pattern" modal.
	const patternClose = page.locator( 'button[aria-label="Close"], .components-modal__header button' ).first();
	if ( await patternClose.isVisible( { timeout: 1000 } ).catch( () => false ) ) {
		await patternClose.click();
	}
}

async function insertPayPalBlock( page ) {
	await page.click( 'button[aria-label="Toggle block inserter"]' );
	await page.fill( 'input[placeholder="Search"]', 'PayPal' );
	await page.waitForTimeout( 500 );
	const blockBtn = page.locator( 'button:has-text("PayPal Payment Buttons")' ).first();
	await blockBtn.click();
	await page.waitForSelector( '.wp-block-jetpack-paypal-payment-buttons', { timeout: 10000 } );
}

test.describe( 'WordPress.org Plugin Screenshots', () => {
	test.use( { viewport: VIEWPORT } );
	test.setTimeout( 120000 );

	test( 'Screenshot 1: Connect PayPal — Wizard Credentials Step', async ( { page } ) => {
		await ensureLoggedIn( page );
		await page.goto( `${ BASE_URL }/wp-admin/post-new.php` );
		await page.waitForSelector( '.edit-post-visual-editor', { timeout: 30000 } );
		await dismissEditorModals( page );
		await insertPayPalBlock( page );

		// Navigate wizard: Welcome → Get Started.
		const getStarted = page.locator( 'button:has-text("Get Started")' );
		if ( await getStarted.isVisible( { timeout: 5000 } ).catch( () => false ) ) {
			await getStarted.click();
			await page.waitForTimeout( 500 );

			// Dashboard → Next/Continue/I have my credentials.
			const nextBtn = page.locator(
				'button:has-text("Next"), button:has-text("Continue"), button:has-text("I have my credentials")'
			).first();
			if ( await nextBtn.isVisible( { timeout: 3000 } ).catch( () => false ) ) {
				await nextBtn.click();
				await page.waitForTimeout( 500 );
			}
		}

		// Fill Client ID if the field is visible.
		const clientIdInput = page.locator(
			'input[placeholder*="Client ID"], input[aria-label*="Client ID"], input[aria-label*="client_id"]'
		).first();
		if ( await clientIdInput.isVisible( { timeout: 3000 } ).catch( () => false ) ) {
			await clientIdInput.fill( 'AXBOqFgtrx_-r_54BcViYWfAwr6wLsqwg1W9T816UK72' );
		}

		await page.waitForTimeout( 500 );

		await page.screenshot( {
			path: path.join( OUTPUT_DIR, 'screenshot-1-connect.png' ),
			fullPage: false,
		} );
	} );

	test( 'Screenshot 2: Create Button — Product Form', async ( { page } ) => {
		await ensureLoggedIn( page );
		await page.goto( `${ BASE_URL }/wp-admin/post-new.php` );
		await page.waitForSelector( '.edit-post-visual-editor', { timeout: 30000 } );
		await dismissEditorModals( page );
		await insertPayPalBlock( page );

		// If the block shows the wizard (not connected), take screenshot of whatever state.
		// If connected, we'll see the creation form.
		await page.waitForTimeout( 3000 );

		// Try to fill form fields if they're visible.
		const nameField = page.locator(
			'input[placeholder*="Widget"], input[placeholder*="Product"], input[aria-label*="Product Name"]'
		).first();
		if ( await nameField.isVisible( { timeout: 3000 } ).catch( () => false ) ) {
			await nameField.fill( 'Premium Widget' );
		}

		const priceField = page.locator(
			'input[placeholder*="29.99"], input[aria-label*="Price"]'
		).first();
		if ( await priceField.isVisible( { timeout: 2000 } ).catch( () => false ) ) {
			await priceField.fill( '29.99' );
		}

		await page.waitForTimeout( 300 );

		await page.screenshot( {
			path: path.join( OUTPUT_DIR, 'screenshot-2-create.png' ),
			fullPage: false,
		} );
	} );

	test( 'Screenshot 3: Live Preview — Editor with PayPal block', async ( { page } ) => {
		await ensureLoggedIn( page );

		// Try to open an existing post with a PayPal block.
		await page.goto( `${ BASE_URL }/wp-admin/edit.php` );
		await page.waitForTimeout( 2000 );

		const paypalPost = page.locator( 'a.row-title:has-text("PayPal")' ).first();
		if ( await paypalPost.isVisible( { timeout: 3000 } ).catch( () => false ) ) {
			await paypalPost.click();
		} else {
			// No demo post — create a new one with block markup via code editor.
			await page.goto( `${ BASE_URL }/wp-admin/post-new.php` );
			await page.waitForSelector( '.edit-post-visual-editor', { timeout: 30000 } );
			await dismissEditorModals( page );

			// Switch to code editor.
			// Open options menu.
			const optionsBtn = page.locator( 'button[aria-label="Options"]' );
			if ( await optionsBtn.isVisible( { timeout: 3000 } ).catch( () => false ) ) {
				await optionsBtn.click();
				const codeEditorBtn = page.locator( 'button:has-text("Code editor")' );
				if ( await codeEditorBtn.isVisible( { timeout: 2000 } ).catch( () => false ) ) {
					await codeEditorBtn.click();
				}
			}

			await page.waitForTimeout( 1000 );
			const codeArea = page.locator( '.editor-post-text-editor, textarea.wp-block-code' ).first();
			if ( await codeArea.isVisible( { timeout: 3000 } ).catch( () => false ) ) {
				await codeArea.fill(
					'<!-- wp:jetpack/paypal-payment-buttons {"isApiManaged":true,"resourceId":"PLB-3A6ADHXLFVSA","paymentLink":"https://www.paypal.com/ncp/payment/PLB-3A6ADHXLFVSA","productName":"Premium Widget","price":"29.99","currencyCode":"USD","productDescription":"A premium widget with all the features you need.","buttonType":"stacked"} /-->'
				);
			}

			// Switch back to visual editor.
			if ( await optionsBtn.isVisible( { timeout: 2000 } ).catch( () => false ) ) {
				await optionsBtn.click();
				const visualBtn = page.locator( 'button:has-text("Visual editor")' );
				if ( await visualBtn.isVisible( { timeout: 2000 } ).catch( () => false ) ) {
					await visualBtn.click();
				}
			}
		}

		await page.waitForSelector( '.wp-block-jetpack-paypal-payment-buttons', { timeout: 15000 } ).catch( () => {} );
		await page.click( '.wp-block-jetpack-paypal-payment-buttons' ).catch( () => {} );
		await page.waitForTimeout( 1000 );

		await page.screenshot( {
			path: path.join( OUTPUT_DIR, 'screenshot-3-preview.png' ),
			fullPage: false,
		} );
	} );

	test( 'Screenshot 4: Frontend — Published PayPal Button', async ( { page } ) => {
		await ensureLoggedIn( page );

		// First try to publish a post with a PayPal block via code editor.
		await page.goto( `${ BASE_URL }/wp-admin/post-new.php` );
		await page.waitForSelector( '.edit-post-visual-editor', { timeout: 30000 } );
		await dismissEditorModals( page );

		// Switch to code editor via keyboard shortcut.
		await page.keyboard.press( 'Control+Shift+Alt+M' );
		await page.waitForTimeout( 1000 );

		const codeArea = page.locator( '.editor-post-text-editor' );
		if ( await codeArea.isVisible( { timeout: 3000 } ).catch( () => false ) ) {
			await codeArea.fill(
				'<!-- wp:jetpack/paypal-payment-buttons {"isApiManaged":true,"resourceId":"PLB-3A6ADHXLFVSA","paymentLink":"https://www.paypal.com/ncp/payment/PLB-3A6ADHXLFVSA","productName":"Premium Widget","price":"29.99","currencyCode":"USD","productDescription":"A premium widget with all the features you need.","buttonType":"stacked"} /-->\n\n<!-- wp:paragraph -->\n<p>This is a demo PayPal payment button created with the Pay Links &amp; Buttons API.</p>\n<!-- /wp:paragraph -->'
			);
		}

		// Switch back to visual.
		await page.keyboard.press( 'Control+Shift+Alt+M' );
		await page.waitForTimeout( 1000 );

		// Set title.
		const titleField = page.locator( 'h1[aria-label="Add title"], [aria-label="Add title"]' ).first();
		if ( await titleField.isVisible( { timeout: 3000 } ).catch( () => false ) ) {
			await titleField.fill( 'PayPal Button — Stacked Layout' );
		}

		// Publish.
		const publishBtn = page.locator( 'button.editor-post-publish-button__button, button.editor-post-publish-panel__toggle' ).first();
		if ( await publishBtn.isVisible( { timeout: 3000 } ).catch( () => false ) ) {
			await publishBtn.click();
			await page.waitForTimeout( 1000 );

			// Confirm publish if there's a panel.
			const confirmBtn = page.locator( 'button.editor-post-publish-button' );
			if ( await confirmBtn.isVisible( { timeout: 3000 } ).catch( () => false ) ) {
				await confirmBtn.click();
			}

			// Wait for publish to complete.
			await page.waitForTimeout( 3000 );
		}

		// Get the post URL and visit it.
		const viewLink = page.locator( '.post-publish-panel__postpublish a' ).first();
		let postUrl = '';
		if ( await viewLink.isVisible( { timeout: 5000 } ).catch( () => false ) ) {
			postUrl = await viewLink.getAttribute( 'href' );
		}

		if ( postUrl ) {
			await page.goto( postUrl );
		} else {
			await page.goto( `${ BASE_URL }/?p=4` );
		}

		await page.waitForSelector( '.wp-block-jetpack-paypal-payment-buttons', { timeout: 10000 } ).catch( () => {} );
		await page.waitForTimeout( 500 );

		await page.screenshot( {
			path: path.join( OUTPUT_DIR, 'screenshot-4-frontend.png' ),
			fullPage: false,
		} );
	} );

	test( 'Screenshot 5: Stacked Layout — Close-up', async ( { page } ) => {
		// Navigate to the most recent post.
		await page.goto( `${ BASE_URL }/?p=4` );
		await page.waitForTimeout( 2000 );

		const buttonBlock = page.locator( '.wp-block-jetpack-paypal-payment-buttons' ).first();
		if ( await buttonBlock.isVisible( { timeout: 10000 } ).catch( () => false ) ) {
			await buttonBlock.screenshot( {
				path: path.join( OUTPUT_DIR, 'screenshot-5-stacked.png' ),
			} );
		} else {
			// Fallback: full page.
			await page.screenshot( {
				path: path.join( OUTPUT_DIR, 'screenshot-5-stacked.png' ),
				fullPage: false,
			} );
		}
	} );
} );
