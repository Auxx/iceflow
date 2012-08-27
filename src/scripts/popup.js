$(function() {
	function switcher(name, value) {
		if(name == 'general_player_icon') $('#general_open_player_by_fs').attr('disabled', value != '1')
	}

	$('ul.tabs > li > a').click(function() {
		var self = $(this)
		var parent = self.parent()
		parent.siblings().removeClass('active').children('a').each(function(index, element) {$('#' + element.href.split('#', 2)[1]).hide()})
		parent.addClass('active')
		$('#' + self.attr('href').split('#', 2)[1]).show()
	})

	$('fieldset input, fieldset textarea').each(function() {
		var self = $(this)
		var name = self.attr('name')
		var value = ExtensionGrill.config.get(name)
		switcher(name, value)
		switch(self.attr('type')) {
			case 'radio':
				if(value == self.val()) self.attr('checked', true)
				break
			case 'checkbox':
				if(parseInt(value, 10) == 1) self.attr('checked', true)
				break
			default:
				if(value instanceof Array)
					self.val(value.join('\n'))
				else
					self.val(value)
				break
		}
		if(self.is('input')) {
			self.change(function() {
				var name = self.attr('name')
				var value = self.val()
				if($(this).attr('type') == 'checkbox')
					ExtensionGrill.config.set(name, $(this).attr('checked') ? 1 : 0)
				else
					ExtensionGrill.config.set(name, value)
				switcher(name, value)
			})
		}
	})

	$('#exceptions_btn_save').click(function() {
		$(this).parents('.panel').find('textarea').each(function() {
			var self = $(this)
			ExtensionGrill.config.set(self.attr('name'), self.val().split('\n'))
		})
	})

	$('#exceptions_btn_reset').click(function() {
		$('#exceptions textarea[name="exceptions_list"]').val(defaults.exceptions_list.join('\n'))
	})
})