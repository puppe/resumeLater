/*
Copyright © 2012 Martin Puppe

This file is part of resumeLater.

resumeLater is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

resumeLater is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with resumeLater. If not, see <http://www.gnu.org/licenses/>.
*/

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
