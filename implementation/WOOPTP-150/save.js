/**
 * PayPal Payment Buttons — Save (Frontend Render) Component.
 *
 * Renders the PayPal payment button on the published page. For API-managed
 * blocks, renders a styled button linking to the PayPal payment URL. For
 * legacy paste-code blocks, renders the original script-based embed.
 *
 * @package automattic/jetpack-paypal-payments
 * @since 0.8.0
 */

import { useBlockProps } from '@wordpress/block-editor';

/**
 * Save component for the PayPal Payment Buttons block.
 *
 * @param {Object} props            Block props.
 * @param {Object} props.attributes Block attributes.
 * @return {JSX.Element} Rendered block for the frontend.
 */
export default function PayPalPaymentButtonsSave( { attributes } ) {
	const {
		isApiManaged,
		buttonType,
		scriptSrc,
		hostedButtonId,
		buttonText,
		paymentLink,
		productName,
		price,
		currencyCode,
		productDescription,
	} = attributes;

	const blockProps = useBlockProps.save();

	// API-managed V2 block — render styled button linking to PayPal payment URL.
	if ( isApiManaged && paymentLink ) {
		const isStacked = buttonType === 'stacked';

		return (
			<div { ...blockProps }>
				<div className="jetpack-paypal-button">
					{ /* Product info */ }
					<div className="jetpack-paypal-button__product">
						<span className="jetpack-paypal-button__product-name">
							{ productName }
						</span>
						{ productDescription && (
							<span className="jetpack-paypal-button__product-description">
								{ productDescription }
							</span>
						) }
						{ price && (
							<span className="jetpack-paypal-button__product-price">
								{ currencyCode } { price }
							</span>
						) }
					</div>

					{ /* PayPal button */ }
					<div
						className={ `jetpack-paypal-button__buttons jetpack-paypal-button__buttons--${ buttonType }` }
					>
						<a
							href={ paymentLink }
							className="jetpack-paypal-button__paypal-link"
							target="_blank"
							rel="noopener noreferrer"
						>
							{ buttonText || 'Pay Now' }
						</a>

						{ isStacked && (
							<a
								href={ paymentLink }
								className="jetpack-paypal-button__debit-link"
								target="_blank"
								rel="noopener noreferrer"
							>
								Debit or Credit Card
							</a>
						) }
					</div>
				</div>
			</div>
		);
	}

	// Legacy paste-code block — render the original script-based embed.
	if ( scriptSrc && hostedButtonId ) {
		return (
			<div { ...blockProps }>
				<div
					className={ `jetpack-paypal-button jetpack-paypal-button--legacy jetpack-paypal-button--${ buttonType }` }
					id={ hostedButtonId }
				/>
			</div>
		);
	}

	// Fallback — empty block (should not normally occur).
	return <div { ...blockProps } />;
}
