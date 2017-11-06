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

    const undoButton = document.getElementById('undoButton');
    const redoButton = document.getElementById('redoButton');
    const preferencesButton = document.getElementById(
        'preferencesButton');

    document.title = _('videoListPage_title');
    undoButton.textContent = _('undoButton_text');
    redoButton.textContent = _('redoButton_text');
    preferencesButton.textContent = _('preferencesButton_text');

    let videosPort = browser.runtime.connect({ name: 'videos' });
    window.addEventListener('unload', (event) => {
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

        // populate video list
        videoArray.forEach(function (video) {
            var videoElement = document.createElement('li');
            videoElement.className = 'video';
            videoElement.id = video.vid;
            videoList.appendChild(videoElement);

            var videoFloatContainer = document.createElement('div');
            videoFloatContainer.className = 'videoFloatContainer clearfix';
            videoElement.appendChild(videoFloatContainer);

            var videoLink = document.createElement('a');
            videoLink.href = youtube.getResumeUrl(video);

            var videoInfoBox = document.createElement('div');
            videoInfoBox.className = 'videoInfoBox';
            videoInfoBox.innerHTML = '<span class="videoTitle"></span>' +
                '<span class="videoTime"></span>';
            videoInfoBox.firstChild.textContent = video.title;
            videoInfoBox.lastChild.textContent =
                prettyTime(video.time);
            videoLink.appendChild(videoInfoBox);

            videoFloatContainer.appendChild(videoLink);

            var removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.textContent = _('removeButton_text');
            removeButton.addEventListener('click', (event) => {
                removeButton.disabled = true;
                videosPort.postMessage(['removeVideo', video.vid]);
            });
            videoFloatContainer.appendChild(removeButton);
        });
    }

    videosPort.onMessage.addListener(update);

    preferencesButton.addEventListener('click', (event) => {
        browser.tabs.create({
            url: '/preferences/preferences.html'
        });
    });

    undoButton.addEventListener('click', (event) => {
        videosPort.postMessage(['undo']);
    });

    redoButton.addEventListener('click', (event) => {
        videosPort.postMessage(['redo']);
    });
})(youtube);
