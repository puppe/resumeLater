$("#resumeLaterButton").click(function() {
	self.port.emit("save");
});

self.port.on('update', updateList);

function updateList(videos) {

	console.debug(JSON.stringify(videos));

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
	
	for each (video in videos) {
		var videoElement = $('<tr class="video"></tr>');
		videoElement.attr('id', video.vid);
		
		var videoInfoCell = $('<td class="videoInfoCell, clickable">'
			+ '<span class="videoTitle">' + video.title + '</span>'
			+ '<span class="videoTime">' + prettyTime(video.time) + '</span></td>');
		videoInfoCell.click(playFactory(video.vid));
		videoInfoCell.appendTo(videoElement);
		
		var removeButtonCell = $('<td class="removeButtonCell"></td>');
		removeButtonCell.appendTo(videoElement);
		
		var removeButton = $('<button title="Remove this video"><img src="remove.svg" height="16" alt="Remove this video"/></button>');
		removeButton.click(removeFactory(video.vid, video.title));
		removeButton.appendTo(removeButtonCell);
		
		videoList.append(videoElement);
	}
}
