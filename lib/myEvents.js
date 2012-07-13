const ERROR_TYPE = 'error';
const UNCAUGHT_ERROR = 'An error event was dispatched for which there was'
	+ ' no listener.';
const BAD_LISTENER = 'The event listener must be a function.';

function EventEmitter() {
	let me = this;
	
	this.on = function on(type, listener) {
		if ('function' !== typeof listener)
      throw new Error(BAD_LISTENER);
    let listeners = me.listeners(type);
    if (0 > listeners.indexOf(listener))
      listeners.push(listener);
	}
	
	this.removeListener = function removeListener(type, listener) {
		if ('function' !== typeof listener)
			throw new Error(BAD_LISTENER);
		let listeners = me.listeners(type);
		let index = listeners.indexOf(listener);
    if (0 <= index)
      listeners.splice(index, 1);
	}
	
	let events =  {};
	
	this.listeners = function listeners(type) {
		return events[type] || (events[type] = []);
	}
	
	this.emit = function emit(type, payload) {
		let listeners = me.listeners(type);
		for each (listener in listeners) {
			listener.call(null, payload);
		}
	}
}

exports.EventEmitter = EventEmitter;
// vim: set noet ts=2 sw=2 sts=0
