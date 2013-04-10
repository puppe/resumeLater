/*
Copyright © 2012,2013 Martin Puppe

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

/*jshint esnext:true,globalstrict:true*/
/*global exports*/
'use strict';

const MatchPattern = require('sdk/page-mod/match-pattern').MatchPattern;

const promise = require('sdk/core/promise');
const reject = promise.reject;

const videos = require('./videos');

const sites = {
    youtube: require('./sites/youtube')
};

function SiteNotSupportedError(message) {
    this.name = 'SiteNotSupportedError';
    this.message = message || 'This site is not supported.';
}
SiteNotSupportedError.prototype = new Error();
SiteNotSupportedError.prototype.constructor = SiteNotSupportedError;

function getVideo(tab) {
    var site;
    for (var siteName in sites) {
        if (sites.hasOwnProperty(siteName)) {
            site = sites[siteName];
            if ((new MatchPattern(site.pattern)).test(tab.url)) {
                return site.getVideo(tab);
            } else {
                return reject(new SiteNotSupportedError());
            }
        }
    }
}

function resumeVideo(video) {
    var site = sites[videos.getSiteName(video)];
    if (site) {
        site.resumeVideo(video);
    }
}

exports.getVideo = getVideo;
exports.resumeVideo = resumeVideo;
// vim: set ts=4 sw=4 sts=4 tw=72 et :
