$("#resumeLaterButton").click(function() {
	self.port.emit("save");
});

self.port.on('update', updateList);

function updateList(videos) {

	function removeFactory(vid, title) {

		var removeButtonEnabled = true;

		return function() {
			if (!removeButtonEnabled) {
				return;
			}
			removeButtonEnabled = false;

			var removeButtonBox = $(this);

			var confirmRemoveDialogBox = $('<div class="confirmRemoveDialogBox"></div>');
			confirmRemoveDialogBox.insertAfter(removeButtonBox.parent());

			var confirmRemoveDialog = $('<span class="confirmRemoveDialog">Remove this video? </span>');
			confirmRemoveDialog.appendTo(confirmRemoveDialogBox);

			var confirmRemove = $('<span class="clickableBad">Confirm</span>');
			var cancelRemove = $('<span class="clickable">Cancel</span>');

			confirmRemove.click(function() {
				console.info("Remove " + vid);
				self.port.emit('remove', vid);
				confirmRemoveDialogBox.remove();
				removeButtonEnabled = true;
			});

			cancelRemove.click(function() {
				confirmRemoveDialogBox.remove();
				removeButtonEnabled = true;
			});

			confirmRemoveDialog.append(confirmRemove, '/', cancelRemove);
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
		videoElement.appendTo(videoList);
		
		var videoFloatContainer = $('<div class="videoFloatContainer clearfix"></div>');
		videoFloatContainer.appendTo(videoElement);

		var videoInfoBox = $('<div class="clickable videoInfoBox">'
			+ '<span class="videoTitle">' + video.title + '</span>'
			+ '<span class="videoTime">' + prettyTime(video.time) + '</span></div>');
		videoInfoBox.click(playFactory(video.vid));
		videoInfoBox.appendTo(videoFloatContainer);
		
		var removeButtonBox = $('<div class="clickable removeButtonBox"><img src="remove.svg" width="16" alt="Remove this video"/></div>');
		removeButtonBox.click(removeFactory(video.vid, video.title));
		removeButtonBox.appendTo(videoFloatContainer);
	});
}
