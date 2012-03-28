const events = require('myEvents.js');
const tabs = require('tabs');
const data = require("self").data;
var storage = require('simple-storage').storage;

var port = new events.EventEmitter();

// initialize storage

var videos;
if (storage.videos == undefined) {
	storage.videos = {};
}
videos = storage.videos;
port.emit('update', toArray());

// exported functions

function play(vid) {
	var video = videos[vid];
	var site = vid.slice(0, vid.indexOf("_"));
	var id = vid.slice(vid.indexOf("_") + 1, vid.length);
	
	switch (site) {
		case 'youtube':
			var url = vidToUrl(video.vid);
			url = url + '&t=' + Math.floor(video.time) + 's';
			tabs.open(url);
			break;
	}
}

function remove(vid) {
	videos[vid] = undefined;
	port.emit('update', toArray());
}

function save(tab) {
	const vid = urlToVid(tab.url);
	const title = tab.title;
	
	if (vid != undefined)
		const site = vid.slice(0, vid.indexOf("_"));

	var script = data.url("videoManagement/");
	
	switch (site) {
		case "youtube":
			script = script + "youtube.js";
			break;
		default:
			port.emit('not supported');
			return;
	}

	worker = tab.attach({
		contentScriptFile: [
			data.url("jquery.js"),
			script
		]
	})
	worker.port.on('time', function(time) {
		video = new Video(vid, title, time);
		videos[video.vid] = video;
		port.emit('update', toArray());
	});
}

function update() {
	port.emit('update', toArray());
}

// private functions

function urlToVid(url) {
	var urlComps = url.split("/");
	var domain = urlComps[2];
	
	var site = "";
	var id = "";
	
	var youtube = /^(.*\.)?youtube.com$/
	if (youtube.test(domain)) {
		site = "youtube";
		var begin = url.indexOf("v=") + 2;
		var end = url.indexOf("&", begin);
		if (end < 0) {
			end = url.length;
		}
		id = url.slice(begin, end);
	} else return undefined;
	return site + "_" + id;
}

function vidToUrl(vid) {
	var separator = vid.indexOf("_");
	var site = vid.slice(0, separator);
	var id = vid.slice(separator + 1, vid.length);
	var url;
	switch (site) {
		case "youtube":
			url = "https://www.youtube.com/watch?v=" + id;
			break;
	}
	return url;
}

function toArray(){
	var array = [];
	for each (video in videos) {
		if (video != undefined)
			array.push(video);
	}
	return array;
}

function toString() {
	return JSON.stringify(videos, null, "\t");
}

function Video(vid, title, time) {
	this.vid = vid;
	this.title = title;
	this.time = time;
	
	this.equals = function(other) {
		return this.vid == other.vid;
	}
	
	this.toString = function() {
		return JSON.stringify(me, null, "\t");
	}
}


// Properties
exports.port = port;

// Methods
exports.play = play;
exports.remove = remove;
exports.save = save;
exports.update = update;
