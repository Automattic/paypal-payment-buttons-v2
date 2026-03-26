<?php
namespace Automattic\Jetpack\PaypalPayments;
if ( ! defined( 'ABSPATH' ) ) { exit( 0 ); }
class Assets_Stub {
	public static function register_script( $handle, $path, $file, $options = array() ) {
		$abspath = realpath( dirname( $file ) . '/' . $path );
		if ( ! $abspath || ! file_exists( $abspath ) ) { return; }
		$url = plugins_url( ltrim( str_replace( wp_normalize_path( WP_PLUGIN_DIR ), '', wp_normalize_path( $abspath ) ), '/' ) );
		$asset_file = preg_replace( '/\.js$/', '.asset.php', $abspath );
		$asset = file_exists( $asset_file ) ? require $asset_file : array( 'dependencies' => array(), 'version' => '0.8.0' );
		$deps = array_filter( $asset['dependencies'] ?? array(), function ( $dep ) {
			return wp_script_is( $dep, 'registered' ) || wp_script_is( $dep, 'enqueued' );
		} );
		wp_register_script( $handle, $url, $deps, $asset['version'] ?? '0.8.0', ! empty( $options['in_footer'] ) );
		if ( ! empty( $options['enqueue'] ) ) { wp_enqueue_script( $handle ); }
		if ( ! empty( $options['css_path'] ) ) {
			$css = realpath( dirname( $file ) . '/' . $options['css_path'] );
			if ( $css && file_exists( $css ) ) {
				wp_register_style( $handle, plugins_url( ltrim( str_replace( wp_normalize_path( WP_PLUGIN_DIR ), '', wp_normalize_path( $css ) ), '/' ) ), array(), $asset['version'] ?? '0.8.0' );
			}
		}
	}
	public static function alias_textdomains_from_file( $file ) {}
}
