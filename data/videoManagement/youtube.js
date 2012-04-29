var playerId;

if (document.getElementById("movie_player") == null) {
	playerId = 'movie_player-html5';
} else {
	playerId = 'movie_player';
}

var player = XPCNativeWrapper.unwrap(unsafeWindow.document.getElementById(playerId));

var time = player.getCurrentTime();
player.pauseVideo();

// make sure not an unsafe object
time= String(time);
if (typeof time == "string") self.port.emit("time", time);
