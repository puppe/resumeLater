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
(function () {
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

    browser.pageAction.onClicked.addListener(tab => {
        browser.tabs.executeScript(
            tab.id,
            { 'file': '/youtube.js' }
        ).then((result) => {
            // Firefox 50 and later versions always pass an array into
            // the callback, but older versions pass a single result
            // value under some circumstances.
            // See https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/executeScript#compatNote_1
            result = Array.isArray(result) ? result[0] : result;
            console.log(result);
        });
    });

}) ();
