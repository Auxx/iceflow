// FLASH FIX
(function(opera,HTMLElementPrototype) {
	var fixJava = false;

	var script = document.createElement('script'), scriptLoaded = false, elQueue = [];

	script.src = 'data:text/javascript,'+encodeURIComponent('opera.clickToActivate = '+(function(el) {
		var fn = opera.clickToActivate,
				pEl = fn.selectSingleNode.call(el,'parent::*');

		if( pEl ) {pEl.insertBefore(el,fn.selectSingleNode.call(el,'following-sibling::*'));}
		fn.setAttribute.call(el,'noClickToActivate','activated');
	}).toString());

	script.addEventListener('load',function(e) {
		scriptLoaded = !!this.parentNode.removeChild(this);
		opera.clickToActivate.selectSingleNode = HTMLElementPrototype.selectSingleNode;
		opera.clickToActivate.setAttribute = HTMLElementPrototype.setAttribute;
		for( var el; el = elQueue.shift(); opera.clickToActivate(el) );
	},false);

	opera.addEventListener('PluginInitialized',function(e) {
		var el = e.element;
		if( HTMLElementPrototype.hasAttribute.call(el,'noClickToActivate') ) {return;}
		if( scriptLoaded ) {opera.clickToActivate(el);}
		else {elQueue[elQueue.length] = el;}
	},false);

	document.addEventListener('DOMContentLoaded',{handleEvent: function(e) {
		document.removeEventListener(e.type,this,false);
		document.documentElement.appendChild(script);
		if( !fixJava ) {return;}
		for( var i = 0, el, els = document.selectNodes('//applet'); el = els[i]; i++ ) {
			if( HTMLElementPrototype.hasAttribute.call(el,'noClickToActivate') ) {continue;}
			if( scriptLoaded ) {opera.clickToActivate(el);}
			else {elQueue[elQueue.length] = el;}
		}
	}},false);
})(window.opera, window.HTMLElement.prototype);