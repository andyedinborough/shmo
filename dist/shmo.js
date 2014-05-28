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

	if(!Array.from) {
		Array.from = function(arrayish) {
			return Array.prototype.slice.apply(arrayish);
		};
	}

	if(!Array.of) {
		Array.of = function(){
			return Array.from(arguments);
		};
	}

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

(function(window, undefined) {
	'use strict';

	var uuid = 0;
	$.fn.forEach = Array.prototype.forEach;

	$.fn.id = function(){
		var id = this[0].id;
		if(!id) {
			id = 'e' + uuid++;
			this.attr('id', id);
		}
		return id;
	};

	$.fn.visible = function(is_visible) {
		if(arguments.length === 0) {
			return this.is(':visible');
		} else {
			return this.css('visibility', is_visible ? 'visible' : 'hidden');
		}
	};

	var doc = $(document);
	$.on = $.fn.on.bind(doc);
	$.off = $.fn.off.bind(doc);

})(window);

(function(window, undefined){
	'use strict';

	move.prototype.rotateY = function(value) {
		return this.transform('rotateY(' + value + 'deg)');
	};
	move.prototype.rotateX = function(value) {
		return this.transform('rotateX(' + value + 'deg)');
	};
	move.prototype.opacity = function(value) {
		return this.set('opacity', value);
	};

})(window);

(function(window, undefined) {
	'use strict';

	window.utils = {
		hideKeyboard: function(){
			var elm = document.querySelector(':focus');
			if(elm && elm.blur) elm.blur();
		}
	};

})(window);
(function(window, undefined) {
	'use strict';

	var win = $(window),
		body = $('body');

	var router = window.router = {
		history: [],
		
		back: function(cb) {
			var cur = router.history.pop();
			var prev = router.history.last();
			transition.back(prev, cur, cb);
		},

		section: function(sel, cb) {
			var section0 = current.section;
			var section = $(sel);
			router.history.push(section);

			if(section0) {
				transition.forward(section, section0, cb);
			} else {
				section.visible(true).insertAfter($('section:last'));
				if(cb) cb();
			}
			return section;
		},

		aside: function _aside(sel, cb) {
			if(typeof sel === 'function') {
				cb = sel;
				sel = null;
			}

			var aside = sel ? $(sel) : null;
			var _cb = function(){
				transition.toggleClasses(false);
				if(cb) cb();
			};

			if(!sel || (current.aside && aside[0] == current.aside[0])) {
				transition.toggleClasses(true);
				transition
					.move('body')
					.x(0)
					.end(_cb);
				current.aside = null;
				return;
			}

			if(current.aside) {
				router.aside(_aside.bind(router, sel, cb));
			} else {
				current.aside = aside;
				transition.toggleClasses(true);
				transition
					.move(body)
					.x(win.width() * constants.ASIDE_WIDTH | 0)
					.end(_cb);
			}
			return aside;
		}
	};

})(window);

