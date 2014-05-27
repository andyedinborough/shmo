(function(window, undefined) {
	'use strict';

	window.utils = {
		hideKeyboard: function(){
			var elm = document.querySelector(':focus');
			if(elm && elm.blur) elm.blur();
		}
	};

})(window);