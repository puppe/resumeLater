const widgets = require("widget");
const panel = require("panel");
const tabs = require("tabs");
const data = require("self").data;
const pb = require('private-browsing');
const _ = require('l10n').get;

const locale = (_("locale"));

const vMan = require("videoManagement");
vMan.port.on('update', function(videos) {
	videoList.port.emit('update', videos);
});
vMan.port.on('no video', function() {
	videoList.port.emit('no video');
});

// list panel
var panelLocale = data.url("panel/locale/" + locale + ".js");

var videoList = panel.Panel({
	width: 330,
	contentURL: data.url("panel/panel.html"),
	contentScriptWhen: 'ready',
	contentScriptFile: [
		data.url("jquery.js"),
		panelLocale,
		data.url("panel/l10n.js"),
		data.url("panel/panel.js")
	]
});


videoList.on('show', function() {vMan.update();});
videoList.port.on('save', function() {vMan.save(tabs.activeTab);});
videoList.port.on('remove', function(vid) {vMan.remove(vid);});
videoList.port.on('play', function(vid) {vMan.play(vid);});

// private browsing
pb.on('start', function() {videoList.port.emit('private browsing start')});
pb.on('stop', function() {videoList.port.emit('private browsing stop')});

// widget
var widget = widgets.Widget({
  id: "widget.resumeLater@mpuppe.de",
  label: "Resume Later",
  contentURL: data.url("widget/widget.png"),
  panel: videoList
});
