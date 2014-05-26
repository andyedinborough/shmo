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
