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
    const _ = browser.i18n.getMessage;

    const oneVideoPerPlaylistCheckbox = document
          .getElementById('oneVideoPerPlaylistCheckbox');
    const oneVideoPerPlaylistLabel = document
          .getElementById('oneVideoPerPlaylistLabel');

    document.title = _('preferencesPage_title');
    oneVideoPerPlaylistLabel.textContent =
        _('oneVideoPerPlaylistLabel_text');

    function update(prefs) {
        oneVideoPerPlaylistCheckbox.checked = prefs.oneVideoPerPlaylist;
    }

    let prefsPort = browser.runtime.connect({ name: 'prefs' });
    prefsPort.onMessage.addListener(update);
    window.addEventListener('unload', (event) => {
        prefsPort.disconnect();
    });

    oneVideoPerPlaylistCheckbox.addEventListener('change', (event) => {
        prefsPort.postMessage({
            oneVideoPerPlaylist: oneVideoPerPlaylistCheckbox.checked,
        });
    });
})();
