(function(window, undefined) {
	'use strict';

	var _uuid = 0, _initd= {};
	$.fn.forEach = Array.prototype.forEach;

	$.fn.boot = function(force){
		var id = this.id();
		if(!_initd[id] || force){
			_initd[id] = true;
			this.trigger('boot');
		}
		return this;
	};

	$.fn.id = function(){
		var id = this[0].id;
		if(!id) {
			id = 'e' + _uuid++;
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
