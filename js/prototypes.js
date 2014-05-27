(function(window, undefined){
	'use strict';


	if (!Function.prototype.bind) {
		Function.prototype.bind = function(obj /*, ...n*/ ) {
			var func = this,
				bound_args = [].slice.apply(arguments, [1]);
			return function() {
				var args = bound_args.slice();
				args.push.apply(args, arguments);
				return func.apply(obj, args);
			};
		};
	}

	if(!Object.assign) {
		Object.assign = function(a, b) {
			var mixin = function(b) {
				Object.keys(b).forEach(function(key){
					a[key] = b[key];
				});
			};
			if(arguments.length > 2) {
				[].slice.apply(arguments, [1]).forEach(mixin);
			} else mixin(b);
			return a;
		};
	}

	if(!Object.setPrototypeOf) {
		Object.setPrototypeOf = function(obj, proto) {
			/* jshint -W103 */
			obj.__proto__ = proto;
			return obj;
		};
	}
	
	if (!Date.now) {
		Date.now = function() {
			return new Date().getTime();
		};
	}

	Object.assign(Array.prototype, {
		first: function(predicate) {
			if (!predicate) predicate = function() {
				return true;
			};
			var item;
			if (this.some(function(x) {
				if (predicate(x)) {
					item = x;
					return true;
				}
			})) {
				return item;
			}

		},
		last: function(predicate) {
			if (!predicate) return this[this.length - 1];
			for (var i = this.length - 1; i >= 0; i--) {
				var item = this[i];
				if (predicate(item)) return item;
			}
		}
	});

	if (!window.setImmediate) {
		window.setImmediate = function(cb) {
			setTimeout(cb, 0);
		};
	}

	(function() {

		var lastTime = 0,
			requestAnimationFrame = window.requestAnimationFrame,
			cancelAnimationFrame = window.cancelAnimationFrame;
		if (!requestAnimationFrame) {
			var vendors = ['ms', 'moz', 'webkit'];
			for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
				requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
				cancelAnimationFrame =
					window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
			}
		}

		if (!requestAnimationFrame) {
			requestAnimationFrame = function(callback/*, element*/) {
				var currTime = Date.now();
				var timeToCall = Math.max(0, 16 - (currTime - lastTime));
				var id = window.setTimeout(function() {
						callback(currTime + timeToCall);
					},
					timeToCall);
				lastTime = currTime + timeToCall;
				return id;
			};
		}

		if (!cancelAnimationFrame) {
			cancelAnimationFrame = function(id) {
				clearTimeout(id);
			};
		}

		window.requestAnimationFrame = requestAnimationFrame;
		window.cancelAnimationFrame = cancelAnimationFrame;
	})();


})(window);
