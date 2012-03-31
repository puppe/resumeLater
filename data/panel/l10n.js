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
