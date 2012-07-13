var playerId;

if (document.getElementById("movie_player") == null) {
	playerId = 'movie_player-html5';
} else {
	playerId = 'movie_player';
}

var player = document.getElementById(playerId).wrappedJSObject;

var time = player.getCurrentTime();
player.pauseVideo();

// make sure not an unsafe object
time= String(time);
if (typeof time == "string") self.port.emit("time", time);
// vim: set noet ts=2 sw=2 sts=0
