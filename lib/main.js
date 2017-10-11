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

/*globals exports, require*/

"use strict";

const ui = require('sdk/ui');
const panel = require('sdk/panel');
const tabs = require('sdk/tabs');
const data = require('sdk/self').data;
const _ = require('sdk/l10n').get;
const simpleStorage = require('sdk/simple-storage').storage;
const simplePrefs = require('sdk/simple-prefs');
const sites = require('./sites');
const VideoStorage = require('./videos').VideoStorage;
const webext = require('sdk/webextension');

var webextPort;

function sendDataToWebext() {
    if (!webextPort) return;
    webextPort.postMessage({
        prefs: {
            'videoListHeight': simplePrefs.prefs.videoListHeight,
            'oneVideoPerPlaylist': simplePrefs.prefs.oneVideoPerPlaylist,
        },
        storage: simpleStorage,
    });

}

webext.startup().then(({browser}) => {
    browser.runtime.onConnect.addListener(port => {
        if (port.name === "sync-legacy-addon-data") {
            webextPort = port;
            sendDataToWebext();
        }
    });
});


function onVideoStorageUpdate(videoStorage, completeStorage) {
    sendDataToWebext();
    videoList.port.emit('update', videoStorage.getAll());
}

var videoStorage = new VideoStorage(simpleStorage,
                                    {
                                        "simplePrefs": simplePrefs,
                                        "onUpdate": onVideoStorageUpdate,
                                    });
// button
var button = ui.ToggleButton({
    id: "button",
    label: "Resume Later",
    icon: {
        "16": "./button/icon16.png",
        "32": "./button/icon32.png",
        "64": "./button/icon64.png"
    },
    onChange: function (state) {
        if (state.checked) {
            videoList.show({
                position: button
            });
        }
    }
});

// list panel
var locale = (_("locale"));
if (locale === "locale") {
    locale = 'en';
}
var panelLocale = data.url("panel/locale/" + locale + ".js");

var videoList = panel.Panel({
    width: 330,
    height: simplePrefs.prefs.videoListHeight,
    contentURL: data.url("panel/panel.html"),
    contentScriptWhen: 'ready',
    contentScriptFile: [
        panelLocale,
        data.url("panel/l10n.js"),
        data.url("panel/panel.js")
    ],
    onHide: function () {
        button.state('window', { checked: false });
    }
});

function resizeVideoList() {
    videoList.resize(330, simplePrefs.prefs.videoListHeight);
}

function onVideoListHeightChange() {
    sendDataToWebext();
    resizeVideoList();
}

// react to changes of preferences
simplePrefs.on('videoListHeight', onVideoListHeightChange);
simplePrefs.on('oneVideoPerPlaylist', sendDataToWebext);

videoList.on('show', function () {
    videoList.port.emit('update', videoStorage.getAll());
});

videoList.port.on('save', function () {
    sites.getVideo(tabs.activeTab).then(function success(video) {
        videoStorage.add(video);
    }, function failure(error) {
        videoList.port.emit('no video');
    });
});

videoList.port.on('remove', function (vid) {
    videoStorage.remove(vid);
});

videoList.port.on('play', function (vid) {
    sites.resumeVideo(videoStorage.get(vid));
});

// vim: set ts=4 sw=4 sts=4 tw=72 et :