(function(window, undefined){
	'use strict';

	var win = $(window),
		html = $('html');

	var transition = window.transition = {
		move: function (elm){
			elm = typeof(elm) === 'string' ? $(elm)[0] : elm.length > 0 ? elm[0] : elm;
			return window.move(elm)
				.duration(constants.DURATION)
				.ease(constants.EASE);
		},

		toggleClasses: function(routing) {
			html.toggleClass('routing', routing)
				.toggleClass('not-routing', !routing);
		},

		forward: function(elm1, elm0, cb) {
			var name = elm1.data('transition') || constants.TRANSITION;
			transition.toggleClasses(true);
			elm1.visible(true).insertAfter(elm0);
			transition.showing(elm1);
			transition.hiding(elm0);

			var mv = move(elm1.length > 0 ? elm1[0] : elm1)
				.duration(0);
			transition.reset(mv, 'section', name);
			mv.end(function(){
				var mv1 = transition.move(elm1);
				var mv0 = transition.move(elm0);
				var func = transition.get('section', name);
				func(mv1, mv0);
				mv1.end(function(){
					transition.toggleClasses(false);
					if(cb) cb();
				});
				mv0.end(function(){
					elm0.visible(false);
				});
			});
		},

		back: function(elm1, elm0, cb) {
			transition.toggleClasses(true);
			transition.showing(elm1);
			transition.hiding(elm0);
			
			var name = elm0.data('transition') || constants.TRANSITION;
			var mv0 = transition.move(elm0);
			var mv1 = transition.move(elm1);
			transition.reset(mv1, 'section');
			transition.reset(mv0, 'section', name);
			elm1.visible(true);
			mv1.end(function(){
				elm1.insertAfter(elm0);
				transition.toggleClasses(false);
				if(cb) cb();
			});
			mv0.end(function(){
				elm0.visible(false);
			});
		},

		showing: function(elm) {
			elm.addClass('showing').trigger('showing');
		},

		shown: function(elm) {
			elm.addClass('shown').removeClass('showing hidden').trigger('shown');
		},

		hiding: function(elm) {
			elm.addClass('hiding').trigger('hiding');
		},

		hidden: function(elm) {
			elm.addClass('hidden').removeClass('hiding shown').trigger('hidden');
		},

		show: function(elm, type, name) {
			transition.showing(elm);
			var mv = transition.move(elm);
			transition.reset(mv, type, name);
			mv.duration(0).end(function(){
				var mv = transition.move(elm);
				transition.get(type, name)(mv);
				mv.end(function(){
					transition.shown(elm);
				});
			});
		},

		hide: function(elm, type, name) {
			transition.hiding(elm);
			var mv = transition.move(elm);
			transition.reset(mv, type, name);
			mv.end(function(){
				transition.hidden(elm);
			});
		},

		get: function(type, name, which) {
			var area = transition[type] || transition;
			var trans = area[name] || area;
			trans = trans[which || 'run'] || trans;
			return trans;
		},

		reset: function _reset(mv, type, name) {
			mv.opacity(1)
				.translate(0, 0)
				.rotate(0)
				.scale(1);

			var rst = transition.get(type, name, 'reset');
			if(rst !== _reset && $.isFunction(rst)) {
				rst(mv);
			}
			return mv;
		},

		section: {
			rotate: {
				reset: function(mv){
					mv
						.opacity(0)
						.x(win.width() / 2)
						.rotate(15)
						.y(win.height() / 3)
						.scale(1);
				},
				run: function(mv){
					mv.y(0).x(0).scale(1).rotate(0).opacity(1);
				}
			},

			slide: {
				reset: function(mv) {
					mv.x(win.width());
				},

				run: function(mv1, mv0) {
					mv1.x(0);
					mv0.opacity(0).rotateY(-45);
				}
			},

			slip: {
				reset: function(mv) {
					mv.x(win.width());
				},

				run: function(mv1, mv0) {
					mv1.x(0);
					mv0.x(-win.width() / 2);
				}
			},

			cover: {
				reset: function(mv) {
					mv.y(win.height());
				},
				run: function(mv1, mv0) {
					mv1.y(0);
					mv0.rotateX(25).opacity(0);
				}
			},
		},

		modal: {
			reset: function(mv) {
				mv.opacity(0).duration(constants.DURATION / 4 | 0);
			},
			run: function(mv) {
				mv.opacity(1).duration(constants.DURATION / 4 | 0);
			}
		},

		prompt: {
			reset: function(mv) {
				mv.y(win.height()/5).opacity(0).duration(constants.DURATION / 3 | 0);
			},
			run: function(mv) {
				mv.y(0).opacity(1).duration(constants.DURATION / 3 | 0);
			}
		}
	};

})(window);

