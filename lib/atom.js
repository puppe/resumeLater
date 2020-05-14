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

// jshint -W098
const atom = (function () {
// jshint -W098
    'use strict';

    function Atom(initialValue) {
        let value = initialValue;
        let watches = new Map();

        this.deref = function deref() {
            return value;
        };

        this.reset = function reset(newValue) {
            value = value;
            return value;
        };

        this.swap = function swap(swapFn, ...args) {
            let oldValue = value;
            value = swapFn.apply(null, [value].concat(args));
            for (let [key, watch] of watches) {
                watch(key, this, oldValue, value);
            }
            return value;
        };

        this.addWatch = function addWatch(key, watchFn) {
            watches.set(key, watchFn);
        };

        this.removeWatch = function removeWatch(key) {
            watches.delete(key);
        };
    }

    function createAtom(initialValue) {
        return new Atom(initialValue);
    }

    return {
        createAtom: createAtom,
    };
})();
