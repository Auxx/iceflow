// ==UserScript==
// @include http://*/*
// @include https://*/*
// @match http://*/*
// @match https://*/*
// ==/UserScript==

//<?="\n".$this->import('config')?>


window.addEventListener('DOMContentLoaded', function() {

	if(ExtensionGrill.config.get('general_is_enabled') != '1') return

	var showIcon = ExtensionGrill.config.get('general_player_icon')
	var linkClickable = showIcon != '1' || ExtensionGrill.config.get('general_open_player_by') == 'link'
	var disableConflicts = ExtensionGrill.config.get('general_disable_conflicts') == '1'

	var addLinksGoto = parseInt(ExtensionGrill.config.get('general_add_link_goto'), 10) == 1
	var addLinksFlash = parseInt(ExtensionGrill.config.get('general_add_link_flash'), 10) == 1
	var addLinksPopup = parseInt(ExtensionGrill.config.get('general_add_link_popup'), 10) == 1

	var currentVideoPage = ''
	var currentFlash = ''

	var playIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAACpF6WWAAAABGdBTUEAAK%2FINwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAHRSURBVHjatFU9i8JAEH2J8QODgiCWiihY2FhoY6FoY%2Bsv8PdYXnHlCdofgp2FraCF2oh2ooKdhyCKwai5zHLmTIx3kcs9mGzCzL6dfTO7gaIoUO1VtZ3yN2xVqxIfEb4p9qLKUYYARNiHD159uJ%2BdNZ%2FP0Ww2UalU0G63jW6RMpXVF%2BEnks1mg8FggG63y8bFYgFZlnE%2Bn9k4Ho%2Fh9Xqv4ZIpGQXPZjP0%2B330ej2MRiOs12s4HA7N%2FH4%2FotEoEokEnE6nbr6OdDKZoFarYTqdYrlc4nQ6MQKe5%2BF2uxEOh5HJZJDL5ZBMJhEMBpnPCG371Ar5fB6r1YoR0HcgEEA8HkexWGRklJUgCL9J%2Fr19juMQi8Xg8%2FlQKpVQKBQQiUTYN%2Fmega5QjUYDw%2BEQqVSKZbvb7bDf7yFJErbbLQ6Hwx0BFSqbzaJcLkMUxftC0eRWq4VOp8P0vFwumo%2B0M8uYOiMUCulk0ZGSjh6Ph1XWKmgxl8v1uPpf94CmsSX91DhjrGDWo2RWQTJdE3mYKRHeavkbzOJ1pMfjka1MFX0mU2O8jjSdTrNVidwqKJZa8Pao3l0o1Ju0pWca3nBApH%2B7T99hL%2BrX3qzb9I96Ib5PAQYAU2vNAzKd05QAAAAASUVORK5CYII%3D'
	var popup = null

	var handlers = {
		youtube: {
			needsHook: function(href) {return(href.match('youtube.com/watch') || href.match(/youtube.com\/vi{0,1}\//) || href.match('youtu.be'))},
			getId: function(href) {return(href.match('//youtu.be') ? href.replace(/.*youtu.be\/([-_a-zA-Z0-9]+)/, '$1') : href.replace(/.*[?&/]vi{0,1}[=/]([-_a-zA-Z0-9]+).*/, '$1'))},
			drawPlayer: function(href) {
				var player = document.createElement('embed')
				var id = this.getId(href)
				currentFlash = 'http://www.youtube.com/v/' + id + '?version=3&autoplay=1&fs=1'
				currentVideoPage = 'http://www.youtube.com/watch?v=' + id
				player.setAttribute('src', currentFlash)
				player.setAttribute('type', 'application/x-shockwave-flash')
				player.setAttribute('allowfullscreen', 'true')
				player.setAttribute('allowScriptAccess', 'always')
				player.setAttribute('width', '800')
				player.setAttribute('height', '480')
				return(player)
			}
		},
		vimeo: {
			needsHook: function(href) {return(href.match('vimeo.com/video/') || href.match('vimeo.com/[0-9]+') || href.match('vimeo.com/moogaloop.swf'))},
			getId: function(href) {
				if(href.match('player'))
					return(href.replace(/.*video\/([0-9]+).*/, '$1'))
				else
				if(href.match('moogaloop.swf'))
					return(href.replace(/.*clip_id=([0-9]+).*/, '$1'))
				else
					return(href.replace(/.*vimeo.com\/([0-9]+).*/, '$1'))
			},
			drawPlayer: function(href) {
				var player = document.createElement('embed')
				var id = this.getId(href)
				currentFlash = 'http://vimeo.com/moogaloop.swf?clip_id=' + id + '&amp;server=vimeo.com&amp;fullscreen=1&amp;autoplay=1'
				currentVideoPage = 'http://vimeo.com/' + id
				player.setAttribute('src', currentFlash)
				player.setAttribute('type', 'application/x-shockwave-flash')
				player.setAttribute('allowfullscreen', 'true')
				player.setAttribute('allowScriptAccess', 'always')
				player.setAttribute('width', '800')
				player.setAttribute('height', '480')
				return(player)
			}
		},
		mpora: {
			needsHook: function(href) {return(href.match('mpora.[a-z]+/watch/') || href.match('video.mpora.com/ep/'))},
			getId: function(href) {return(href.match('watch') ? href.replace(/.*watch\/([0-9a-zA-Z]+).*/, '$1') : href.replace(/.*ep\/([0-9a-zA-Z]+).*/, '$1'))},
			drawPlayer: function(href) {
				var player = document.createElement('embed')
				var id = this.getId(href)
				currentFlash = 'http://video.mpora.com/ep/' + id + '/'
				currentVideoPage = 'http://video.mpora.com/watch/' + id
				player.setAttribute('src', currentFlash)
				player.setAttribute('type', 'application/x-shockwave-flash')
				player.setAttribute('allowfullscreen', 'true')
				player.setAttribute('allowScriptAccess', 'always')
				player.setAttribute('name', 'mporaplayer_' + id)
				player.setAttribute('width', '800')
				player.setAttribute('height', '480')
				player.setAttribute('bgcolor', '#000000')
				return(player)
			}
		},
		pinkbike: {
			needsHook: function(href) {return(href.match('pinkbike.com/video/') || href.match('pinkbike.com/v/'))},
			getId: function(href) {return(href.match('video') ? href.replace(/.*video\/([0-9]+).*/, '$1') : href.replace(/.*v\/([0-9]+).*/, '$1'))},
			drawPlayer: function(href) {
				var player = document.createElement('embed')
				var id = this.getId(href)
				currentFlash = 'http://www.pinkbike.com/v/' + id
				currentVideoPage = 'http://www.pinkbike.com/video/' + id
				player.setAttribute('src', currentFlash)
				player.setAttribute('type', 'application/x-shockwave-flash')
				player.setAttribute('allowfullscreen', 'true')
				player.setAttribute('allowScriptAccess', 'always')
				player.setAttribute('width', '800')
				player.setAttribute('height', '480')
				return(player)
			}
		}
	}

	function matchLink(href) {
		if(href.match('youtube.com') || href.match('youtu.be')) return('youtube')
		if(href.match('vimeo.com')) return('vimeo')
		if(href.match('mpora.[a-z]')) return('mpora')
		if(href.match('pinkbike.com')) return('pinkbike')
		return(false)
	}

	function isLinkBlank(link) {
		return(link.offsetHeight == 0 && link.innerHTML == '')
	}

	function hidePlayer(e) {
		popup.overlay.style.display = 'none'
		var children = popup.container.childNodes
		for(var i = children.length - 1; i >= 0; i--) popup.container.removeChild(children[i])
		e.preventDefault()
	}

	function createButton(label, onRight, handler) {
		var button = document.createElement('a')
		button.innerHTML = label
		button.style.display = 'block'
		if(onRight)
			button.style.cssFloat = 'right'
		else {
			button.style.cssFloat = 'left'
			button.style.marginRight = '14px'
		}
		button.style.fontFamily = 'segoe ui'
		button.style.fontSize = '11px'
		button.style.fontWeight = 'normal'
		button.style.color = '#000'
		button.style.textDecoration = 'none'
		button.style.marginTop = '3px'
		button.style.cursor = 'pointer'
		button.addEventListener('click', handler, false)
		return(button)
	}

	function createPopup() {
		if(!popup) {
			popup = {
				overlay: document.createElement('div'),
				player: document.createElement('div'),
				container: document.createElement('div')
			}

			popup.overlay.style.position = 'fixed'
			popup.overlay.style.zIndex = '1000'
			popup.overlay.style.left = '0'
			popup.overlay.style.top = '0'
			popup.overlay.style.width = '100%'
			popup.overlay.style.height = '100%'
			popup.overlay.style.backgroundColor = 'rgba(0, 0, 0, .8)'
			popup.overlay.addEventListener('click', hidePlayer, false)

			popup.player.style.position = 'fixed'
			popup.player.style.zIndex = '1001'
			popup.player.style.backgroundColor = '#FFF'
			popup.player.style.border = '1px solid #DDD'
			popup.player.style.borderRadius = '5px'
			popup.player.style.padding = '5px'
			popup.player.addEventListener('click', function(e) {e.stopPropagation()}, false)
			popup.player.appendChild(popup.container)

			popup.player.appendChild(createButton('(x) close', true, hidePlayer))
			if(addLinksGoto) popup.player.appendChild(createButton('Go to video page', false, gotoVideoPage))
			if(addLinksFlash) popup.player.appendChild(createButton('Go to Flash player', false, gotoFlash))
			popup.overlay.appendChild(popup.player)
			document.body.appendChild(popup.overlay)
		}
		popup.overlay.style.display = 'block'
	}

	function gotoVideoPage(e) {
		e.stopPropagation()
		hidePlayer(e)
		if(addLinksPopup)
			window.open(currentVideoPage, '_blank')
		else
			location.href = currentVideoPage
	}

	function gotoFlash(e) {
		e.stopPropagation()
		hidePlayer(e)
		if(addLinksPopup)
			window.open(currentFlash, '_blank')
		else
			location.href = currentFlash
	}

	function repositionPopup(width/*, height*/) {
		var cx = (document.body.offsetWidth - width) / 2
		popup.player.style.left = cx + 'px'
		popup.player.style.top = '100px'
	}

	function openPlayer(link, provider) {
		createPopup()
		repositionPopup(800, 480)
		setTimeout(function() {popup.container.appendChild(handlers[provider].drawPlayer(unescape(link.href)))}, 100)
	}

	function createPlayerIcon(link) {
		if(showIcon == '0') return(null)
		if(showIcon == '2' && link.offsetHeight > 0) return(null)

		var icon = document.createElement('span')
		icon.style.display = 'inline-block'
		icon.style.width = '21px'
		icon.style.height = '21px'
		icon.style.paddingLeft = '5px'
		icon.style.verticalAlign = 'middle'
		icon.style.background = 'url(' + playIcon + ') 5px 0 no-repeat'
		link.appendChild(icon)
		return(icon)
	}

	function hookLink(link, provider) {
		if(link.getAttribute('iceflow-hooked') == '1') return
		link.setAttribute('iceflow-hooked', '1')
		var icon = createPlayerIcon(link)

		function handleClick(e) {
			if((ExtensionGrill.config.get('general_alt_click') == '1') != e.altKey) {
				e.preventDefault()
				e.stopPropagation()
				openPlayer(link, provider)
			}
		}

		if(linkClickable)
			link.addEventListener('click', handleClick, false)
		else if(icon)
			icon.addEventListener('click', handleClick, false)

		if(disableConflicts) {
			link.onclick = null
			link.onmousedown = null
			link.onmouseup = null
		}
	}

	function prepareException(exception) {
		var e = exception.trim()
		if(e != '')
			return(new RegExp(e.replace(/([\\/.&$?+^-])/g, '\\$1').replace('*', '.*')))
		else
			return(false)
	}

	function skipHooking() {
		var skip = false
		var exceptions = ExtensionGrill.config.get('exceptions_list')
		var href = window.location.href
		for(var i = 0; i < exceptions.length; i++) {
			var e = prepareException(exceptions[i])
			if(e !== false) {
				skip = href.match(e) !== null
				if(skip) break
			}
		}
		return(skip)
	}

	function hookLinkList(linkList) {
		for(var i = 0; i < linkList.length; i++) {
			var link = linkList[i]
			if(link.href) {
				var provider = matchLink(link.href)
				if(provider && handlers[provider].needsHook(link.href)) hookLink(link, provider)
			}
		}
	}

	function hookDirty() {
		if(window.location.href.match('dirty.ru') !== null) {
			var list = document.querySelectorAll('div.post_video')
			for(var i = 0; i < list.length; i++) {
				var link = list[i]
				link.href = link.style.backgroundImage
				var provider = matchLink(link.href)
				if(provider && handlers[provider].needsHook(link.href)) hookLink(link, provider)
			}
		}
	}

	if(!skipHooking()) {
		hookLinkList(document.getElementsByTagName('a'))
		hookDirty()
		window.addEventListener('DOMNodeInsertedIntoDocument', function(e) {
			if(e.target.tagName == 'A') {
				if(e.target.href) {
					var provider = matchLink(e.target.href)
					if(provider && handlers[provider].needsHook(e.target.href)) hookLink(e.target, provider)
				}
			}
		}, true)
	}

}, false);


//<? if($data->targetName == 'opera') echo "\n".$this->import('flash-fix'); ?>