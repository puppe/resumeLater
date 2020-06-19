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

/* globals Immutable */

// jshint -W098
const videos = (function (Immutable) {
// jshint +W098
    'use strict';

    const SCHEMA_VERSION = 2;

    function getSiteName(vid) {
        return vid.slice(0, vid.indexOf('_'));
    }

    function getId(vid) {
        return vid.slice(vid.indexOf('_') + 1);
    }

    let upgradeFunctions = [];

    // upgradeFrom0 has been removed because only videoStorage with
    // schemaVersion === 1 has been migrated to the webextension

    upgradeFunctions[1] = function upgradeFrom1(videoStorage) {
        // convert all time stamps from strings to numbers
        return videoStorage
            .update('videos', videos => {
                return videos.map(video => video.update('time', Number));
            })
            .set('schemaVersion', 2);
    };

    function ensureSchema(videoStorage) {
        if (Immutable.Map.isMap(videoStorage) &&
            videoStorage.has('schemaVersion')) {
            // videoStorage is already initialized 
            while (videoStorage.get('schemaVersion') < SCHEMA_VERSION) {
                let schemaVersion = videoStorage.get('schemaVersion');
                videoStorage =
                    upgradeFunctions[schemaVersion](videoStorage);
            }
            return videoStorage;
        } else {
            // videoStorage needs to be initialized
            return Immutable.Map.of(
                'schemaVersion', SCHEMA_VERSION,
                'videos', Immutable.Map());
        }
    }

    function add(videoStorage, newVideo, oneVideoPerPlaylist) {
        oneVideoPerPlaylist = oneVideoPerPlaylist || false;

        newVideo = newVideo.set('lastModified', new Date().getTime());

        let videos = videoStorage.get('videos');

        if (newVideo.has('playlistId') && oneVideoPerPlaylist) {
            videos = videos.filter(video => {
                return video.get('playlistId') !==
                    newVideo.get('playlistId');
            });
        }
        videos = videos.set(newVideo.get('vid'), newVideo);
        return videoStorage.set('videos', videos);
    }

    function remove(videoStorage, vid) {
        return videoStorage.removeIn(['videos', vid]);
    }

    function get(videoStorage, vid) {
        return videoStorage.getIn(['videos', vid]);
    }

    return {
        SCHEMA_VERSION: SCHEMA_VERSION,
        getSiteName: getSiteName,
        getId: getId,
        ensureSchema: ensureSchema,
        add: add,
        remove: remove,
        get: get,
    };
})(Immutable);
