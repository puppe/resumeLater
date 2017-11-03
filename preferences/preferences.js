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

(function () {
    'use strict';
    const bg = browser.extension.getBackgroundPage().background;

    const oneVideoPerPlaylistCheckbox = document
          .getElementById('oneVideoPerPlaylistCheckbox');

    function update(key, prefsAtom, oldPrefs, newPrefs) {
        oneVideoPerPlaylistCheckbox.checked = newPrefs.get(
            'oneVideoPerPlaylist'
        );
    }

    bg.atomPromise.then(({prefsAtom}) => {
        const watchKey = 'preferences.update';
        prefsAtom.addWatch(watchKey, update);
        update(watchKey, prefsAtom, null, prefsAtom.deref());

        oneVideoPerPlaylistCheckbox.addEventListener(
            'change',
            (event) => {
                prefsAtom.swap((prefs) => {
                    return prefs
                        .set('oneVideoPerPlaylist',
                             oneVideoPerPlaylistCheckbox.checked);
                });
            });
    });
})();
