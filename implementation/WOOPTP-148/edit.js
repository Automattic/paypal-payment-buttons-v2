/**
 * PayPal Payment Buttons — Block Editor Component (API-driven V2)
 *
 * Replaces the legacy paste-code textarea with a fully API-driven flow:
 * 1. Check PayPal connection status
 * 2. Show Connect form if not connected
 * 3. Show product creation form when connected
 * 4. Create/update buttons via REST API → PayPal Pay Links & Buttons API
 * 5. Render preview after creation
 *
 * @package automattic/jetpack-paypal-payments
 * @since 0.7.0
 */

import { __ } from '@wordpress/i18n';
import { useEffect, useState, useCallback } from '@wordpress/element';
import {
	TextControl,
	SelectControl,
	Button,
	Placeholder,
	Spinner,
	Notice,
	PanelBody,
	PanelRow,
	ExternalLink,
	TextareaControl,
} from '@wordpress/components';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import apiFetch from '@wordpress/api-fetch';

/**
 * Supported currencies for PayPal Pay Links & Buttons API (Phase 1 subset).
 */
const CURRENCIES = [
	{ label: 'USD — US Dollar', value: 'USD' },
	{ label: 'EUR — Euro', value: 'EUR' },
	{ label: 'GBP — British Pound', value: 'GBP' },
	{ label: 'CAD — Canadian Dollar', value: 'CAD' },
	{ label: 'AUD — Australian Dollar', value: 'AUD' },
	{ label: 'JPY — Japanese Yen', value: 'JPY' },
	{ label: 'BRL — Brazilian Real', value: 'BRL' },
	{ label: 'MXN — Mexican Peso', value: 'MXN' },
	{ label: 'INR — Indian Rupee', value: 'INR' },
	{ label: 'CHF — Swiss Franc', value: 'CHF' },
];

/**
 * REST API base path for PayPal endpoints.
 */
const API_BASE = '/jetpack/v4/paypal';

/**
 * PayPal Payment Buttons Edit Component.
 *
 * @param {Object}   props               Block props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Attribute setter.
 * @return {import('react').ReactElement} The editor UI.
 */
