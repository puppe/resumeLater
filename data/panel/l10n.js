var l10n = (function (locale) {
	const defaultLocale = {
		'remove?' : 'Remove this video?',
		'Okay' : 'Okay',
		'Cancel' : 'Cancel',
		'private browsing' : 'Saving is disabled in private browsing mode.',
		'no video' : 'Cannot find video!'
	};

	if (locale == undefined) {
		var locale = {};
	}

	function _(id) {
		return locale[id] || defaultLocale[id];
	}

	return _;
}) (locale);
	// vim: set noet ts=2 sw=2 sts=0
