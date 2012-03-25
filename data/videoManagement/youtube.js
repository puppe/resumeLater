var player = XPCNativeWrapper.unwrap(unsafeWindow.document.getElementById("movie_player"));

var time = player.getCurrentTime();
player.pauseVideo();

self.port.emit("time", time);
