/*jshint esnext:true,strict:false*/
/*global exports*/
const events = require('myEvents.js');
const tabs = require('tabs');
const data = require("self").data;
var storage = require('simple-storage').storage;

// initialize storage

storage.videos = storage.videos || {};
var videos = storage.videos;

function toArray() {
	var array = [];
	for (var vid in videos) {
		if (videos.hasOwnProperty(vid)) {
			var video = videos[vid];
			if (video) {
				array.push(videos[vid]);
			}
		}
	}
	return array;
}

var port = new events.EventEmitter();
port.emit('update', toArray());

function vidGetSite(vid) {
	return vid.slice(0, vid.indexOf("_"));
}

function vidGetId(vid) {
	return vid.slice(vid.indexOf("_") + 1, vid.length);
}

function Video(vid, title, time) {
	this.vid = vid;
	this.title = title;
	this.time = time;
}

var siteHandlers = {};


function urlToVid(url) {
	var urlComps = url.split("/");
	var domain = urlComps[2];

	for (var siteId in siteHandlers) {
		if (siteHandlers.hasOwnProperty(siteId)) {
			var siteHandler = siteHandlers[siteId];
			if (siteHandler.test(domain)) {
				return siteHandler.urlToVid(url);
			}
		}
	}
	return undefined;
}

/**
 * A SiteHandler manages the interaction with a specific video site.
*/
function SiteHandler() {
	this.port = new events.EventEmitter();

	/**
	 * Opens a new tab and plays the video.
	 * @param {Video} video
	 *    The video to be played.
	*/
	this.play = function play(video) {};

	/**
	 * Attempts to retrieve the current playback time of the video in tab `tab`.
	 * If successful, a `time` event will be emitted.
	 * @param {Tab} tab
	 *    The function looks for a video in this tab.
	*/
	this.retrieveTime = function retrieveTime(tab) {};

	/**
	 * Tests whether this SiteHandler is responsible for domain `domain`.
	 * @param {String} domain
	 *    The domain to be tested.
	*/
	this.test = function test(domain) {};

	/**
	 * Takes a URL and returns a video ID (vid).
	 * @param {String} url
	 *    The URL from which a video ID is to be retrieved.
	*/
	this.urlToVid = function urlToVid(url) {};
}

// Youtube
siteHandlers.youtube = new SiteHandler();

siteHandlers.youtube.play = function play(video) {
	var site = 'youtube';
	var id = vidGetId(video.vid);
	var url = "https://www.youtube.com/watch?v=" + id +
		'&t=' + Math.floor(video.time) + 's';
	tabs.open(url);
};

siteHandlers.youtube.retrieveTime = function retrieveTime(tab) {
	var worker = tab.attach({
		contentScriptFile: [
			data.url("videoManagement/youtube.js")
		]
	});

	worker.port.on('time', function (time) {
		siteHandlers.youtube.port.emit('time', {tab : tab, time : time});
		worker.destroy();
	});
};

siteHandlers.youtube.test = function (domain) {
	const regex = /\.?youtube\.com$/;
	return regex.test(domain);
};

siteHandlers.youtube.urlToVid = function (url) {
	var site = "youtube";
	var begin = url.indexOf("v=") + 2;
	if (begin - 2 === -1) {
		return undefined;
	}
	var end = url.indexOf("&", begin);
	if (end < 0) {
		end = url.length;
	}
	var id = url.slice(begin, end);
	return site + '_' + id;
};

// exported

function play(vid) {
	var video = videos[vid];
	var site = vidGetSite(vid);
	var id = vidGetId(vid);

	siteHandlers[site].play(video);
}

function remove(vid) {
	delete videos[vid];
	port.emit('update', toArray());
}

function save(tab) {
	const vid = urlToVid(tab.url);
	const title = tab.title;
	var site;
	
	if (vid) {
		site = vidGetSite(vid);
	}

	var siteHandler = siteHandlers[site];

	if (siteHandler) {
		siteHandler.port.on('time', function fun(args) {
			if (args.tab === tab) {
				var video = new Video(vid, title, args.time);
				videos[video.vid] = video;
				port.emit('update', toArray());
				siteHandler.port.removeListener('time', fun);
			}
		});
		siteHandler.retrieveTime(tab);
	} else {
		port.emit('no video');
		return;
	}
}

function update() {
	port.emit('update', toArray());
}

// Properties
exports.port = port;

// Methods
exports.play = play;
exports.remove = remove;
exports.save = save;
exports.update = update;
// vim: set noet ts=2 sw=2 sts=0
