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
	var site = vidGetSite(vid);
	var id = vidGetId(vid);

	siteHandlers[site].play(video);
}

function remove(vid) {
	videos[vid] = undefined;
	port.emit('update', toArray());
}

function save(tab) {
	const vid = urlToVid(tab.url);
	const title = tab.title;
	
	if (vid != undefined)
		const site = vidGetSite(vid);

	var siteHandler = siteHandlers[site];

	if (siteHandler != undefined) {
		siteHandler.port.on('time', function fun(args) {
			if (args.tab == tab) {
				video = new Video(vid, title, args.time);
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

// private functions

function urlToVid(url) {
	var urlComps = url.split("/");
	var domain = urlComps[2];
	
	for each (siteHandler in siteHandlers) {
		if (siteHandler.test(domain))
			return siteHandler.urlToVid(url);
	}
	return undefined;
}

function vidGetSite(vid) {
	return vid.slice(0, vid.indexOf("_"));
}

function vidGetId(vid) {
	return vid.slice(vid.indexOf("_") + 1, vid.length);
}

function toArray(){
	var array = [];
	for each (video in videos) {
		if (video != undefined)
			array.push(video);
	}
	return array;
}

function Video(vid, title, time) {
	this.vid = vid;
	this.title = title;
	this.time = time;
}

var siteHandlers = {};

/**
 * A SiteHandler manages the interaction with a specific video site.
*/
SiteHandler = function() {
	this.port = new events.EventEmitter();

	/**
	 * Opens a new tab and plays the video.
	 * @param {Video} video
	 *    The video to be played.
	*/
	this.play = function(video) {};

	/**
	 * Attempts to retrieve the current playback time of the video in tab `tab`.
	 * If successful, a `time` event will be emitted.
	 * @param {Tab} tab
	 *    The function looks for a video in this tab.
	*/
	this.retrieveTime = function(tab) {};

	/**
	 * Tests whether this SiteHandler is responsible for domain `domain`.
	 * @param {String} domain
	 *    The domain to be tested.
	*/
	this.test = function(domain) {};

	/**
	 * Takes a URL and returns a video ID (vid).
	 * @param {String} url
	 *    The URL from which a video ID is to be retrieved.
	*/
	this.urlToVid = function(url) {};
}

// Youtube
siteHandlers.youtube = new SiteHandler();

siteHandlers.youtube.play = function(video) {
	var site = 'youtube';
	var id = vidGetId(video.vid);
	var url = "https://www.youtube.com/watch?v=" + id;
		+ '&t=' + Math.floor(video.time) + 's';
	tabs.open(url);
};

siteHandlers.youtube.retrieveTime = function(tab) {
	worker = tab.attach({
		contentScriptFile: [
			data.url("jquery.js"),
			data.url("videoManagement/youtube.js")
		]
	})
	worker.port.on('time', function(time) {
		siteHandlers.youtube.port.emit('time', {tab : tab, time : time});
		worker.destroy();
	});
};

siteHandlers.youtube.test = function(domain) {
	const regex = /^(.*\.)?youtube.com$/;
	return regex.test(domain);
};

siteHandlers.youtube.urlToVid = function(url) {
	var site = "youtube";
	var begin = url.indexOf("v=") + 2;
	if (begin - 2 == -1) {
		return undefined;
	}
	var end = url.indexOf("&", begin);
	if (end < 0) {
		end = url.length;
	}
	var id = url.slice(begin, end);
	return site + '_' + id;
};

// Properties
exports.port = port;

// Methods
exports.play = play;
exports.remove = remove;
exports.save = save;
exports.update = update;
