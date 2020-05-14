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

/* globals atom, browser, Immutable, escape, videos, stateHistory, youtube */

// Taken with some adjustments from
// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Match_patterns#Converting_Match_Patterns_to_Regular_Expressions

(function (Immutable, atom, videos, youtube, stateHistory) {
    'use strict';

    const _ = browser.i18n.getMessage;

    function matchPatternToRegExp(pattern) {
        // Disabling JSHint warning because this code already seems to work
        // correctly. I do not want to change it now while I do not have a
        // test suite yet.
        // jshint -W126
        // jshint -W147
        const matchPattern = (/^(?:(\*|http|https|file|ftp|app):\/\/([^\/]+|)\/?(.*))$/i);
        const match = matchPattern.exec(pattern);
        if (pattern === '<all_urls>') {
            return (/^(?:https?|file|ftp|app):\/\//);
        }
        if (!match) {
            throw new TypeError('"' + pattern + '" is not a valid ' +
                                'MatchPattern');
        }
        const [ , scheme, host, path, ] = match;
        return new RegExp(
            '^(?:' +
                (scheme === '*' ? 'https?' : escape(scheme)) + ':\\/\\/' +
                (host === '*' ? "[^\\/]*" :
                 escape(host).replace(/^\*\./g, '(?:[^\\/]+)?')) +
                (path ? (path === '*' ? '(?:\\/.*)?' :
                         ('\\/' + escape(path).replace(/\*/g, '.*')))
                 : '\\/?') + ')$'
        );
        // jshint +W126
        // jshint +W147
    }

    const YOUTUBE_PATTERN = '*://*.youtube.com/*';
    const YOUTUBE_REGEX = matchPatternToRegExp(YOUTUBE_PATTERN);

    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'complete' &&
            YOUTUBE_REGEX.test(tab.url)) {
            browser.pageAction.show(tab.id);
        }
    });

    const SCHEMA_VERSION = 0;

    function ensureSchema(data) {
        let result;
        if (data.schemaVersion === 0) {
            result = data;
        } else if (!('schemaVersion' in data) && 'legacy' in data) {
            let legacy = data.legacy;
            result =  {
                schemaVersion: 0,
                prefs: {
                    oneVideoPerPlaylist: legacy.prefs
                        .oneVideoPerPlaylist,
                },
                videoStorage: legacy.storage,
            };
        } else {
            result =  {
                schemaVersion: SCHEMA_VERSION,
                prefs: {
                    oneVideoPerPlaylist: false,
                },
                videoStorage: {},
            };
        }

        result.videoStorage = videos
            .ensureSchema(Immutable.fromJS(result.videoStorage))
            .toJS();

        return result;
    }

    function addVideo(videoHistory, video, oneVideoPerPlaylist) {
        let videoStorage = stateHistory.current(videoHistory);
        return stateHistory.push(videoHistory,
                                 videos.add(videoStorage,
                                            Immutable.fromJS(video),
                                            oneVideoPerPlaylist));
    }

    function removeVideo(videoHistory, vid) {
        let videoStorage = stateHistory.current(videoHistory);
        return stateHistory.push(videoHistory,
                                 videos.remove(videoStorage, vid));
    }

    function saveCurrentVideoStorage(key, videoHistoryAtom,
                                     oldVideoHistory,
                                     newVideoHistory) {
        browser.storage.local.set({
            videoStorage: stateHistory.current(newVideoHistory).toJS()
        });
    }

    function savePrefs(key, prefsAtom, oldPrefs, newPrefs) {
        browser.storage.local.set({
            prefs: newPrefs.toJS(),
        });
    }

    function onAtomPromise(atoms) {
        let { videoHistoryAtom, prefsAtom } = atoms;
        videoHistoryAtom.addWatch('background.saveCurrentVideoStorage',
                                  saveCurrentVideoStorage);
        prefsAtom.addWatch('background.savePrefs', savePrefs);

        browser.pageAction.onClicked.addListener(tab => {
            youtube.getVideo(tab).then(
                video => {
                    videoHistoryAtom.swap(addVideo,
                                          video,
                                          prefsAtom.deref().get(
                                              'oneVideoPerPlaylist'
                                          ));
                    browser.notifications.create({
                        type: 'basic',
                        title: _('notification_addedVideo_title'),
                        message: _('notification_addedVideo_message'),
                    });
                },
                reason => {
                    browser.notifications.create({
                        type: 'basic',
                        title: _('notification_noVideo_title'),
                        message: _('notification_noVideo_message'),
                    });
                }
            );
        });
    }

    let schemaPromise = browser.storage.local.get(null)
        .then(ensureSchema)
        .then(data => browser.storage.local.clear()
              .then(() => data))
        .then(data => browser.storage.local.set(data));

    let videoHistoryAtomPromise = schemaPromise
        .then(_ => browser.storage.local.get('videoStorage'))
        .then(obj => Immutable.fromJS(obj.videoStorage))
        .then(videoStorage => {
            let videoHistory = stateHistory.createHistory();
            return stateHistory.push(videoHistory, videoStorage);
        })
        .then(atom.createAtom);

    let prefsAtomPromise = schemaPromise
        .then(_ => browser.storage.local.get('prefs'))
        .then(obj => Immutable.fromJS(obj.prefs))
        .then(atom.createAtom);

    let atomPromise = Promise
        .all([videoHistoryAtomPromise, prefsAtomPromise])
        .then(([videoHistoryAtom, prefsAtom]) => {
            return {
                videoHistoryAtom: videoHistoryAtom,
                prefsAtom: prefsAtom,
            };
        });

    atomPromise.then(onAtomPromise);

    browser.runtime.onConnect.addListener(port => {
        function sendPrefs(key, prefsAtom, oldPrefs, newPrefs) {
            port.postMessage(newPrefs.toJS());
        }

        function sendVideos(key, videoHistoryAtom, oldVideoHistory,
                            newVideoHistory) {
            port.postMessage({
                videos: stateHistory.current(newVideoHistory).
                    get('videos').toJS(),
                canUndo: stateHistory.canUndo(newVideoHistory),
                canRedo: stateHistory.canRedo(newVideoHistory),
            });
        }

        if (port.name === 'prefs') {
            const watchKey = 'background.sendPrefs_tab' +
                  port.sender.tab.id;

            prefsAtomPromise.then(prefsAtom => {
                sendPrefs(watchKey, prefsAtom, null, prefsAtom.deref());
                prefsAtom.addWatch(watchKey, sendPrefs);

                port.onDisconnect.addListener(port => {
                    prefsAtom.removeWatch(watchKey);
                });

                port.onMessage.addListener(newPrefs => {
                    prefsAtom.swap(oldPrefs =>
                                   oldPrefs.merge(newPrefs));
                });
            });
        } else if (port.name === 'videos') {
            const watchKey = 'background.sendVideos_tab' +
                  port.sender.tab.id;

            videoHistoryAtomPromise.then(videoHistoryAtom => {
                sendVideos(watchKey, videoHistoryAtom, null,
                           videoHistoryAtom.deref());
                videoHistoryAtom.addWatch(watchKey, sendVideos);

                port.onDisconnect.addListener(port => {
                    videoHistoryAtom.removeWatch(watchKey);
                });

                port.onMessage.addListener(commandAndArgs => {
                    let [command, ...args] = commandAndArgs;
                    switch (command) {
                    case 'undo':
                    case 'redo':
                        videoHistoryAtom.swap(stateHistory[command]);
                        break;
                    case 'removeVideo':
                        videoHistoryAtom.swap(removeVideo, args[0]);
                        break;
                    }
                });
            });
        }
    });

    browser.browserAction.onClicked.addListener(tab => {
        browser.tabs.create({ url: '/videolist/videolist.html' });
    });
})(Immutable, atom, videos, youtube, stateHistory);
