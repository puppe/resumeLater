const defaultLocale = {
	'remove?' : 'Remove this video?',
	'Okay' : 'Okay',
	'Cancel' : 'Cancel',
	'private browsing' : 'Saving is disabled in private browsing mode.',
	'not supported' : 'This site is not supported!'
};

if (locale == undefined) {
	var locale = {};
}

function _(id) {
	return locale[id] || defaultLocale[id];
}
