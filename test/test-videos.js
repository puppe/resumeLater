/*
Copyright © 2013 Martin Puppe

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

const timers = require('sdk/timers');

const videos = require('../lib/videos');
const Video = videos.Video;
const VideoStorage = videos.VideoStorage;

function createVideo(vid, title, time, playlistId) {
    var video = {
        vid: vid,
        title: title,
        time: time
    };
    if (playlistId) {
        video.playlistId = playlistId;
    }
    return video;
}

var video1 = createVideo('youtube_XWIvfE01J0k', 'Edward Sharpe', 60);
var video2 = createVideo('youtube_l5p4FEk25is', 'Moriarty', 42);
var video3 = createVideo('youtube_oVVCavjaltM', 'Buckethead', 33);
var video4 = createVideo('youtube_W1C2D-MzziY', 'Nekka - Lost Souls', 25, 'PL2EE3A34F69FF1D7F');
var video5 = createVideo('youtube_NRiPPH5HWZs', 'Nekka - Focus', 93, 'PL2EE3A34F69FF1D7F');

exports['test getSiteName()'] = function (assert) {
    var site = videos.getSiteName(video1);
    assert.strictEqual(site, 'youtube', 'getSiteName works');
};

exports['test getId()'] = function (assert) {
    var id = videos.getId(video1);
    assert.strictEqual(id, 'XWIvfE01J0k', 'getId works');
};

exports['test VideoStorage() gets empty storage'] = function (assert) {
    var storage = {};
    var videoStorage = new VideoStorage(storage);
    assert.strictEqual(storage.schemaVersion, videos.SCHEMA_VERSION,
        'correct schema version has been set');
    assert.deepEqual(storage.videos, {}, 'storage.videos is initialized');
};

exports['test VideoStorage() gets schema version 0 storage'] = function (assert) {
    // schema version 0 means no version, possibly has undefined values

    var storage = { videos: {} };
    storage.videos[video1.vid] = undefined;

    var videoWithTimeAdded = {
        vid: 'youtube_123',
        title: 'video with timeAdded',
        time: 20,
        playListId: 'playList',
        timeAdded: (new Date()).getTime()
    };
    storage.videos[videoWithTimeAdded.vid] = videoWithTimeAdded;
    var oldTime = videoWithTimeAdded.timeAdded;

    var videoWithoutTimeAdded = {
        vid: 'youtube_456',
        title: 'video without timeAdded',
        time: 42
    };
    storage.videos[videoWithoutTimeAdded.vid] = videoWithoutTimeAdded;

    var videoStorage = new VideoStorage(storage);
    assert.strictEqual(storage.schemaVersion, videos.SCHEMA_VERSION,
        'correct schema version has been set');
    assert.ok(!(video1.vid in storage.videos), 'video has been properly deleted.');

    var videoWithLastModified = storage.videos[videoWithTimeAdded.vid];
    assert.ok(!('timeAdded' in videoWithLastModified),
        'timeAdded property has been deleted.');
    assert.strictEqual(videoWithLastModified.lastModified, oldTime,
        'new lastModified property equals timeAdded.');

    videoWithLastModified = storage.videos[videoWithoutTimeAdded.vid];
    assert.strictEqual(videoWithLastModified.lastModified, 0,
        'lastModified is set to 0 if timeAdded does not exist');
};

exports['test VideoStorage() storage with current schema version'] = function (assert) {
    var storage = {};
    var videoStorage = new VideoStorage(storage);
    videoStorage.add(video1);
    videoStorage.add(video2);

    var clone = JSON.parse(JSON.stringify(storage));
    videoStorage = new VideoStorage(storage);

    assert.deepEqual(storage, clone,
        'VideoStorage constructor does not alter the storage if it ' +
        'has the current schema version'
    );
};

exports['test VideoStorage.add'] = function (assert) {
    var storage = {};
    var videoStorage = new VideoStorage(storage);
    videoStorage.add(video1);

    var video = storage.videos[video1.vid];
    assert.ok('lastModified' in video, 'lastModified timestamp added.');
    assert.deepEqual({ vid: video.vid, title: video.title, time: video.time },
        video1,
        'VideoStorage.add works');
};

exports['test VideoStorage.add, oneVideoPerPlaylist = true'] = function (assert) {
    var simplePrefs = {
        prefs: {
            oneVideoPerPlaylist: true
        }
    };
    var storage = { videos: {} };
    var videoStorage = new VideoStorage(storage, {
        "simplePrefs": simplePrefs
    });

    videoStorage.add(video4);
    videoStorage.add(video5);
    assert.ok(!(videoStorage.get(video4.vid)), 'video4 has been removed');
    assert.ok(videoStorage.get(video5.vid), '...and video5 has been added.');
};

exports['test VideoStorage.remove'] = function (assert) {
    var storage = {};
    var videoStorage = new VideoStorage(storage);
    videoStorage.add(video1);
    videoStorage.remove(video1.vid);
    assert.ok(!(video1.vid in storage.videos), 'VideoStorage.remove works');
};

exports['test VideoStorage.get'] = function (assert) {
    var storage = {};
    var videoStorage = new VideoStorage(storage);
    videoStorage.add(video1);

    var video = videoStorage.get(video1.vid);
    video = { vid: video.vid, title: video.title, time: video.time };
    assert.deepEqual(video, video1, 'VideoStorage.get works');
};

exports['test VideoStorage.getAll'] = function (assert) {
    var storage = {};
    var videoStorage = new VideoStorage(storage);
    var array = [video1, video2, video3];
    array.forEach(function (video) {
        videoStorage.add(video);
    });

    function compare(video1, video2) {
        return video1.time - video2.time;
    }

    function equals(array1, array2) {
        var props = ['vid', 'time', 'title'];
        array1.sort(compare);
        array2.sort(compare);
        if (array1.length !== array2.length) {
            return false;
        }
        for (var i = 0, l = array1.length; i < l; i++) {
            for (var j = 0, m = props.length; j < m; j++) {
                if (props[j] in array1[i] !== props[j] in array2[i]) {
                    return false;
                }
                if (array1[i][props[j]] !== array2[i][props[j]]) {
                    return false;
                }
            }
        }
        return true;
    }

    assert.ok(equals(videoStorage.getAll(), array),
        'videoStorage.getAll works');
};

exports['test VideoStorage.add update event'] = function (assert, done) {
    var storage = {};

    function onUpdate(_) {
        assert.ok(true, 'VideoStorage.add triggers "update" event');
        done();
    }

    var videoStorage = new VideoStorage(storage, {
        "onUpdate": onUpdate
    });

    timers.setTimeout(function () {
        done();
    }, 2000);

    videoStorage.add(video1);
};

exports['test VideoStorage.remove update event'] = function (assert, done) {
    var storage = {};
    var videoStorage = new VideoStorage(storage);

    var count = 0;

    function onUpdate(_) {
        count++;
        if (count === 2) {
            assert.ok(true,
                      'VideoStorage.remove triggers "update" event');
            done();
        }
    }

    timers.setTimeout(function () {
        done();
    }, 2000);

    videoStorage.add(video1);
    videoStorage.remove(video1.vid);
};

require('sdk/test').run(exports);
// vim: set ts=4 sw=4 sts=4 tw=72 et :
