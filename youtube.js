/*
Copyright © 2012-2017 Martin Puppe

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

/*global exports*/
'use strict';

/*
const data = require('sdk/self').data;
const setTimeout = require('sdk/timers').setTimeout;
const tabs = require('sdk/tabs');

const videos = require('../videos');
*/

var data = {};
var setTimeout = {};
var tabs = {};

var videos = {};

function VideoNotFoundError(message) {
    this.name = 'VideoNotFoundError';
    this.message = message || 'No video was found.';
}
VideoNotFoundError.prototype = new Error();
VideoNotFoundError.prototype.constructor = VideoNotFoundError;

function getParameters(url) {
    var splits = url.split('?');

    if (splits.length === 1) {
        return {};
    }

    var queryString = splits[splits.length - 1];
    splits = queryString.split('&');
    var params = {};
    var keyValue;
    for (var i = 0, l = splits.length; i < l; i++) {
        keyValue = splits[i].split('=');
        params[keyValue[0]] = keyValue[1];
    }

    return params;
}

function getTime(tab) {
    var promise = new Promise(function(resolve, reject) {

        var worker = tab.attach({
            contentScriptFile: [
                data.url("sites/youtube.js")
            ]
        });

        worker.port.on('time', function(time) {
            resolve(time);
            worker.destroy();
        });

        setTimeout(function() {
            reject(new VideoNotFoundError());
        }, 1000);
    });

    return promise;
}

function getVideo(tab) {
    const video = {};
    video.title = tab.title;

    var params = getParameters(tab.url);
    if (params.v) {
        video.vid = 'youtube_' + params.v;
    } else {
        return Promise.reject(new VideoNotFoundError());
    }
    if (params.list) {
        video.playlistId = params.list;
    }

    return getTime(tab).then(function success(time) {
        video.time = time;
        return video;
    });
}

function resumeVideo(video) {
    var site = 'youtube';
    var id = videos.getId(video);
    var url = "https://www.youtube.com/watch?v=" + id +
        '&t=' + Math.floor(video.time) + 's';

    // Adds the playlist parameter to the URL if the video is part of a
    // playlist
    if (video.playlistId) {
        url += "&list=" + video.playlistId;
    }

    tabs.open(url);
}

(function () {
    return "Hello, World!";
})();
