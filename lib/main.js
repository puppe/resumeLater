const widgets = require("widget");
const panel = require("panel");
const tabs = require("tabs");
const data = require("self").data;

const vMan = require("videoManagement");
vMan.port.on('update', function(videos) {
	videoList.port.emit('update', videos);
});
vMan.port.on('not supported', function() {
	videoList.port.emit('not supported');
});

// The List Panel
var videoList = panel.Panel({
	width: 330,
	contentURL: data.url("panel/panel.html"),
	contentScriptWhen: 'ready',
	contentScriptFile: [
		data.url("jquery.js"),
		data.url("panel/panel.js")
	]
});

videoList.on('show', function() {vMan.update();});
videoList.port.on('save', function() {vMan.save(tabs.activeTab);});
videoList.port.on('remove', function(vid) {vMan.remove(vid);});
videoList.port.on('play', function(vid) {vMan.play(vid);});

var widget = widgets.Widget({
  id: "widget.resumeLater@mpuppe.de",
  label: "Resume Later",
  contentURL: data.url("widget/widget.png"),
  panel: videoList
});
