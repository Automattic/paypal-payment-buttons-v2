/**
 * PayPal Payment Buttons — Block Editor Component.
 *
 * Replaces the legacy paste-code textarea with an API-driven form UI.
 * When PayPal is connected, merchants fill in product details and create
 * buttons directly in the editor. Falls back to the paste-code interface
 * when PayPal is not connected.
 *
 * Updated for WOOPTP-150: Adds live button preview with edit/preview mode
 * toggle and PayPal-branded button rendering.
 *
 * @package automattic/jetpack-paypal-payments
 * @since 0.8.0
 */

import { __ } from '@wordpress/i18n';
import { useState, useEffect, useCallback } from '@wordpress/element';
import {
	Button,
	Notice,
	PanelBody,
	SelectControl,
	Spinner,
	TextControl,
	TextareaControl,
	ToolbarButton,
	ToolbarGroup,
} from '@wordpress/components';
import {
	BlockControls,
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';
import apiFetch from '@wordpress/api-fetch';
import PayPalButtonPreview from './paypal-button-preview';

/**
 * Supported currencies for the currency selector.
 * Matches PayPal_Attribute_Mapper::SUPPORTED_CURRENCIES on the server.
 */
const SUPPORTED_CURRENCIES = [
	{ label: 'USD — US Dollar', value: 'USD' },
	{ label: 'EUR — Euro', value: 'EUR' },
	{ label: 'GBP — British Pound', value: 'GBP' },
	{ label: 'CAD — Canadian Dollar', value: 'CAD' },
	{ label: 'AUD — Australian Dollar', value: 'AUD' },
	{ label: 'JPY — Japanese Yen', value: 'JPY' },
	{ label: 'CHF — Swiss Franc', value: 'CHF' },
	{ label: 'SEK — Swedish Krona', value: 'SEK' },
	{ label: 'NOK — Norwegian Krone', value: 'NOK' },
	{ label: 'DKK — Danish Krone', value: 'DKK' },
	{ label: 'NZD — New Zealand Dollar', value: 'NZD' },
	{ label: 'SGD — Singapore Dollar', value: 'SGD' },
	{ label: 'HKD — Hong Kong Dollar', value: 'HKD' },
	{ label: 'MXN — Mexican Peso', value: 'MXN' },
	{ label: 'BRL — Brazilian Real', value: 'BRL' },
	{ label: 'PLN — Polish Zloty', value: 'PLN' },
	{ label: 'CZK — Czech Koruna', value: 'CZK' },
	{ label: 'HUF — Hungarian Forint', value: 'HUF' },
	{ label: 'ILS — Israeli Shekel', value: 'ILS' },
	{ label: 'MYR — Malaysian Ringgit', value: 'MYR' },
	{ label: 'PHP — Philippine Peso', value: 'PHP' },
	{ label: 'TWD — Taiwan Dollar', value: 'TWD' },
	{ label: 'THB — Thai Baht', value: 'THB' },
	{ label: 'INR — Indian Rupee', value: 'INR' },
	{ label: 'CNY — Chinese Yuan', value: 'CNY' },
	{ label: 'RUB — Russian Ruble', value: 'RUB' },
];

/**
 * Button type options for the block display style.
 */
const BUTTON_TYPE_OPTIONS = [
	{ label: __( 'Stacked', 'jetpack-paypal-payments' ), value: 'stacked' },
	{ label: __( 'Single', 'jetpack-paypal-payments' ), value: 'single' },
];

/**
 * REST API base path for PayPal endpoints.
 */
const API_BASE = '/jetpack/v4/paypal';

/**
 * PayPal Payment Buttons edit component.
 *
 * @param {Object}   props               Block props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Function to update block attributes.
 * @return {JSX.Element} Block editor UI.
 */
export default function PayPalPaymentButtonsEdit( { attributes, setAttributes } ) {
	const {
		isApiManaged,
		buttonType,
		scriptSrc,
		hostedButtonId,
		buttonText,
		resourceId,
		paymentLink,
		productName,
		price,
		currencyCode,
		productDescription,
		returnUrl,
	} = attributes;

	const blockProps = useBlockProps();

	// Connection state.
	const [ isConnected, setIsConnected ] = useState( false );
	const [ environment, setEnvironment ] = useState( 'sandbox' );
	const [ connectionLoading, setConnectionLoading ] = useState( true );

	// Form state.
	const [ isCreating, setIsCreating ] = useState( false );
	const [ error, setError ] = useState( null );
	const [ successMessage, setSuccessMessage ] = useState( null );

	// Edit/preview mode toggle. Start in preview if button already exists.
	const [ isEditing, setIsEditing ] = useState( ! ( isApiManaged && resourceId && paymentLink ) );

	// Connect form state.
	const [ clientId, setClientId ] = useState( '' );
	const [ clientSecret, setClientSecret ] = useState( '' );
	const [ connectError, setConnectError ] = useState( null );
	const [ isConnecting, setIsConnecting ] = useState( false );

	/**
	 * Check PayPal connection status on mount.
	 */
	useEffect( () => {
		apiFetch( { path: `${ API_BASE }/connection` } )
			.then( ( response ) => {
				setIsConnected( response.connected );
				setEnvironment( response.environment );
			} )
			.catch( () => {
				setIsConnected( false );
			} )
			.finally( () => {
				setConnectionLoading( false );
			} );
	}, [] );

	/**
	 * Handle PayPal OAuth connection.
	 */
	const handleConnect = useCallback( () => {
		setConnectError( null );
		setIsConnecting( true );

		apiFetch( {
			path: `${ API_BASE }/connect`,
			method: 'POST',
			data: {
				client_id: clientId,
				client_secret: clientSecret,
				environment,
			},
		} )
			.then( ( response ) => {
				setIsConnected( response.connected );
				setEnvironment( response.environment );
				setClientId( '' );
				setClientSecret( '' );
			} )
			.catch( ( err ) => {
				setConnectError(
					err.message || __( 'Failed to connect PayPal account.', 'jetpack-paypal-payments' )
				);
			} )
			.finally( () => {
				setIsConnecting( false );
			} );
	}, [ clientId, clientSecret, environment ] );

	/**
	 * Handle PayPal disconnect.
	 */
	const handleDisconnect = useCallback( () => {
		apiFetch( {
			path: `${ API_BASE }/disconnect`,
			method: 'POST',
		} ).then( () => {
			setIsConnected( false );
		} );
	}, [] );

	/**
	 * Build the line_items payload from current attributes.
	 *
	 * @return {Object} API request data.
	 */
	const buildRequestData = useCallback( () => ( {
		type: 'BUY_NOW',
		integration_mode: 'LINK',
		reusable: 'MULTIPLE',
		line_items: [
			{
				name: productName,
				unit_amount: {
					currency_code: currencyCode || 'USD',
					value: price,
				},
				...( productDescription ? { description: productDescription } : {} ),
			},
		],
		...( returnUrl ? { return_url: returnUrl } : {} ),
	} ), [ productName, price, currencyCode, productDescription, returnUrl ] );

	/**
	 * Create a PayPal payment button via the API.
	 */
	const handleCreateButton = useCallback( () => {
		setError( null );
		setSuccessMessage( null );
		setIsCreating( true );

		apiFetch( {
			path: `${ API_BASE }/buttons`,
			method: 'POST',
			data: buildRequestData(),
		} )
			.then( ( response ) => {
				setAttributes( {
					isApiManaged: true,
					resourceId: response.id,
					paymentLink: response.payment_link,
				} );
				setSuccessMessage(
					__( 'PayPal button created successfully!', 'jetpack-paypal-payments' )
				);
				setIsEditing( false );
			} )
			.catch( ( err ) => {
				setError(
					err.message || __( 'Failed to create PayPal button.', 'jetpack-paypal-payments' )
				);
			} )
			.finally( () => {
				setIsCreating( false );
			} );
	}, [ buildRequestData, setAttributes ] );

	/**
	 * Update an existing PayPal payment button via the API.
	 */
	const handleUpdateButton = useCallback( () => {
		if ( ! resourceId ) {
			return;
		}

		setError( null );
		setSuccessMessage( null );
		setIsCreating( true );

		apiFetch( {
			path: `${ API_BASE }/buttons/${ resourceId }`,
			method: 'PUT',
			data: buildRequestData(),
		} )
			.then( ( response ) => {
				setAttributes( {
					paymentLink: response.payment_link || paymentLink,
				} );
				setSuccessMessage(
					__( 'PayPal button updated successfully!', 'jetpack-paypal-payments' )
				);
				setIsEditing( false );
			} )
			.catch( ( err ) => {
				setError(
					err.message || __( 'Failed to update PayPal button.', 'jetpack-paypal-payments' )
				);
			} )
			.finally( () => {
				setIsCreating( false );
			} );
	}, [ resourceId, buildRequestData, paymentLink, setAttributes ] );

	/**
	 * Delete the PayPal payment button via the API.
	 */
	const handleDeleteButton = useCallback( () => {
		if ( ! resourceId ) {
			return;
		}

		setError( null );
		setIsCreating( true );

		apiFetch( {
			path: `${ API_BASE }/buttons/${ resourceId }`,
			method: 'DELETE',
		} )
			.then( () => {
				setAttributes( {
					isApiManaged: false,
					resourceId: undefined,
					paymentLink: undefined,
				} );
				setIsEditing( true );
				setSuccessMessage(
					__( 'PayPal button deleted.', 'jetpack-paypal-payments' )
				);
			} )
			.catch( ( err ) => {
				setError(
					err.message || __( 'Failed to delete PayPal button.', 'jetpack-paypal-payments' )
				);
			} )
			.finally( () => {
				setIsCreating( false );
			} );
	}, [ resourceId, setAttributes ] );

	/**
	 * Check if the form has the minimum required fields to create a button.
	 */
	const isFormValid = productName && productName.trim() !== '' && price && parseFloat( price ) > 0;

	/**
	 * Whether the block has a created button to preview.
	 */
	const hasButton = isApiManaged && resourceId && paymentLink;

	// Loading state while checking connection.
	if ( connectionLoading ) {
		return (
			<div { ...blockProps }>
				<div className="jetpack-paypal-payment-buttons__loading">
					<Spinner />
					<p>{ __( 'Checking PayPal connection…', 'jetpack-paypal-payments' ) }</p>
				</div>
			</div>
		);
	}

	// Legacy paste-code block — render as-is without the new UI.
	if ( ! isApiManaged && ( scriptSrc || hostedButtonId ) ) {
		return (
			<div { ...blockProps }>
				<div className="jetpack-paypal-payment-buttons__legacy">
					<p>
						{ __( 'This PayPal button uses the legacy paste-code format.', 'jetpack-paypal-payments' ) }
					</p>
					<p>
						{ __( 'It will continue to work as-is on the frontend.', 'jetpack-paypal-payments' ) }
					</p>
				</div>
				<InspectorControls>
					<PanelBody title={ __( 'Button Settings', 'jetpack-paypal-payments' ) }>
						<SelectControl
							label={ __( 'Button Layout', 'jetpack-paypal-payments' ) }
							value={ buttonType }
							options={ BUTTON_TYPE_OPTIONS }
							onChange={ ( value ) => setAttributes( { buttonType: value } ) }
						/>
						<TextControl
							label={ __( 'Button Text', 'jetpack-paypal-payments' ) }
							value={ buttonText }
							onChange={ ( value ) => setAttributes( { buttonText: value } ) }
						/>
					</PanelBody>
				</InspectorControls>
			</div>
		);
	}

	// Not connected — show connection form.
	if ( ! isConnected ) {
		return (
			<div { ...blockProps }>
				<div className="jetpack-paypal-payment-buttons__connect">
					<h3>{ __( 'Connect PayPal', 'jetpack-paypal-payments' ) }</h3>
					<p>
						{ __(
							'Enter your PayPal API credentials to create buttons directly in the editor. You can find these in your PayPal Developer Dashboard under Apps & Credentials.',
							'jetpack-paypal-payments'
						) }
					</p>

					{ connectError && (
						<Notice status="error" isDismissible onDismiss={ () => setConnectError( null ) }>
							{ connectError }
						</Notice>
					) }

					<TextControl
						label={ __( 'Client ID', 'jetpack-paypal-payments' ) }
						value={ clientId }
						onChange={ setClientId }
						help={ __( 'From PayPal Developer Dashboard → Apps & Credentials.', 'jetpack-paypal-payments' ) }
					/>
					<TextControl
						label={ __( 'Client Secret', 'jetpack-paypal-payments' ) }
						value={ clientSecret }
						onChange={ setClientSecret }
						type="password"
					/>
					<SelectControl
						label={ __( 'Environment', 'jetpack-paypal-payments' ) }
						value={ environment }
						options={ [
							{ label: __( 'Sandbox (Testing)', 'jetpack-paypal-payments' ), value: 'sandbox' },
							{ label: __( 'Production (Live)', 'jetpack-paypal-payments' ), value: 'production' },
						] }
						onChange={ setEnvironment }
					/>
					<Button
						variant="primary"
						onClick={ handleConnect }
						isBusy={ isConnecting }
						disabled={ isConnecting || ! clientId || ! clientSecret }
					>
						{ isConnecting
							? __( 'Connecting…', 'jetpack-paypal-payments' )
							: __( 'Connect PayPal', 'jetpack-paypal-payments' )
						}
					</Button>
				</div>
			</div>
		);
	}

	// Toolbar controls for edit/preview toggle (only when button exists).
	const toolbarControls = hasButton ? (
		<BlockControls>
			<ToolbarGroup>
				<ToolbarButton
					icon="visibility"
					label={ __( 'Preview', 'jetpack-paypal-payments' ) }
					isPressed={ ! isEditing }
					onClick={ () => setIsEditing( false ) }
				/>
				<ToolbarButton
					icon="edit"
					label={ __( 'Edit', 'jetpack-paypal-payments' ) }
					isPressed={ isEditing }
					onClick={ () => setIsEditing( true ) }
				/>
			</ToolbarGroup>
		</BlockControls>
	) : null;

	// Inspector sidebar — always shown when connected.
	const inspectorControls = (
		<InspectorControls>
			<PanelBody title={ __( 'Button Settings', 'jetpack-paypal-payments' ) }>
				<SelectControl
					label={ __( 'Button Layout', 'jetpack-paypal-payments' ) }
					value={ buttonType }
					options={ BUTTON_TYPE_OPTIONS }
					onChange={ ( value ) => setAttributes( { buttonType: value } ) }
				/>
				<TextControl
					label={ __( 'Button Text', 'jetpack-paypal-payments' ) }
					value={ buttonText || '' }
					onChange={ ( value ) => setAttributes( { buttonText: value } ) }
				/>
			</PanelBody>

			{ hasButton && (
				<PanelBody
					title={ __( 'PayPal Connection', 'jetpack-paypal-payments' ) }
					initialOpen={ false }
				>
					<p>
						{ __( 'Resource ID:', 'jetpack-paypal-payments' ) }{ ' ' }
						<code>{ resourceId }</code>
					</p>
					<p>
						{ __( 'Environment:', 'jetpack-paypal-payments' ) }{ ' ' }
						<strong>{ environment }</strong>
					</p>
					<div style={ { display: 'flex', gap: '8px', marginTop: '12px' } }>
						<Button
							variant="secondary"
							isDestructive
							onClick={ handleDeleteButton }
							disabled={ isCreating }
						>
							{ __( 'Delete Button', 'jetpack-paypal-payments' ) }
						</Button>
						<Button
							variant="secondary"
							isDestructive
							onClick={ handleDisconnect }
						>
							{ __( 'Disconnect', 'jetpack-paypal-payments' ) }
						</Button>
					</div>
				</PanelBody>
			) }

			{ ! hasButton && (
				<PanelBody
					title={ __( 'PayPal Connection', 'jetpack-paypal-payments' ) }
					initialOpen={ false }
				>
					<p>
						{ __( 'Environment:', 'jetpack-paypal-payments' ) }{ ' ' }
						<strong>{ environment }</strong>
					</p>
					<Button
						variant="secondary"
						isDestructive
						onClick={ handleDisconnect }
					>
						{ __( 'Disconnect PayPal', 'jetpack-paypal-payments' ) }
					</Button>
				</PanelBody>
			) }
		</InspectorControls>
	);

	// Connected + has button + preview mode — show live button preview.
	if ( hasButton && ! isEditing ) {
		return (
			<div { ...blockProps }>
				{ toolbarControls }
				{ inspectorControls }

				<div className="jetpack-paypal-payment-buttons__preview">
					<div className="jetpack-paypal-payment-buttons__preview-status">
						<span className="jetpack-paypal-payment-buttons__status-dot jetpack-paypal-payment-buttons__status-dot--connected" />
						{ __( 'PayPal Connected', 'jetpack-paypal-payments' ) }
						{ environment === 'sandbox' && (
							<span className="jetpack-paypal-payment-buttons__sandbox-badge">
								{ __( 'Sandbox', 'jetpack-paypal-payments' ) }
							</span>
						) }
					</div>

					{ successMessage && (
						<Notice status="success" isDismissible onDismiss={ () => setSuccessMessage( null ) }>
							{ successMessage }
						</Notice>
					) }

					{ error && (
						<Notice status="error" isDismissible onDismiss={ () => setError( null ) }>
							{ error }
						</Notice>
					) }

					<PayPalButtonPreview
						buttonText={ buttonText }
						buttonType={ buttonType }
						productName={ productName }
						price={ price }
						currencyCode={ currencyCode }
						productDescription={ productDescription }
						paymentLink={ paymentLink }
					/>
				</div>
			</div>
		);
	}

	// Connected — edit mode (either creating new or editing existing).
	return (
		<div { ...blockProps }>
			{ toolbarControls }
			{ inspectorControls }

			<div className="jetpack-paypal-payment-buttons__create-form">
				<div className="jetpack-paypal-payment-buttons__preview-status">
					<span className="jetpack-paypal-payment-buttons__status-dot jetpack-paypal-payment-buttons__status-dot--connected" />
					{ __( 'PayPal Connected', 'jetpack-paypal-payments' ) }
					{ environment === 'sandbox' && (
						<span className="jetpack-paypal-payment-buttons__sandbox-badge">
							{ __( 'Sandbox', 'jetpack-paypal-payments' ) }
						</span>
					) }
				</div>

				<h3>
					{ hasButton
						? __( 'Edit PayPal Button', 'jetpack-paypal-payments' )
						: __( 'Create PayPal Button', 'jetpack-paypal-payments' )
					}
				</h3>

				{ error && (
					<Notice status="error" isDismissible onDismiss={ () => setError( null ) }>
						{ error }
					</Notice>
				) }

				{ successMessage && (
					<Notice status="success" isDismissible onDismiss={ () => setSuccessMessage( null ) }>
						{ successMessage }
					</Notice>
				) }

				<TextControl
					label={ __( 'Product Name', 'jetpack-paypal-payments' ) }
					value={ productName || '' }
					onChange={ ( value ) => setAttributes( { productName: value } ) }
					placeholder={ __( 'e.g., Premium Widget', 'jetpack-paypal-payments' ) }
				/>

				<div className="jetpack-paypal-payment-buttons__price-row">
					<TextControl
						label={ __( 'Price', 'jetpack-paypal-payments' ) }
						value={ price || '' }
						onChange={ ( value ) => setAttributes( { price: value } ) }
						type="number"
						min="0.01"
						step="0.01"
						placeholder="29.99"
					/>
					<SelectControl
						label={ __( 'Currency', 'jetpack-paypal-payments' ) }
						value={ currencyCode || 'USD' }
						options={ SUPPORTED_CURRENCIES }
						onChange={ ( value ) => setAttributes( { currencyCode: value } ) }
					/>
				</div>

				<TextareaControl
					label={ __( 'Description (optional)', 'jetpack-paypal-payments' ) }
					value={ productDescription || '' }
					onChange={ ( value ) => setAttributes( { productDescription: value } ) }
					help={ __( 'Shown to customers at checkout. Max 256 characters.', 'jetpack-paypal-payments' ) }
				/>

				<TextControl
					label={ __( 'Return URL (optional)', 'jetpack-paypal-payments' ) }
					value={ returnUrl || '' }
					onChange={ ( value ) => setAttributes( { returnUrl: value } ) }
					type="url"
					help={ __( 'Redirect customers here after payment.', 'jetpack-paypal-payments' ) }
				/>

				<div className="jetpack-paypal-payment-buttons__form-actions">
					<Button
						variant="primary"
						onClick={ hasButton ? handleUpdateButton : handleCreateButton }
						isBusy={ isCreating }
						disabled={ isCreating || ! isFormValid }
					>
						{ isCreating
							? __( 'Saving…', 'jetpack-paypal-payments' )
							: hasButton
								? __( 'Update Button', 'jetpack-paypal-payments' )
								: __( 'Create Button', 'jetpack-paypal-payments' )
						}
					</Button>

					{ hasButton && (
						<Button
							variant="tertiary"
							onClick={ () => setIsEditing( false ) }
						>
							{ __( 'Cancel', 'jetpack-paypal-payments' ) }
						</Button>
					) }
				</div>
			</div>
		</div>
	);
}
