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
	
	switch (site) {
		case 'youtube':
			youtube.play(video);
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
		const site = vidGetSite(vid);

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
	
	var vid;
	
	if (youtube.test(domain)) {
		vid = youtube.urlToVid(url);
	} else {
		vid = undefined;
	}
	return vid;
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

youtube = {

	play : function(video) {
		var site = 'youtube';
		var id = vidGetId(video.vid);
		var url = "https://www.youtube.com/watch?v=" + id
			+ '&t=' + Math.floor(video.time) + 's';
		tabs.open(url);
	},

	test : function(domain) {
		const regex = /^(.*\.)?youtube.com$/;
		return regex.test(domain);
	},

	urlToVid : function(url) {
		var site = "youtube";
		var begin = url.indexOf("v=") + 2;
		var end = url.indexOf("&", begin);
		if (end < 0) {
			end = url.length;
		}
		var id = url.slice(begin, end);
		return site + '_' + id;
	}

}


// Properties
exports.port = port;

// Methods
exports.play = play;
exports.remove = remove;
exports.save = save;
exports.update = update;
