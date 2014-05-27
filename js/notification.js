(function(window, undefined) {
	'use strict';

	// The default Lungo notification code has several issues and we should rewrite all
	// of this instead of duck-punching it into oblivion.

	var setImmediate = window.setImmediate;
	var _dialog;
	var _modal;
	var _tmr_show;
	var _addClass;
	var _removeClass;
	var _dialogID;
	var _afterHiddenCallback;
	var STATES = {};
	'HIDDEN SHOWING SHOWN HIDING'.split(' ')
		.forEach(function(x){
			STATES[x] = x;
		});
	var _state = STATES.HIDDEN;
	var _lastTransitionEnd;
	var CUSTOM_EVENT_NAME = 'x-transitionend';

	function _bind(func, args) {
		args = [].slice.apply(args);
		args.unshift(null);
		return Function.prototype.bind.apply(func, args);
	}

	function _afterHidden(){
		var cb = _afterHiddenCallback;
		_afterHiddenCallback = null;
		if(cb) cb();
	}

	function _toggle(visible) {
		_state = visible ? STATES.SHOWING : STATES.HIDING;
		//for some silly reason, the animation didn't fire w/ setImmediate
		setTimeout(visible ? _addClass : _removeClass, 20);
	}

	function _show(html, duration, className, cb){
		cb = only_once(cb);

		if(!_dialog) {
			_modal = $('<div class="notification"/>').appendTo('body');
			_dialog = $('<div class="window"/>').appendTo(_modal)
				.on('transitionend', function(e) {
					var now = e.timeStamp || Date.now();
					if(now - _lastTransitionEnd < 5) {
						// 'transitionend' fires for each property being transitioned
						return;
					}
					_lastTransitionEnd = now;
					_dialog.trigger(CUSTOM_EVENT_NAME);
				})
				.on(CUSTOM_EVENT_NAME, function() {
					_state = _state === STATES.SHOWING ? STATES.SHOWN :
						_state === STATES.HIDING ? STATES.HIDDEN :
						_state;
				});

			_dialogID = _dialog.id();
			_addClass = _dialog.addClass.bind(_dialog, 'show');
			_removeClass = _dialog.removeClass.bind(_dialog, 'show');
		}

		if(_state !== STATES.HIDDEN) {
			return void _hide(false, _bind(_show, arguments));
		}

		_dialog.html(html)
			.removeAttr('class')
			.attr('class', 'window')
			.addClass(className);
		
		_modal.addClass('show');
		clearTimeout(_tmr_show);
		_dialog.one(CUSTOM_EVENT_NAME, function(){
			if(duration > 0) {
				_tmr_show = setTimeout(_hide.bind(null, null, cb), duration * 1000);
			} else {
				_dialog.one(CUSTOM_EVENT_NAME, cb);
			}
		});

		_toggle(true);
	}

	function _hide(hideModal, cb){
		cb = only_once(cb);

		if(_state == STATES.HIDDEN) {
			return void setImmediate(cb);
		}

		if(_state === STATES.SHOWING) {
			return void _dialog.one(CUSTOM_EVENT_NAME, _bind(_hide, arguments));
		}

		_afterHiddenCallback = function(){
			if(hideModal !== false) {
				_modal.removeClass('show');
			}
			setImmediate(cb);
		};

		if(_state === STATES.SHOWN) {
			_dialog.one(CUSTOM_EVENT_NAME, _afterHidden);
			_toggle(false);
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
							_dialog.one(CUSTOM_EVENT_NAME, item.callback);
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
