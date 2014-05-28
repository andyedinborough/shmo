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
			var name = elm1.data('transition');
			if(!name) {
				name = constants.TRANSITION;
				elm1.attr('data-transition', name);
			}
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
					mv0.x(-win.width() / 2).rotateY(-5);
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
