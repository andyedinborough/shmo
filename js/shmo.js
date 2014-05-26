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
