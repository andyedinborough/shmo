(function(window, undefined){
	'use strict';

	Array.prototype.last = function() {
		return this[this.length - 1];
	};

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

	var transition = {
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

		get: function(name) {
			name = name || 'slide';
			var trans = transition[name];
			if(!trans) return;
			trans = trans.run || trans;
			if(typeof trans === 'function') return trans;
			return transition.get(null);
		},

		forward: function(elm1, elm0, cb) {
			var name = elm1.data('transition') || constants.TRANSITION;
			transition.toggleClasses(true);
			elm1.visible(true).insertAfter(elm0);

			var mv = move(elm1.length > 0 ? elm1[0] : elm1)
				.duration(0);
			transition.reset(mv, name);
			mv.end(function(){
				var mv1 = transition.move(elm1);
				var mv0 = transition.move(elm0);
				var func = transition.get(name);
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
			var name = elm0.data('transition') || constants.TRANSITION;
			var mv0 = transition.move(elm0);
			var mv1 = transition.move(elm1);
			transition.reset(mv1);
			transition.reset(mv0, name);
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

		reset: function(mv, name) {
			mv.opacity(1)
				.translate(0, 0)
				.rotate(0)
				.scale(1);

			if(name && transition[name] && transition[name].reset) {
				transition[name].reset(mv);
			}

			return mv;
		},

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
		}
	};

	window.transition = transition;

})(window);

(function(window, undefined) {
	'use strict';

	function getPageX(e) {
		return e.touches && e.touches.length > 0 ? e.touches[0].pageX : e.pageX;
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
