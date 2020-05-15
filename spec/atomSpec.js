/* jshint jasmine:true */
/* globals atom */

(function () {
    'use strict';
    describe('Atom', function () {

        const initialValue = 42;
        let a;

        beforeEach(function () {
            a = atom.createAtom(initialValue);
        });

        it('can be created with atom.createAtom(initialValue)', function () {
            expect(a).toEqual(jasmine.anything());
        });

        describe('An atom contains a value. The value …', function () {

            it('can be dereferenced', function () {
                expect(a.deref()).toBe(initialValue);
            });

            it('can be reset', function () {
                a.reset(23);
                expect(a.deref()).toBe(23);
            });

            it('can be swapped using a function that takes the old value and ' +
                'produces a new value',
                function () {
                    let inc = (x) => x + 1;
                    expect(a.swap(inc)).toBe(initialValue + 1);
                });
        });

        describe('An atom can be watched. A watch function …', function () {

            it('is called when the value of the atom changes', function () {
                let key = 'spy';
                let spy = jasmine.createSpy(function (k, atom, oldValue, newValue) {
                    expect(k).toBe(key);
                    expect(atom).toBe(a);
                    expect(oldValue).toBe(initialValue);
                    expect(newValue).toBe(23);
                });

                a.addWatch(key, spy);
                a.reset(23);
                expect(spy).toHaveBeenCalled();
            });

            it('is not called after it has been removed', function () {
                let spy1 = jasmine.createSpy('spy1');
                let spy2 = jasmine.createSpy('spy2');

                a.addWatch('spy1', spy1);
                a.addWatch('spy2', spy2);
                a.removeWatch('spy1');
                a.reset(23);
                expect(spy1).not.toHaveBeenCalled();
                expect(spy2).toHaveBeenCalled();
            });
        });
    });
})();