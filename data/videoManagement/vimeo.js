self.port.on('time', function() {
	var player = XPCNativeWrapper.unwrap(unsafeWindow.playerElement.children[1]);
	player.api_pause();
	self.port.emit('time', player.api_getCurrentTime());
});

self.port.on('play', function(time) {
	var intervalId;
	var counter = 0;
	intervalId = setTimeout(function() {
		if (unsafeWindow.playerElement != null) {
			var player = XPCNativeWrapper.unwrap(unsafeWindow.playerElement.children[1]);
			player.api_play();
			setTimeout(function() {player.api_seekTo(time);}, 2000);
			clearInterval(intervalId);
		} else if (++counter > 5)
			clearInterval(intervalId);
	}, 2000);
});
