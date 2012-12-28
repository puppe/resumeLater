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
/*global exports*/
const events = require('myEvents.js');
const tabs = require('tabs');
const data = require("self").data;
const prefs = require("preferences-service");
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

function Video(vid, title, time, playlistId) {
	this.vid = vid;
	this.title = title;
	this.time = time;
	this.playlistId = playlistId; // The playlist ID of the video (based on the
	                              // video URL) or "null" if the video is not
	                              // part of a playlist
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

// Calls the "urlToPlaylistId" method of a responsible SiteHandler. It returns
// either the playlist ID of the video or "null" if the video is not part of a
// playlist.
// Note: The code of this function is very similar to the "urlToVid" function
// and should be merged somehow, someday with this function ;)
function urlToPlaylistId(url) {
	var urlComps = url.split("/");
	var domain = urlComps[2];

	for (var siteId in siteHandlers) {
		if (siteHandlers.hasOwnProperty(siteId)) {
			var siteHandler = siteHandlers[siteId];
			if (siteHandler.test(domain)) {
				return siteHandler.urlToPlaylistId(url);
			}
		}
	}
	return null;
}

// Removes all saved Videos with the specified playlist ID from the Storage.
function removeVideosInPlaylist(playlistId) {
	if (playlistId == null) return;
	var videoArray = toArray();
	for (var vid in videoArray) {
		var video = videoArray[vid];
		if (video.playlistId == playlistId) {
			remove(video.vid);
		}
	}
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
	
	/**
	 * Takes a URL and returns a playlist ID (playlistId).
	 * @param {String} url
	 *    The URL from which a playlist ID is to be retrieved.
	*/
	this.urlToPlaylistId = function urlToPlaylistId(url) {};
}

// Youtube
siteHandlers.youtube = new SiteHandler();

siteHandlers.youtube.play = function play(video) {
	var site = 'youtube';
	var id = vidGetId(video.vid);
	var url = "https://www.youtube.com/watch?v=" + id +
		'&t=' + Math.floor(video.time) + 's';
		
	// Adds the playlist parameter to the URL if the video is part of a
	// playlist
	if (video.playlistId != null) url += "&list=" + video.playlistId;
	
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

// Parses the YouTube video URL and returns the playlist ID of the video (or
// "null" if no "list" parameter was found i. e. the video is not part of a
// playlist)
siteHandlers.youtube.urlToPlaylistId = function (url) {
	const LIST_PARAM = "list=";
	
	var listPos = url.indexOf(LIST_PARAM);
	var begin = null;
	var end = null;
	
	if (listPos == -1) return null; // No "list" parameter found -> Not part of
	                                // a playlist
	begin = listPos + LIST_PARAM.length;
	end = url.indexOf("&", begin);
	if (end < 0) end = url.length;
	return url.slice(begin, end);
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
	var playlistId = urlToPlaylistId(tab.url);
	
	// If this is "true", old videos of the same playlist will be removed from
	// the storage
	var oneVideoPerPlaylist = prefs.get("extensions.resumelater.oneVideoPerPlaylist", false); 
	
	if (vid) {
		site = vidGetSite(vid);
	}

	var siteHandler = siteHandlers[site];

	if (siteHandler) {
		siteHandler.port.on('time', function fun(args) {
			if (args.tab === tab) {
				var video = new Video(vid, title, args.time, playlistId);
				if (oneVideoPerPlaylist) {
					removeVideosInPlaylist(playlistId);
				}
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
