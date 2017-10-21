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

let videos = (function () {
    'use strict';

    const SCHEMA_VERSION = 1;

    function getSiteName(video) {
        var vid = video.vid;
        return vid.slice(0, vid.indexOf("_"));
    }

    function getId(video) {
        var vid = video.vid;
        return vid.slice(vid.indexOf("_") + 1, vid.length);
    }

    var upgradeFunctions = [];

    upgradeFunctions[0] = function upgradeFrom0(storage) {
        for (var vid in storage.videos) {
            if (typeof storage.videos[vid] === 'undefined') {
                delete storage.videos[vid];
            } else if (!('lastModified' in storage.videos[vid])) {
                storage.videos[vid].lastModified = storage.videos[vid].timeAdded || 0;
                delete storage.videos[vid].timeAdded;
            }
        }
    };

    function VideoStorage(storage, optional) {
        optional = optional || {};
        var { simplePrefs, onUpdate } = optional;

        onUpdate = onUpdate || function(_) {};

        // upgrade storage to current schema version
        if ('videos' in storage) {
            storage.schemaVersion = storage.schemaVersion || 0;
            while (storage.schemaVersion < SCHEMA_VERSION) {
                upgradeFunctions[storage.schemaVersion](storage);
                storage.schemaVersion++;
            }
        } else {
            storage.videos = {};
            storage.schemaVersion = SCHEMA_VERSION;
        }

        this.add = function add(video) {
            var properties = ['vid', 'title', 'time', 'playlistId'];
            var copy = {};

            properties.forEach(function (prop) {
                if (prop in video) {
                    copy[prop] = video[prop];
                }
            });
            copy.lastModified = new Date().getTime();

            // optionally only keep one video per playlist
            if (copy.playlistId &&
                simplePrefs &&
                simplePrefs.prefs.oneVideoPerPlaylist) {
                for (var vid in storage.videos) {
                    if (storage.videos.hasOwnProperty(vid) &&
                        storage.videos[vid].playlistId === copy.playlistId) {
                        this.remove(vid, true);
                    }
                }
            }

            storage.videos[copy.vid] = copy;
            onUpdate(this);
        };

        this.remove = function remove(vid, silent) {
            delete storage.videos[vid];
            if (!silent) {
                onUpdate(this);
            }
        };

        this.get = function get(vid) {
            return storage.videos[vid];
        };

        this.getAll = function getAll() {
            var array = [];
            for (var vid in storage.videos) {
                if (storage.videos.hasOwnProperty(vid)) {
                    array.push(storage.videos[vid]);
                }
            }
            return array;
        };
    }

    return {
        getSiteName: getSiteName,
        getId: getId,
        VideoStorage: VideoStorage,
        SCHEMA_VERSION: SCHEMA_VERSION,
    };
})();
