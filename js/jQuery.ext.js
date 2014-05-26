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
