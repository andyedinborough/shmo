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
