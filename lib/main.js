/*
Copyright © 2012,2013 Martin Puppe

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
/*globals exports*/

const widgets = require('sdk/widget');
const panel = require('sdk/panel');
const tabs = require('sdk/tabs');
const data = require('sdk/self').data;
const _ = require('sdk/l10n').get;
const simpleStorage = require('sdk/simple-storage').storage;

const simplePrefs = require('sdk/simple-prefs');

const sites = require('./sites');

const VideoStorage = require('./videos').VideoStorage;
var videoStorage = new VideoStorage(simpleStorage, simplePrefs);

// list panel
var locale = (_("locale"));
if (locale === "locale") {
	locale = 'en';
}
var panelLocale = data.url("panel/locale/" + locale + ".js");

var videoList = panel.Panel({
	width: 330,
	height: simplePrefs.prefs.videoListHeight,
	contentURL: data.url("panel/panel.html"),
	contentScriptWhen: 'ready',
	contentScriptFile: [
		panelLocale,
		data.url("panel/l10n.js"),
		data.url("panel/panel.js")
	]
});

function resizeVideoList() {
	videoList.resize(330, simplePrefs.prefs.videoListHeight);
}

simplePrefs.on('videoListHeight', resizeVideoList);

videoList.on('show', function () {
	videoList.port.emit('update', videoStorage.getAll());
});

videoList.port.on('save', function () {
	sites.getVideo(tabs.activeTab).then(function success(video) {
		videoStorage.add(video);
	}, function failure(error) {
		videoList.port.emit('no video');
	});
});

videoList.port.on('remove', function (vid) {
	videoStorage.remove(vid);
});

videoList.port.on('play', function (vid) {
	sites.resumeVideo(videoStorage.get(vid));
});

videoStorage.on('update', function () {
	videoList.port.emit('update', videoStorage.getAll());
});

// widget
var widget = widgets.Widget({
	id: "widget.resumeLater@mpuppe.de",
	label: "Resume Later",
	contentURL: data.url("widget/widget.png"),
	panel: videoList
});

// vim: set noet ts=2 sw=2 sts=0
