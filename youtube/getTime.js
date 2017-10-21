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

/* jshint browser:true */

(function () {
    'use strict';

    var playerId;

    if (document.getElementById("movie_player") == null) {
        playerId = 'movie_player-html5';
    } else {
        playerId = 'movie_player';
    }

    var player = document.getElementById(playerId).wrappedJSObject;

    var time = player.getCurrentTime();
    player.pauseVideo();

    if (!time) {
        throw new Error('No video has been found.');
    }

    // make sure not an unsafe object
    time = String(time);

    return time;
})();
