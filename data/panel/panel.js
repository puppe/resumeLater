var privateBrowsing = false;

$("#resumeLaterButton").click(function() {
	if (privateBrowsing) {
		showNotification(_('private browsing'));
	}
	else {
		self.port.emit("save");
	}
});

self.port.on('update', updateList);
self.port.on('no video', function() {
	showNotification(_('no video'));
});

// private browsing
self.port.on('private browsing start', function() {
	privateBrowsing = true;
	$('#resumeLaterButton').attr('src', 'resumeLater-off.svg');
});

self.port.on('private browsing stop', function() {
	privateBrowsing = false;
	$('#resumeLaterButton').attr('src', 'resumeLater.svg');
});

function updateList(videos) {

	function removeFactory(vid, title) {

		var removeButtonEnabled = true;

		return function() {
			if (!removeButtonEnabled) {
				return;
			}
			removeButtonEnabled = false;

			var removeButtonBox = $(this);

			var dialogBox = $('<div class="dialogBox"></div>');
			dialogBox.insertAfter(removeButtonBox.parent());

			var dialogText = $('<p>' + _('remove?') + '</p>');
			dialogText.appendTo(dialogBox);

			var dialogButtons = $('<p></p>');
			dialogButtons.appendTo(dialogBox);

			var confirm = $('<span class="clickableBad dialogButton">' + _('Okay') + '</span>');
			var cancel = $('<span class="clickable dialogButton">' + _('Cancel') + '</span>');

			confirm.click(function() {
				console.info("Remove " + vid);
				self.port.emit('remove', vid);
				dialogBox.remove();
				removeButtonEnabled = true;
			});

			cancel.click(function() {
				dialogBox.remove();
				removeButtonEnabled = true;
			});

			dialogButtons.append(confirm, cancel);
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

function showNotification(text) {
	console.log(text);

	var dialogBox = $('<div class="dialogBox"></div>')
	dialogBox.insertBefore($('.footerButtons'));

	var dialogText = $('<p>' + text + '</p>');
	dialogText.appendTo(dialogBox);

	var dialogButtons = $('<p></p>');
	dialogButtons.appendTo(dialogBox);

	var confirm = $('<span class="clickable confirmNotification">' + _('Okay') + '</span>');
	confirm.click(function()  {
		dialogBox.remove();
	});

	confirm.appendTo(dialogButtons);
}
// vim: set noet ts=2 sw=2 sts=0
