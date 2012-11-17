/*jshint esnext:true*/
/*global locale:true*/

var l10n = (function (locale) {
	'use strict';

	const defaultLocale = {
		'remove?' : 'Remove this video?',
		'Okay' : 'Okay',
		'Cancel' : 'Cancel',
		'private browsing' : 'Saving is disabled in private browsing mode.',
		'no video' : 'Cannot find video!'
	};

	locale = locale || {};

	function _(id) {
		return locale[id] || defaultLocale[id];
	}

	return _;
}) (locale);
	// vim: set noet ts=2 sw=2 sts=0
