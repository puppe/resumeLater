/* jshint jasmine:true */
/* globals Immutable, stateHistory */

(function (Immutable, stateHistory) {
    'use strict';
    describe('stateHistory', function () {
        let history;

        beforeEach(function () {
            history = stateHistory.createHistory();
            history = stateHistory.push(history, 1);
        });

        it('can be created with stateHistory.createHistory()', function () {
            expect(stateHistory.createHistory()).toEqual(jasmine.anything());
        });

        it('should store a given value as the new \'current state\'', function () {
            expect(stateHistory.current(history)).toBe(1);
        });

        it('should be immutable', function () {
            const newHistory = stateHistory.push(history, 2);
            expect(stateHistory.current(history)).toBe(1);
            expect(stateHistory.current(newHistory)).toBe(2);
            expect(history).not.toBe(newHistory);
        });

        it('should be able to undo and redo changes', function () {
            const oldState = stateHistory.current(history);
            const newState = 2;
            const newHistory = stateHistory.push(history, newState);
            const undoneHistory = stateHistory.undo(newHistory);
            const redoneHistory = stateHistory.redo(undoneHistory);

            expect(stateHistory.current(undoneHistory)).toBe(oldState);
            expect(stateHistory.current(redoneHistory)).toBe(newState);
        });

        it('should report whether anything can be undone', function () {
            expect(stateHistory.canUndo(history)).toBeFalse();
            expect(stateHistory.canRedo(history)).toBeFalse();

            const newHistory = stateHistory.push(history, 2);
            const undoneHistory = stateHistory.undo(newHistory);

            expect(stateHistory.canUndo(newHistory)).toBeTrue();
            expect(stateHistory.canRedo(newHistory)).toBeFalse();
            expect(stateHistory.canRedo(undoneHistory)).toBeTrue();
        });

        const MAX_HISTORY = stateHistory.MAX_HISTORY;

        it(`should store up to ${MAX_HISTORY} current and past values`, function () {
            let newHistory = history;
            expect(MAX_HISTORY).toBe(10);

            // fill up the history
            for (let i = 2; i <= MAX_HISTORY; i++) {
                newHistory = stateHistory.push(newHistory, i);
                expect(stateHistory.current(newHistory)).toBe(i);
            }

            // undo as much as possible
            for (let i = 10; i > 1; i--) {
                expect(stateHistory.current(newHistory)).toBe(i);
                expect(stateHistory.canUndo(newHistory)).toBeTrue();
                newHistory = stateHistory.undo(newHistory);
            }
            expect(stateHistory.current(newHistory)).toBe(1);
            expect(stateHistory.canUndo(newHistory)).toBeFalse();

            newHistory = stateHistory.undo(newHistory);
            expect(stateHistory.current(newHistory)).toBe(1);

            // redo as much as possible
            for (let i = 2; i <= MAX_HISTORY; i++) {
                expect(stateHistory.canRedo(newHistory)).toBeTrue();
                newHistory = stateHistory.redo(newHistory);
            }
            expect(stateHistory.canRedo(newHistory)).toBeFalse();
            expect(stateHistory.current(newHistory)).toBe(MAX_HISTORY);

            newHistory = stateHistory.redo(newHistory);

            expect(stateHistory.current(newHistory)).toBe(MAX_HISTORY);
        });
    });
})(Immutable, stateHistory);