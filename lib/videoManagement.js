const events = require('myEvents.js');
const tabs = require('tabs');
const data = require("self").data;

let port = new events.EventEmitter();

let videos = new VideoContainer();

function play(vid) {
	let video = videos.lookup(vid);
	let site = vid.slice(0, vid.indexOf("_"));
	let id = vid.slice(vid.indexOf("_") + 1, vid.length);
	
	switch (site) {
		case 'youtube':
			let url = vidToUrl(video.vid);
			url = url + '&t=' + Math.floor(video.time) + 's';
			tabs.open(url);
			break;
	}
}

function remove(vid) {
	videos.remove(vid);
	port.emit('update', videos.toArray());
}

function save(tab) {
	const vid = urlToVid(tab.url);
	const title = tab.title;
	
	if (vid != undefined)
		const site = vid.slice(0, vid.indexOf("_"));

	let script = data.url("videoManagement/");
	
	switch (site) {
		case "youtube":
			script = script + "youtube.js";
			break;
		default:
			script = script + "notSupported.js";
	}

	worker = tab.attach({
		contentScriptFile: [
			data.url("jquery.js"),
			script
		]
	})
	worker.port.on('time', function(time) {
		video = new Video(vid, title, time);
		videos.update(video);
		port.emit('update', videos.toArray());
	});
}

function urlToVid(url) {
	let urlComps = url.split("/");
	let domain = urlComps[2];
	
	let site = "";
	let id = "";
	
	let youtube = /^(.*\.)?youtube.com$/
	if (youtube.test(domain)) {
		site = "youtube";
		let begin = url.indexOf("v=") + 2;
		let end = url.indexOf("&", begin);
		if (end < 0) {
			end = url.length;
		}
		id = url.slice(begin, end);
	} else return undefined;
	return site + "_" + id;
}

function vidToUrl(vid) {
	let separator = vid.indexOf("_");
	let site = vid.slice(0, separator);
	let id = vid.slice(separator + 1, vid.length);
	let url;
	switch (site) {
		case "youtube":
			url = "https://www.youtube.com/watch?v=" + id;
			break;
	}
	return url;
}

function Video(vid, title, time) {
	let me = this;
	
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

function VideoContainer() {
	let me = this;

	let videos = {}
	
	this.remove = function remove(vid) {
		videos[vid] = undefined;
	}
	
	this.update = function(video) {
		videos[video.vid] = video;
	}
	
	this.contains = function(video) {
		return !(videos[video.vid] == undefined);
	}
	
	this.lookup = function(vid) {
		return videos[vid];
	}
	
	this.toArray = function() {
		let array = [];
		for each (video in videos) {
			if (video != undefined)
				array.push(video);
		}
		return array;
	}
	
	this.toString = function() {
		return JSON.stringify(videos, null, "\t");
	}
}

/* Properties */
exports.port = port;

/* Methods */
exports.play = play;
exports.remove = remove;
exports.save = save;
