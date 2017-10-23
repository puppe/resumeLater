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

(function (_) {
    'use strict';
    var rlbutton = document.getElementById('resumeLaterButton');

    function updateList(videos) {

        function remove(vid, title) {

            var removeButtonEnabled = true;

            // Ask the user whether he wants to remove the video with id vid
            return function (event) {
                if (!removeButtonEnabled) {
                    return;
                }
                removeButtonEnabled = false;

                var removeButtonBox = event.target;

                var dialogBox = document.createElement('div');
                dialogBox.className = 'dialogBox';
                removeButtonBox.parentNode.parentNode.appendChild(dialogBox);

                var dialogText = document.createElement('p');
                dialogText.textContent = _('remove?');
                dialogBox.appendChild(dialogText);

                var dialogButtons = document.createElement('p');
                dialogBox.appendChild(dialogButtons);

                var confirmButton = document.createElement('span');
                confirmButton.className = 'clickableBad dialogButton';
                confirmButton.textContent = _('Okay');

                confirmButton.addEventListener('click', function () {
                    console.info("Remove " + vid);
                    self.port.emit('remove', vid);
                    dialogBox.parentNode.removeChild(dialogBox);
                    removeButtonEnabled = true;
                });

                dialogButtons.appendChild(confirmButton);

                var cancelButton = document.createElement('span');
                cancelButton.className = 'clickable dialogButton';
                cancelButton.textContent = _('Cancel');

                cancelButton.addEventListener('click', function () {
                    dialogBox.parentNode.removeChild(dialogBox);
                    removeButtonEnabled = true;
                });

                dialogButtons.appendChild(cancelButton);
            };
        }

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
            videoElement.setAttribute('id', video.vid);
            videoList.appendChild(videoElement);

            var videoFloatContainer = document.createElement('div');
            videoFloatContainer.className = 'videoFloatContainer clearfix';
            videoElement.appendChild(videoFloatContainer);

            var videoInfoBox = document.createElement('div');
            videoInfoBox.className = 'clickable videoInfoBox';
            videoInfoBox.innerHTML = '<span class="videoTitle"></span>' +
                '<span class="videoTime"></span>';
            videoInfoBox.firstChild.textContent = video.title;
            videoInfoBox.lastChild.textContent = prettyTime(video.time);
            videoInfoBox.addEventListener('click', function () {
                console.info('Play ' + video.vid);
                self.port.emit('play', video.vid);
            });
            videoFloatContainer.appendChild(videoInfoBox);

            var removeButtonBox = document.createElement('div');
            removeButtonBox.className = 'clickable removeButtonBox';
            removeButtonBox.innerHTML = '<img src="remove.svg" width="16" alt="Remove this video"/>';
            removeButtonBox.addEventListener('click', remove(video.vid, video.title));
            videoFloatContainer.appendChild(removeButtonBox);
        });
    }

    function showNotification(text) {
        console.log(text);

        var dialogBox = document.createElement('div');
        dialogBox.className = 'dialogBox';
        var footerButtons = document.getElementById('footerButtons');
        footerButtons.parentNode.insertBefore(dialogBox, footerButtons);

        var dialogText = document.createElement('p');
        dialogText.textContent = text;
        dialogBox.appendChild(dialogText);

        var dialogButtons = document.createElement('p');
        dialogBox.appendChild(dialogButtons);

        var confirmButton = document.createElement('span');
        confirmButton.className = 'clickable confirmNotification';
        confirmButton.textContent = _('Okay');
        confirmButton.addEventListener('click', function ()  {
            dialogBox.parentNode.removeChild(dialogBox);
        });

        dialogButtons.appendChild(confirmButton);
    }

    rlbutton.addEventListener('click', function () {
        self.port.emit("save");
    });

    /*
    self.port.on('update', updateList);
    self.port.on('no video', function () {
        showNotification(_('no video'));
    });
    */

}) (function _(string) { 'use strict'; return str; });

// vim: set ts=4 sw=4 sts=4 tw=72 et :
