/*
Copyright © 2012-2020 Martin Puppe

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

/* globals browser, videos */

// jshint -W098
const youtube = (function (videos) {
// jshint -W098
    'use strict';

    function VideoNotFoundError(message) {
        this.name = 'VideoNotFoundError';
        this.message = message || 'No video has been found.';
    }
    VideoNotFoundError.prototype = new Error();
    VideoNotFoundError.prototype.constructor = VideoNotFoundError;

    function getVideo(tab) {

        function getParameters(url) {
            let splits = url.split('?');

            if (splits.length === 1) {
                return {};
            }

            const queryString = splits[splits.length - 1];
            splits = queryString.split('&');
            const params = {};
            let keyValue;
            for (let i = 0, l = splits.length; i < l; i++) {
                keyValue = splits[i].split('=');
                params[keyValue[0]] = keyValue[1];
            }

            return params;
        }

        function getTime(tab) {
            return browser.tabs.executeScript(
                tab.id,
                { 'file': '/lib/youtube/getTime.js'}
            ).then(
                value => {
                    // Firefox 50 and later versions always pass an
                    // array into the promise, but older versions pass a
                    // single result value under some circumstances.
                    // See https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/executeScript#compatNote_1
                    return Array.isArray(value) ? value[0] : value;
                },
                reason => {
                    return new VideoNotFoundError();
                }
            );
        }

        let video = {};
        video.title = tab.title;

        const params = getParameters(tab.url);
        if (params.v) {
            video.vid = 'youtube_' + params.v;
        } else {
            return Promise.reject(new VideoNotFoundError());
        }
        if (params.list) {
            video.playlistId = params.list;
        }

        return getTime(tab).then(time => {
            video.time = time;
            return video;
        });
    }

    function getResumeUrl(video) {
        const id = videos.getId(video.vid);
        let url = 'https://www.youtube.com/watch?v=' + id +
            '&t=' + Math.floor(video.time) + 's';

        // Adds the playlist parameter to the URL if the video is part
        // of a playlist
        if ('playlistId' in video) {
            url += "&list=" + video.playlistId;
        }

        return url;
    }

    return {
        getResumeUrl: getResumeUrl,
        getVideo: getVideo,
    };
})(videos);