(function(window, undefined) {
	'use strict';

	var win = $(window);
	var setImmediate = window.setImmediate;
	var _dialog;
	var _modal;
	var _className;
	var _tmr_show;
	var _afterHiddenCallback;
	var STATES = {};
	'hidden showing shown hiding'.split(' ')
		.forEach(function(x){
			STATES[x.toUpperCase()] = x;
		});
	var _state = STATES.HIDDEN;

	function _bind(func, args, self) {
		args = Array.from(args);
		args.unshift(self);
		return Function.prototype.bind.apply(func, args);
	}

	function _afterHidden(){
		var cb = _afterHiddenCallback;
		_afterHiddenCallback = null;
		if(cb) cb();
	}

	function _toggle(visible, className) {
		if(visible) {
			transition.show(_dialog, 'prompt', className);
		} else {
			transition.hide(_dialog, 'prompt', _className);
		}
	}

	function _show(html, duration, className, cb){
		cb = only_once(cb);

		if(!_dialog) {
			_modal = $('<div class="notification"/>').appendTo('body');
			_dialog = $('<div class="notification-window"/>').appendTo('body')
				.on('hidden showing shown hiding', function(e) {
					_state = e.type;
				})
				.on('tap', function(e) {
					if(e.isDefaultPrevented()) {
						return;
					}
					notification.hide();
				});

			return void setTimeout(_bind(_show, arguments), 20);
		}

		if(_state !== STATES.HIDDEN) {
			return void _hide(false, _bind(_show, arguments));
		}

		_dialog.html(html)
			.removeAttr('class')
			.attr('class', 'notification-window')
			.addClass(className)
			.css({
				width: win.width() * 0.8 | 0,
				height: 'auto'
			});

		_dialog.css({
			height: Math.min(_dialog.height(), win.height() * 0.8) | 0,
			left: (win.width() - _dialog.width()) / 2 | 0
		});

		_dialog.css({
			top: (win.height() - _dialog.height()) / 2 | 0
		});

		transition.show(_modal, 'modal');
		clearTimeout(_tmr_show);
		_dialog.one('shown', function(){
			_className = className;
			if(duration > 0) {
				_tmr_show = setTimeout(_hide.bind(null, null, cb), duration * 1000);
			} else {
				_dialog.one('hidden', cb);
			}
		});

		_toggle(true, className);
	}

	function _hide(hideModal, cb){
		cb = only_once(cb);

		if(_state == STATES.HIDDEN) {
			return void setImmediate(cb);
		}

		if(_state === STATES.SHOWING) {
			return void _dialog.one('shown', _bind(_hide, arguments));
		}

		_afterHiddenCallback = function(){
			setImmediate(cb);
		};

		if(_state === STATES.SHOWN) {
			_dialog.one('hidden', _afterHidden);
			_toggle(false);
			if(hideModal !== false) {
				transition.hide(_modal, 'modal');
			}
		}
	}

	function _builder(title, description, icon) {
		var frag = $(document.createDocumentFragment());
		if (icon) {
			$('<span class="icon"/>').addClass(icon).appendTo(frag);
		}
		if (title) {
			$('<strong class="text bold" />').html(title).appendTo(frag);
		}
		$('<small />').html(description || '').appendTo(frag);

		return frag;
	}

	var notification =  window.notification = {
		show: function(title, description, icon, duration, cb){
			var frag;
			if(!title) {
				frag = '<div data-loading="white" />';
			} else {
				frag = _builder(title, description, icon);
			}
			return _show(frag, duration, null, cb);
		},

		hide: function(){
			_hide();
		},

		error: function _error(title, description, icon, duration, callback) {
			if ($.type(title) === 'object') {
				var options = title;
				return _error.call(this, options.title, options.description, options.icon, options.duration, options.callback);
			}
			return _show(_builder(title, description, icon || 'remove-sign'), duration, 'error', callback);
		},

		success: function _success(title, description, icon, duration, cb) {
			if ($.type(title) === 'object') {
				var options = title;
				return _success.call(this, options.title, options.description, options.icon, options.duration, options.callback);
			}
			return _show(_builder(title, description, icon || 'ok'), duration, 'success', cb);
		},

		successThenBack: function successThenBack(title, description, icon, duration, callback) {
			if ($.type(title) === 'object' && 'title' in title) {
				return successThenBack(title.title, title.description, title.icon, title.duration, title.callback);
			}

			notification.success(title, description, icon, duration, function() {
				router.back();
				if (callback) callback.apply(null, arguments);
			});
		},

		errorThenBack: function errorThenBack(title, description, icon, duration, callback) {
			if ($.type(title) === 'object' && 'title' in title) {
				return errorThenBack(title.title, title.description, title.icon, title.duration, title.callback);
			}

			notification.error(title, description, icon, duration, function() {
				router.back();
				if (callback) callback.apply(null, arguments);
			});
		},

		html: function(html, icon, className, cb) {
			return _show(html, null, 'html ' + className, cb);
		},

		push: function(text, duration, tap) {
			var options = text;
			if (typeof options === 'object') {
				text = options.text;
				duration = options.duration;
				tap = options.callback;
			}

			var elm = $('<div class="notification push" />');
			elm
				.text(text)
				.appendTo('body')
				.style('top', -screen.height)
				.show()
				.style('top', -elm.height());

			if (options.canDismiss !== false) {
				$('<span class="dismiss icon remove on-right"></span>')
					.prependTo(elm);

				var firstY = 0,
					lastY = 0,
					numMoves = 0,
					style = elm[0].style,
					touching = true;
				elm
					.on('touchstart', function(e) {
						firstY = lastY = e.touches && e.touches[0] ? e.touches[0].pageY : e.pageY;
						numMoves = 0;
						touching = Date.now();
					})
					.on('touchmove', function(e) {
						if (!touching) return;
						var y = e.touches && e.touches[0] ? e.touches[0].pageY : e.pageY;
						numMoves += y < lastY ? 1 : -1;
						lastY = y;
						var delta = lastY - firstY;
						if (delta <= 0) {
							style.top = delta + 'px';
						}
					})
					.on('touchend', function() {
						touching = false;
						if (numMoves > 3) {
							duration = 100;
							hide();
							if (options.dismiss) options.dismiss.apply(elm[0]);
						} else {
							style.top = '0px';
						}
						numMoves = 0;
					});
			}

			var hide = function() {
				window.setImmediate(function() {
					if (!elm || !elm[0]) return;
					move(elm[0])
						.set('top', -elm.height())
						.duration(duration)
						.end();
				});
				setTimeout(function() {
					if (!elm || !elm[0]) return;
					elm.remove();
					style = undefined;
					elm = undefined;
					options = undefined;
				}, constants.DURATION);
			};

			if (options.className) {
				elm.addClass(options.className);
			}

			elm.one('tap', function(e) {
				duration = 200;
				hide();
				if ($(e.target || e.srcElement).hasClass('dismiss')) {
					if (options.dismiss) options.dismiss.apply(this);
				} else {
					if (tap) tap.apply(this);
				}
			});

			window.setImmediate(function() {
				duration = constants.DURATION;
				move(elm[0])
					.set('top', 0)
					.duration(duration)
					.end();
			});

			setTimeout(hide, (duration || 5) * 1000);
		},

		multi: function(options) {
			if (!options) return;
			if (!options.items) {
				options = {
					items: options
				};
			}

			var frag = _builder(options.title || options.text, options.description, options.icon);

			if (!Array.isArray(options.items)) {
				var dict = options.items;
				options.items = Object.keys(dict)
					.map(function(label) {
						var item = dict[label];
						if ($.isFunction(item)) {
							return {
								callback: item,
								label: label
							};
						}

						if(!item.label) {
							item.label = label;
						}
						return item;
					});
			}

			options.items.forEach(function(item) {
				$('<button class="anchor" />')
					.addClass(item.className || '')
					.text(item.label || '')
					.on('tap', function() {
						if (item.callback) {
							_dialog.one('hidden', item.callback);
						}
						notification.hide();
					})
					.appendTo(frag);
			});

			utils.hideKeyboard();
			return notification.html(frag, null, options.className || 'multi', options.callback || $.noop);
		},

		confirm: function(options) {
			return this.multi({
				title: options.title,
				description: options.description,
				className: 'confirm',
				items: {
					accept: options.accept,
					cancel: Object.assign(options.cancel, { className: 'text red' })
				}
			});
		}
	};

	function only_once(cb) {
		if (!cb) return $.noop;
		return function() {
			var c = cb;
			cb = null;
			if (c) c.apply(this, arguments);
		};
	}

})(window);

