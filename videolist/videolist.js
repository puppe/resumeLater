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

(function (youtube) {
    'use strict';
    const _ = browser.i18n.getMessage;

    const heading = document.getElementById('heading');
    const preferencesLink = document.getElementById('preferencesLink');
    const undoButton = document.getElementById('undoButton');
    const redoButton = document.getElementById('redoButton');

    const acceptLanguagesElement = document.getElementById('acceptLanguages');
    const uiLanguageElement = document.getElementById('uiLanguage');

    function findInstructionsElement(language) {
        let id = 'instructions_' + language;
        let instructionsElement = document.getElementById(id);
        if (instructionsElement) return instructionsElement;

        while (true) {
            let subTagIndex = language.lastIndexOf('-');
            if (subTagIndex === -1) break;
            language = language.slice(0, subTagIndex);
            id = 'instructions_' + language;
            instructionsElement = document.getElementById(id);
            if (instructionsElement) return instructionsElement;
        }

        id = 'instructions_en';
        return document.getElementById(id);
    }

    const uiLanguage = browser.i18n.getUILanguage();
    const instructionsElement = findInstructionsElement(uiLanguage);

    document.title = _('videoListPage_title');
    heading.textContent = _('videoListPage_heading');
    preferencesLink.textContent = _('preferencesLink_text');
    undoButton.textContent = _('undoButton_text');
    redoButton.textContent = _('redoButton_text');

    console.debug('Connect to videosPort');
    let videosPort = browser.runtime.connect({ name: 'videos' });
    window.addEventListener('unload', (event) => {
        console.debug('Disconnect from videosPort');
        videosPort.disconnect();
    });

    function update(message) {
        function prettyTime(time) {
            var minutes = Math.floor(time / 60).toString();
            var seconds = Math.floor(time % 60).toString();
            if (seconds.length < 2) {
                seconds = "0" + seconds;
            }
            return minutes + ":" + seconds;
        }

        let { videos, canUndo, canRedo } = message;

        // enable/disable undo/redo buttons
        undoButton.disabled = !canUndo;
        redoButton.disabled = !canRedo;

        let videoArray = Object.values(videos);

        // put newest video on top
        videoArray.sort(function (video1, video2) {
            return video2.lastModified -
                video1.lastModified;
        });

        // empty video list
        const videoList = document.getElementById('videoList');
        while (videoList.lastChild) {
            videoList.removeChild(videoList.lastChild);
        }

        if (videoArray.length > 0) {
            instructionsElement.classList.add('hidden');
        } else {
            instructionsElement.classList.remove('hidden');
        }

        // populate video list
        videoArray.forEach(function (video) {
            var videoElement = document.createElement('li');
            videoElement.className = 'video';
            videoElement.id = video.vid;
            videoList.appendChild(videoElement);

            var videoFloatContainer = document.createElement('div');
            videoFloatContainer.className = 'videoFloatContainer';
            videoElement.appendChild(videoFloatContainer);

            var videoLink = document.createElement('a');
            videoLink.href = youtube.getResumeUrl(video);

            var videoInfoBox = document.createElement('div');
            videoInfoBox.className = 'videoInfoBox';
            videoInfoBox.innerHTML = '<span class="videoTitle"></span>' +
                '<span> </span>' +
                '<span class="videoTime"></span>';
            videoInfoBox.firstChild.textContent = video.title;
            videoInfoBox.lastChild.textContent =
                prettyTime(video.time);
            videoLink.appendChild(videoInfoBox);

            videoFloatContainer.appendChild(videoLink);

            var removeButton = document.createElement('button');
            removeButton.textContent = _('removeButton_text');
            removeButton.className = 'warning';
            removeButton.addEventListener('click', (event) => {
                removeButton.disabled = true;
                videosPort.postMessage(['removeVideo', video.vid]);
            });
            videoFloatContainer.appendChild(removeButton);
        });
    }

    videosPort.onMessage.addListener(update);

    undoButton.addEventListener('click', (event) => {
        videosPort.postMessage(['undo']);
    });

    redoButton.addEventListener('click', (event) => {
        videosPort.postMessage(['redo']);
    });
})(youtube);
