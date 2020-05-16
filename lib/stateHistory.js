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

/* globals Immutable */

// jshint -W098
const stateHistory = (function (Immutable) {
// jshint +W098
    'use strict';

    const MAX_HISTORY = 10;

    function createHistory() {
        return Immutable.Map.of(
            'undoList', Immutable.List(),
            'redoList', Immutable.List()
        );
    }

    function current(history) {
        return history.get('undoList').last();
    }

    function push(history, state) {
        let undoList = history
            .get('undoList')
            .push(state)
            .takeLast(MAX_HISTORY);
        let redoList = history.get('redoList').clear();
        return history.withMutations(history => {
            history.set('undoList', undoList)
                .set('redoList', redoList);
        });
    }

    function canUndo(history) {
        return history.get('undoList').size > 1;
    }

    function undo(history) {
        if (!canUndo(history)) {
            return history;
        }
        let state = history.get('undoList').last();
        return history
            .update('undoList', undoList => undoList.pop())
            .update('redoList', redoList => redoList.push(state));
    }

    function canRedo(history) {
        return history.get('redoList').size > 0;
    }

    function redo(history) {
        if (!canRedo(history)) {
            return history;
        }
        let state = history.get('redoList').last();
        return history
            .update('undoList', undoList => undoList.push(state))
            .update('redoList', redoList => redoList.pop());
    }

    return {
        MAX_HISTORY: MAX_HISTORY,
        createHistory: createHistory,
        current: current,
        push: push,
        canUndo: canUndo,
        undo: undo,
        canRedo: canRedo,
        redo: redo,
    };
})(Immutable);
