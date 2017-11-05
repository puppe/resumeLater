/*
  Copyright © 2017 Martin Puppe

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

/* globals browser, console, escape */

// Taken with some adjustments from
// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Match_patterns#Converting_Match_Patterns_to_Regular_Expressions

var background = (function (Immutable, atom, videos, youtube, stateHistory) {
    'use strict';

    function matchPatternToRegExp(pattern) {
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
                (path ? (path == '*' ? '(?:\\/.*)?' :
                         ('\\/' + escape(path).replace(/\*/g, '.*')))
                 : '\\/?') + ')$'
        );
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
                                 videos.add(videoStorage, video,
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
                        title: 'Added video',
                        message: 'The video on this page has been ' +
                            'added to your list of videos.',
                    });
                },
                reason => {
                    browser.notifications.create({
                        type: 'basic',
                        title: 'Found no video',
                        message: 'resumeLater could find no video on ' +
                            'this page.',
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

    browser.browserAction.onClicked.addListener(tab => {
        browser.tabs.create({ url: '/videolist/videolist.html' });
    });

    return {
        removeVideo: removeVideo,
        atomPromise: atomPromise,
    };

})(Immutable, atom, videos, youtube, stateHistory);
