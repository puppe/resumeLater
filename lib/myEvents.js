/*jshint esnext:true,strict:false*/
/*global exports*/
const ERROR_TYPE = 'error';
const UNCAUGHT_ERROR = 'An error event was dispatched for which there was' +
	' no listener.';
const BAD_LISTENER = 'The event listener must be a function.';

function EventEmitter() {
	var me = this;
	
	this.on = function on(type, listener) {
		if ('function' !== typeof listener) {
			throw new Error(BAD_LISTENER);
		}
		var listeners = me.listeners(type);
		if (0 > listeners.indexOf(listener)) {
			listeners.push(listener);
		}
	};

	this.removeListener = function removeListener(type, listener) {
		if ('function' !== typeof listener) {
			throw new Error(BAD_LISTENER);
		}
		var listeners = me.listeners(type);
		var index = listeners.indexOf(listener);
		if (0 <= index) {
			listeners.splice(index, 1);
		}
	};
	
	var events =  {};
	
	this.listeners = function listeners(type) {
		return events[type] || (events[type] = []);
	};

	this.emit = function emit(type, payload) {
		var listeners = me.listeners(type);
		listeners.forEach(function (listener) {
			listener.call(null, payload);
		});
	};
}

exports.EventEmitter = EventEmitter;
// vim: set noet ts=2 sw=2 sts=0
