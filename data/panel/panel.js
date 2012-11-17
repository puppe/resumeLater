var privateBrowsing = false;
var rlbutton = document.getElementById('resumeLaterButton');

rlbutton.addEventListener('click', function() {
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
	rlbutton.setAttribute('src', 'resumeLater-off.svg');
});

self.port.on('private browsing stop', function() {
	privateBrowsing = false;
	rlbutton.setAttribute('src', 'resumeLater.svg');
});

function updateList(videos) {

	function removeFactory(vid, title) {

		var removeButtonEnabled = true;

		return function(event) {
			if (!removeButtonEnabled) {
				return;
			}
			removeButtonEnabled = false;

			var removeButtonBox = event.target;

			var dialogBox = document.createElement('div');
			dialogBox.className = 'dialogBox';
			removeButtonBox.parentNode.parentNode.appendChild(dialogBox);

			var dialogText = document.createElement('p');
			dialogText.innerHTML = _('remove?');
			dialogBox.appendChild(dialogText);

			var dialogButtons = document.createElement('p');
			dialogBox.appendChild(dialogButtons);

			var confirmButton = document.createElement('span');
			confirmButton.className = 'clickableBad dialogButton';
			confirmButton.innerHTML = _('Okay');

			confirmButton.addEventListener('click', function() {
				console.info("Remove " + vid);
				self.port.emit('remove', vid);
				dialogBox.parentNode.removeChild(dialogBox);
				removeButtonEnabled = true;
			});

			dialogButtons.appendChild(confirmButton);

			var cancelButton = document.createElement('span');
			cancelButton.className = 'clickable dialogButton';
			cancelButton.innerHTML = _('Cancel');

			cancelButton.addEventListener('click', function() {
				dialogBox.parentNode.removeChild(dialogBox);
				removeButtonEnabled = true;
			});

			dialogButtons.appendChild(cancelButton);
		}
	}
	
	function playFactory(vid) {
		return function() {
			console.info('Play ' + vid);
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

	const videoList = document.getElementById('videoList');
	while (videoList.firstChild) {
		videoList.removeChild(videoList.firstChild);
	}

	videos.forEach(function(video) {
		var videoElement = document.createElement('li');
		videoElement.className = 'video';
		videoElement.setAttribute('id', video.vid);
		videoList.appendChild(videoElement);
		
		var videoFloatContainer = document.createElement('div');
		videoFloatContainer.className = 'videoFloatContainer clearfix';
		videoElement.appendChild(videoFloatContainer);

		var videoInfoBox = document.createElement('div');
		videoInfoBox.className = 'clickable videoInfoBox';
		videoInfoBox.innerHTML = '' +
			'<span class="videoTitle">' + video.title + '</span>' +
			'<span class="videoTime">' + prettyTime(video.time) + '</span>';
		videoInfoBox.addEventListener('click', playFactory(video.vid));
		videoFloatContainer.appendChild(videoInfoBox);
		
		var removeButtonBox = document.createElement('div');
		removeButtonBox.className = 'clickable removeButtonBox';
		removeButtonBox.innerHTML = '<img src="remove.svg" width="16" alt="Remove this video"/>';
		removeButtonBox.addEventListener('click', removeFactory(video.vid, video.title));
		videoFloatContainer.appendChild(removeButtonBox);
	});
}

function showNotification(text) {
	console.log(text);

	var dialogBox = document.createElement('div');
	dialogBox.className = 'dialogBox';
	var footerButtons = document.getElementById('footerButtons');
	footerButtons.parentNode.insertBefore(dialogBox, footerButtons);

	var dialogText = document.createElement('p');
	dialogText.innerHTML = text;
	dialogBox.appendChild(dialogText);

	var dialogButtons = document.createElement('p');
	dialogBox.appendChild(dialogButtons);

	var confirmButton = document.createElement('span');
	confirmButton.className = 'clickable confirmNotification';
	confirmButton.innerHTML = _('Okay');
	confirmButton.addEventListener('click', function ()  {
		dialogBox.parentNode.removeChild(dialogBox);
	});
	dialogButtons.appendChild(confirmButton);
}

// vim: set noet ts=2 sw=2 sts=0
