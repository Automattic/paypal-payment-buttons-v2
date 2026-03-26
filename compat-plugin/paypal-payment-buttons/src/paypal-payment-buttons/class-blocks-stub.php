<?php
namespace Automattic\Jetpack\PaypalPayments;
if ( ! defined( 'ABSPATH' ) ) { exit( 0 ); }
class Blocks_Stub {
	public static function jetpack_register_block( $dir, $options = array() ) {
		$metadata_file = $dir . '/block.json';
		if ( ! file_exists( $metadata_file ) ) { return false; }
		$args = array();
		if ( ! empty( $options['render_callback'] ) ) { $args['render_callback'] = $options['render_callback']; }
		return register_block_type( $metadata_file, $args );
	}
}
