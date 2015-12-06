require.config({
	baseUrl: '/scripts'
	, paths: {
		'jquery': 'vendor/jquery/dist/jquery.min'
		, 'ramda': 'vendor/ramda/dist/ramda.min'
		, 'pointfree': 'vendor/pointfree/dist/pointfree.amd'
		, 'future': 'data.future.umd'
		, 'bacon': 'vendor/bacon/dist/Bacon.min'
	}
	, shim: {
		jquery: {exports: '$'}
		, ramda: {exports: 'ramda'}
	}
});
require([
	'jquery',
	'app',
	'io'
], function ($, app, io) {
	'use strict';

	io.extendFn(); // globally alters Function's prototype
	$(app);
});
