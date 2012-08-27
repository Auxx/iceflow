<?

$extension = [
	'name' => 'iceflow',
	'version' => '1.0',
	'description' => 'iceflow turns links on the web pages to video hosting services like YouTube into inline video player.',
	'icon' => 'icons/128x128-icon.png',
	'author' => [
		'name' => 'Aux',
		'email' => 'aux@hexmode.org',
		'url' => 'http://hexmode.org/iceflow'
	],

	'runtime' => [
		'main' => 'background.html',
		'toolbar' => [
			'icon' => 'icons/64x64-icon.png',
			'title' => 'iceflow',
			'popup' => 'popup.html',
			'width' => 400,
			'height' => 400
		]
	],

	'opera' => [
		'id' => 'http://hexmode.org/iceflow'
	],

	'chrome' => [
		'content_scripts' => [
			[
				'matches' => ['*://*/*'],
				'js' => ['includes/iceflow.php.js'],
				'run_at' => 'document_start'
			]
		]
	]
];

?>