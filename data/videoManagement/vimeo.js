self.port.on('time', function() {
	var player = XPCNativeWrapper.unwrap(unsafeWindow.playerElement.children[1]);
	player.api_pause();

	var time = player.api_getCurrentTime();

	// make sure not an unsafe object
	time= String(time);
	if (typeof time == "string") self.port.emit("time", time);
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
