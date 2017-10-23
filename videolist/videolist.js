/*
Copyright © 2012 Martin Puppe

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

(function () {
    'use strict';
    const bg = browser.extension.getBackgroundPage().background;
    const youtube = browser.extension.getBackgroundPage().youtube;

    function updateList(videos) {
        function prettyTime(time) {
            var minutes = Math.floor(time / 60).toString();
            var seconds = Math.floor(time % 60).toString();
            if (seconds.length < 2) {
                seconds = "0" + seconds;
            }
            return minutes + ":" + seconds;
        }

        // put newest video on top
        videos.sort(function (video1, video2) {
            return video2.lastModified - video1.lastModified;
        });

        // empty video list
        const videoList = document.getElementById('videoList');
        while (videoList.lastChild) {
            videoList.removeChild(videoList.lastChild);
        }

        // populate video list
        videos.forEach(function (video) {
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
            videoInfoBox.lastChild.textContent = prettyTime(video.time);
            videoLink.appendChild(videoInfoBox);

            videoFloatContainer.appendChild(videoLink);

            var removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.textContent = 'Remove';
            removeButton.addEventListener('click', (event) => {
                removeButton.disabled = true;
                bg.videoStorage.remove(video.vid);
            });
            videoFloatContainer.appendChild(removeButton);
        });
    }

    browser.storage.onChanged.addListener((changes, areaName) => {
        updateList(bg.videoStorage.getAll());
    });

    updateList(bg.videoStorage.getAll());

})();
