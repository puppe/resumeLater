$("#resumeLaterButton").click(function() {
	self.port.emit("save");
});

self.port.on('update', updateList);

function updateList(videos) {

	function removeFactory(vid, title) {
		return function() {
			if (confirm('Remove "' + title + '"?')) {
				console.info("Remove " + vid);
				self.port.emit('remove', vid);
			}
		}
	}
	
	function playFactory(vid) {
		return function() {
			console.info("Play " + vid);
			self.port.emit('play', vid);
		}
	}
	
	function prettyTime(time) {
		minutes = Math.floor(time / 60).toString();
		seconds = Math.floor(time % 60).toString();
		if (seconds.length < 2)
			seconds = "0" + seconds;
		return minutes + ":" + seconds;
	}

	const videoList = $(".videoList");
	videoList.empty();
	
	videos.forEach(function(video) {
		var videoElement = $('<li class="video"></li>');
		videoElement.attr('id', video.vid);
		
		var videoInfoCell = $('<div class="clickable videoInfoCell">'
			+ '<span class="videoTitle">' + video.title + '</span>'
			+ '<span class="videoTime">' + prettyTime(video.time) + '</span></div>');
		videoInfoCell.click(playFactory(video.vid));
		videoInfoCell.appendTo(videoElement);
		
		var removeButtonCell = $('<div class="removeButtonCell"></div>');
		removeButtonCell.appendTo(videoElement);
		
		var removeButton = $('<div><img class="clickable" src="remove.svg" width="16" alt="Remove this video"/></div>');
		removeButton.click(removeFactory(video.vid, video.title));
		removeButton.appendTo(removeButtonCell);
		
		videoList.append(videoElement);
	});
}
