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
