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

	var router = {
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
				section.visible(true).appendTo(body);
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
					.x(win.width() * constants.ASIDE_WIDTH)
					.end(_cb);
			}
			return aside;
		}
	};

	window.router = router;

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
			var name = elm1.data('transition') || 'slide';
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
				mv0.end();
			});
		},

		back: function(elm1, elm0, cb) {
			transition.toggleClasses(true);
			var name = elm0.data('transition') || 'slide';
			var mv0 = transition.move(elm0);
			var mv1 = transition.move(elm1);
			transition.reset(mv1);
			transition.reset(mv0, name);
			mv1.end(function(){
				elm1.insertAfter(elm0);
				transition.toggleClasses(false);
				if(cb) cb();
			});
			mv0.end();
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
		ASIDE_WIDTH: 0.7
	};

	win.on('resize deviceorientationchange init', function(){
		var win_height = win.height();
		var win_width = win.width();
		var asides = $('aside');
		asides
			.height(win_height)
			.css({
				right: win_width,
				width: win_width * constants.ASIDE_WIDTH
			});

		body.width(win_width).height(win_height);
		html
			.toggleClass('portrait', win_width < win_height)
			.toggleClass('landscape', win_width > win_height);

		var sections = $('section');
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
	});

	$(document)
		.on('tap', '.not-routing [data-section]', function(e) {
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

})(window);