export default function PayPalPaymentButtonsEdit( { attributes, setAttributes } ) {
	const {
		apiManaged,
		resourceId,
		paymentUrl,
		productName,
		price,
		currency,
		productDescription,
		buttonLabel,
		// Legacy attributes for backward compatibility.
		buttonType,
		scriptSrc,
		hostedButtonId,
	} = attributes;

	const blockProps = useBlockProps();

	// Connection state.
	const [ isConnected, setIsConnected ] = useState( null ); // null = loading
	const [ environment, setEnvironment ] = useState( 'sandbox' );

	// Connection form state.
	const [ clientId, setClientId ] = useState( '' );
	const [ clientSecret, setClientSecret ] = useState( '' );
	const [ connectError, setConnectError ] = useState( '' );
	const [ isConnecting, setIsConnecting ] = useState( false );

	// Button creation state.
	const [ isCreating, setIsCreating ] = useState( false );
	const [ createError, setCreateError ] = useState( '' );

	// Edit mode: when the button already exists but user wants to change fields.
	const [ isEditing, setIsEditing ] = useState( false );

	/**
	 * Check PayPal connection status on mount.
	 */
	useEffect( () => {
		apiFetch( { path: `${ API_BASE }/connection` } )
			.then( ( response ) => {
				setIsConnected( response.connected );
				if ( response.environment ) {
					setEnvironment( response.environment );
				}
			} )
			.catch( () => {
				setIsConnected( false );
			} );
	}, [] );

	/**
	 * Connect to PayPal using client credentials.
	 */
	const handleConnect = useCallback( async () => {
		setIsConnecting( true );
		setConnectError( '' );

		try {
			const response = await apiFetch( {
				path: `${ API_BASE }/connect`,
				method: 'POST',
				data: {
					client_id: clientId,
					client_secret: clientSecret,
					environment: 'sandbox',
				},
			} );

			setIsConnected( response.connected );
			setEnvironment( response.environment );
			setClientId( '' );
			setClientSecret( '' );
		} catch ( error ) {
			setConnectError(
				error.message || __( 'Failed to connect to PayPal.', 'jetpack-paypal-payments' )
			);
		} finally {
			setIsConnecting( false );
		}
	}, [ clientId, clientSecret ] );

	/**
	 * Disconnect from PayPal.
	 */
	const handleDisconnect = useCallback( async () => {
		try {
			await apiFetch( {
				path: `${ API_BASE }/disconnect`,
				method: 'POST',
			} );
			setIsConnected( false );
		} catch ( error ) {
			// Silently handle — connection check will update state.
		}
	}, [] );

	/**
	 * Create a PayPal button via the REST API.
	 */
	const handleCreateButton = useCallback( async () => {
		setIsCreating( true );
		setCreateError( '' );

		try {
			const response = await apiFetch( {
				path: `${ API_BASE }/buttons`,
				method: 'POST',
				data: {
					type: 'BUY_NOW',
					integration_mode: 'LINK',
					reusable: 'MULTIPLE',
					line_items: [
						{
							name: productName,
							description: productDescription || undefined,
							unit_amount: {
								currency_code: currency,
								value: price,
							},
						},
					],
				},
			} );

			setAttributes( {
				apiManaged: true,
				resourceId: response.id,
				paymentUrl: response.payment_link,
			} );
			setIsEditing( false );
		} catch ( error ) {
			setCreateError(
				error.message || __( 'Failed to create PayPal button.', 'jetpack-paypal-payments' )
			);
		} finally {
			setIsCreating( false );
		}
	}, [ productName, productDescription, price, currency, setAttributes ] );

	/**
	 * Update an existing PayPal button via the REST API.
	 */
	const handleUpdateButton = useCallback( async () => {
		setIsCreating( true );
		setCreateError( '' );

		try {
			const response = await apiFetch( {
				path: `${ API_BASE }/buttons/${ resourceId }`,
				method: 'PUT',
				data: {
					type: 'BUY_NOW',
					integration_mode: 'LINK',
					reusable: 'MULTIPLE',
					line_items: [
						{
							name: productName,
							description: productDescription || undefined,
							unit_amount: {
								currency_code: currency,
								value: price,
							},
						},
					],
				},
			} );

			setAttributes( {
				paymentUrl: response.payment_link || paymentUrl,
			} );
			setIsEditing( false );
		} catch ( error ) {
			setCreateError(
				error.message || __( 'Failed to update PayPal button.', 'jetpack-paypal-payments' )
			);
		} finally {
			setIsCreating( false );
		}
	}, [ productName, productDescription, price, currency, resourceId, paymentUrl, setAttributes ] );

	/**
	 * Delete the PayPal button and reset block to creation state.
	 */
	const handleDeleteButton = useCallback( async () => {
		try {
			await apiFetch( {
				path: `${ API_BASE }/buttons/${ resourceId }`,
				method: 'DELETE',
			} );
		} catch ( error ) {
			// Continue with reset even if delete fails — the button may already be gone.
		}

		setAttributes( {
			apiManaged: false,
			resourceId: '',
			paymentUrl: '',
			productName: '',
			price: '',
			currency: 'USD',
			productDescription: '',
			buttonLabel: 'Buy Now',
		} );
		setIsEditing( false );
	}, [ resourceId, setAttributes ] );

	/**
	 * Validate that the product form is ready for submission.
	 *
	 * @return {boolean} True if form is valid.
	 */
	const isFormValid = () => {
		if ( ! productName || ! productName.trim() ) {
			return false;
		}
		if ( ! price || isNaN( parseFloat( price ) ) || parseFloat( price ) <= 0 ) {
			return false;
		}
		return true;
	};

	// ─── Loading state ───
	if ( isConnected === null ) {
		return (
			<div { ...blockProps }>
				<Placeholder
					icon="paypal"
					label={ __( 'PayPal Payment Buttons', 'jetpack-paypal-payments' ) }
				>
					<Spinner />
				</Placeholder>
			</div>
		);
	}

	// ─── Legacy block: render a notice but don't break it ───
	if ( ! apiManaged && ( buttonType || hostedButtonId || scriptSrc ) ) {
		return (
			<div { ...blockProps }>
				<Placeholder
					icon="paypal"
					label={ __( 'PayPal Payment Button (Legacy)', 'jetpack-paypal-payments' ) }
				>
					<p>
						{ __(
							'This button was created with the paste-code method and will continue to work. To use the new API-driven flow, delete this block and add a new PayPal Payment Buttons block.',
							'jetpack-paypal-payments'
						) }
					</p>
				</Placeholder>
			</div>
		);
	}

	// ─── Not connected: show connection form ───
	if ( ! isConnected ) {
		return (
			<div { ...blockProps }>
				<Placeholder
					icon="paypal"
					label={ __( 'PayPal Payment Buttons', 'jetpack-paypal-payments' ) }
					instructions={ __(
						'Connect your PayPal account to create payment buttons directly in the editor.',
						'jetpack-paypal-payments'
					) }
				>
					<div className="paypal-connect-form">
						{ connectError && (
							<Notice status="error" isDismissible={ false }>
								{ connectError }
							</Notice>
						) }
						<TextControl
							label={ __( 'Client ID', 'jetpack-paypal-payments' ) }
							value={ clientId }
							onChange={ setClientId }
							placeholder="AWxR..."
							help={ __(
								'Find this in your PayPal Developer Dashboard under Apps & Credentials.',
								'jetpack-paypal-payments'
							) }
						/>
						<TextControl
							label={ __( 'Client Secret', 'jetpack-paypal-payments' ) }
							value={ clientSecret }
							onChange={ setClientSecret }
							type="password"
							placeholder="EL1t..."
						/>
						<div className="paypal-connect-form__actions">
							<Button
								variant="primary"
								onClick={ handleConnect }
								isBusy={ isConnecting }
								disabled={ isConnecting || ! clientId.trim() || ! clientSecret.trim() }
							>
								{ isConnecting
									? __( 'Connecting…', 'jetpack-paypal-payments' )
									: __( 'Connect PayPal', 'jetpack-paypal-payments' ) }
							</Button>
							<ExternalLink href="https://developer.paypal.com/dashboard/applications">
								{ __( 'Get API credentials', 'jetpack-paypal-payments' ) }
							</ExternalLink>
						</div>
					</div>
				</Placeholder>
			</div>
		);
	}

	// ─── Connected but no button created yet (or editing) ───
	if ( ! apiManaged || isEditing ) {
		const isUpdate = apiManaged && isEditing;

		return (
			<div { ...blockProps }>
				<InspectorControls>
					<PanelBody
						title={ __( 'PayPal Connection', 'jetpack-paypal-payments' ) }
						initialOpen={ false }
					>
						<PanelRow>
							<span>
								{ __( 'Status:', 'jetpack-paypal-payments' ) }{ ' ' }
								<strong>{ __( 'Connected', 'jetpack-paypal-payments' ) }</strong>
							</span>
						</PanelRow>
						<PanelRow>
							<span>
								{ __( 'Environment:', 'jetpack-paypal-payments' ) }{ ' ' }
								<strong>{ environment }</strong>
							</span>
						</PanelRow>
						<PanelRow>
							<Button variant="secondary" isDestructive onClick={ handleDisconnect }>
								{ __( 'Disconnect PayPal', 'jetpack-paypal-payments' ) }
							</Button>
						</PanelRow>
					</PanelBody>
				</InspectorControls>

				<Placeholder
					icon="paypal"
					label={
						isUpdate
							? __( 'Edit PayPal Button', 'jetpack-paypal-payments' )
							: __( 'Create PayPal Button', 'jetpack-paypal-payments' )
					}
				>
					<div className="paypal-button-form">
						{ createError && (
							<Notice status="error" isDismissible={ false }>
								{ createError }
							</Notice>
						) }
						<TextControl
							label={ __( 'Product Name', 'jetpack-paypal-payments' ) }
							value={ productName }
							onChange={ ( value ) => setAttributes( { productName: value } ) }
							placeholder={ __( 'e.g. Premium WordPress Theme', 'jetpack-paypal-payments' ) }
							required
						/>
						<div className="paypal-button-form__price-row">
							<TextControl
								label={ __( 'Price', 'jetpack-paypal-payments' ) }
								value={ price }
								onChange={ ( value ) => setAttributes( { price: value } ) }
								type="number"
								min="0.01"
								step="0.01"
								placeholder="29.99"
								required
							/>
							<SelectControl
								label={ __( 'Currency', 'jetpack-paypal-payments' ) }
								value={ currency }
								options={ CURRENCIES }
								onChange={ ( value ) => setAttributes( { currency: value } ) }
							/>
						</div>
						<TextareaControl
							label={ __( 'Description (optional)', 'jetpack-paypal-payments' ) }
							value={ productDescription }
							onChange={ ( value ) => setAttributes( { productDescription: value } ) }
							placeholder={ __(
								'A short description shown to buyers at checkout.',
								'jetpack-paypal-payments'
							) }
							rows={ 2 }
						/>
						<TextControl
							label={ __( 'Button Label', 'jetpack-paypal-payments' ) }
							value={ buttonLabel }
							onChange={ ( value ) => setAttributes( { buttonLabel: value } ) }
							placeholder="Buy Now"
						/>
						<div className="paypal-button-form__actions">
							<Button
								variant="primary"
								onClick={ isUpdate ? handleUpdateButton : handleCreateButton }
								isBusy={ isCreating }
								disabled={ isCreating || ! isFormValid() }
							>
								{ isCreating
									? __( 'Saving…', 'jetpack-paypal-payments' )
									: isUpdate
										? __( 'Update Button', 'jetpack-paypal-payments' )
										: __( 'Create Button', 'jetpack-paypal-payments' ) }
							</Button>
							{ isUpdate && (
								<Button variant="tertiary" onClick={ () => setIsEditing( false ) }>
									{ __( 'Cancel', 'jetpack-paypal-payments' ) }
								</Button>
							) }
						</div>
					</div>
				</Placeholder>
			</div>
		);
	}

	// ─── API-managed button created: show preview ───
	return (
		<div { ...blockProps }>
			<InspectorControls>
				<PanelBody
					title={ __( 'PayPal Connection', 'jetpack-paypal-payments' ) }
					initialOpen={ false }
				>
					<PanelRow>
						<span>
							{ __( 'Status:', 'jetpack-paypal-payments' ) }{ ' ' }
							<strong>{ __( 'Connected', 'jetpack-paypal-payments' ) }</strong>
						</span>
					</PanelRow>
					<PanelRow>
						<span>
							{ __( 'Environment:', 'jetpack-paypal-payments' ) }{ ' ' }
							<strong>{ environment }</strong>
						</span>
					</PanelRow>
				</PanelBody>
				<PanelBody
					title={ __( 'Button Settings', 'jetpack-paypal-payments' ) }
					initialOpen={ true }
				>
					<PanelRow>
						<span>
							{ __( 'Product:', 'jetpack-paypal-payments' ) }{ ' ' }
							<strong>{ productName }</strong>
						</span>
					</PanelRow>
					<PanelRow>
						<span>
							{ __( 'Price:', 'jetpack-paypal-payments' ) }{ ' ' }
							<strong>
								{ price } { currency }
							</strong>
						</span>
					</PanelRow>
					<PanelRow>
						<span>
							{ __( 'Resource ID:', 'jetpack-paypal-payments' ) }{ ' ' }
							<code>{ resourceId }</code>
						</span>
					</PanelRow>
					<PanelRow>
						<Button variant="secondary" onClick={ () => setIsEditing( true ) }>
							{ __( 'Edit Button', 'jetpack-paypal-payments' ) }
						</Button>
					</PanelRow>
					<PanelRow>
						<Button variant="secondary" isDestructive onClick={ handleDeleteButton }>
							{ __( 'Delete Button', 'jetpack-paypal-payments' ) }
						</Button>
					</PanelRow>
				</PanelBody>
			</InspectorControls>

			<div className="paypal-button-preview">
				<div className="paypal-button-preview__product">
					<span className="paypal-button-preview__name">{ productName }</span>
					<span className="paypal-button-preview__price">
						{ price } { currency }
					</span>
				</div>
				<div className="paypal-button-preview__button-wrapper">
					<button type="button" className="paypal-button-preview__button" disabled>
						{ buttonLabel || __( 'Buy Now', 'jetpack-paypal-payments' ) }
					</button>
					<div className="paypal-button-preview__powered-by">
						<img
							src="https://www.paypalobjects.com/images/Debit_Credit_APM.svg"
							alt={ __( 'Accepted payment methods', 'jetpack-paypal-payments' ) }
						/>
						<span>
							{ __( 'Powered by', 'jetpack-paypal-payments' ) }{ ' ' }
							<img
								src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg"
								alt="PayPal"
								className="paypal-button-preview__paypal-logo"
							/>
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
