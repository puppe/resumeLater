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

/*jshint esnext:true,strict:false*/
const widgets = require("widget");
const panel = require("panel");
const tabs = require("tabs");
const data = require("self").data;
const pb = require('private-browsing');
const prefs = require("preferences-service");
const _ = require('l10n').get;

const locale = (_("locale"));
const vMan = require("videoManagement");

// Sets a default value of a preference if it does not exist
function setPrefIfNotExist(name, value) {
	const root = "extensions.resumelater.";
	if (!prefs.has(root + name)) {
		prefs.set(root + name, value);
	}
}


// list panel
var panelLocale = data.url("panel/locale/" + locale + ".js");

var videoList = panel.Panel({
	width: 330,
	height: 500,
	contentURL: data.url("panel/panel.html"),
	contentScriptWhen: 'ready',
	contentScriptFile: [
		panelLocale,
		data.url("panel/l10n.js"),
		data.url("panel/panel.js")
	]
});

videoList.on('show', function () {
	vMan.update();
});

videoList.port.on('save', function () {
	vMan.save(tabs.activeTab);
});

videoList.port.on('remove', function (vid) {
	vMan.remove(vid);
});

videoList.port.on('play', function (vid) {
	vMan.play(vid);
});

vMan.port.on('update', function (videos) {
	videoList.port.emit('update', videos);
});

vMan.port.on('no video', function () {
	videoList.port.emit('no video');
});


// private browsing
pb.on('start', function () {
	videoList.port.emit('private browsing start');
});

pb.on('stop', function () {
	videoList.port.emit('private browsing stop');
});

// widget
var widget = widgets.Widget({
	id: "widget.resumeLater@mpuppe.de",
	label: "Resume Later",
	contentURL: data.url("widget/widget.png"),
	panel: videoList
});

exports.main = function (options, callbacks) {
	// Setting the default values of our preferences
	setPrefIfNotExist("oneVideoPerPlaylist", false);
};

// vim: set noet ts=2 sw=2 sts=0