(function(window, undefined) {
	'use strict';

	function getPageX(e) {
		var touches = e.touches || (e.originalEvent ? e.originalEvent.touches : null);
		return touches && touches.length > 0 ? touches[0].pageX : e.pageX;
	}

	var win = $(window),
		body = $('body'),
		html = $('html');

	var current = window.current = {
		article: null,
		aside: null
	};

	Object.defineProperty(current, 'section', {
		get: function(){
			return router.history.last();
		}
	});

	var constants = window.constants = {
		DURATION: 400,
		EASE: 'in-out',
		ASIDE_WIDTH: 0.7,
		TRANSITION: 'slip'
	};

	win.on('resize deviceorientationchange init', function(){
		var win_height = win.height();
		var win_width = win.width();
		var asides = $('aside');
		var sections = $('section');

		asides
			.height(win_height)
			.css({
				right: win_width,
				width: win_width * constants.ASIDE_WIDTH | 0
			})
			.insertAfter(sections.last());

		body.width(win_width).height(win_height);
		html
			.toggleClass('portrait', win_width < win_height)
			.toggleClass('landscape', win_width > win_height);

		sections.height(win_height).width(win_width);
		sections.forEach(function(section){
			section = $(section);
			var headers = section.children('header:visible');
			headers.addClass('cf');

			var footers = section.children('footers:visible');
			var articles = section.children('article');
			var header_height = headers.height();
			var footer_height = footers.height();
			articles.forEach(function(article) {
				article = $(article);
				article.height(win_height - header_height - footer_height);
			});
		});
	});

	$(function(){
		win.trigger('init');
		transition.toggleClasses(false);
		router.section('#main');
		$('aside').visible(true);
	});

	$.on('tap', '.not-routing [data-section]', function(e) {
		e.preventDefault();
		var id = $(this).data('section');
		if(id === 'back') {
			router.back();
		} else {
			router.section('#' + id);
		}
	})
	.on('tap', '.not-routing [data-aside]', function(e) {
		e.preventDefault();
		router.aside('#' + $(this).data('aside'));
	});

	(function(){
		var _aside_x, _aside, _aside_width, _aside_delta;
		$.on('touchstart mousedown', '.not-routing [data-aside]', function(e) {
			_aside_x = getPageX(e);
			_aside_delta = 0;
			_aside = $('#' + $(this).data('aside'));
			if(_aside.length === 0) {
				_aside = null;
				return;
			}
			_aside_width = _aside.width();
		})
		.on('touchmove mousemove', function(e) {
			if(!_aside) return;
			e.preventDefault();
			_aside_delta = getPageX(e) - _aside_x;
			_aside_delta = Math.max(0, _aside_delta);
			_aside_delta = Math.min(_aside_width, _aside_delta);
			body.css('transform', 'translateX(' + _aside_delta + 'px)');
		})
		.on('touchend mouseup', function(e) {
			if(!_aside) return;
			if(_aside_delta !== 0) {
				e.preventDefault();
				var show = _aside_delta > _aside_width / 2;
				if(show) {
					router.aside(_aside);
				} else {
					router.aside();
				}
			}
			_aside = null;
		});

	})();

})(window);
