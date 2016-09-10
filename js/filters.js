	AudioSplitterApp.filter('watch', function(){
		return function(currentTime){
			if (typeof currentTime === 'undefined') currentTime = 0;

			var hour = Math.floor(currentTime / 60 / 60);
			currentTime -= hour * 60 * 60;

			var minute = Math.floor(currentTime / 60);
			currentTime -= minute * 60;

			var second = Math.floor(currentTime);
			currentTime -= second;

			var milli = '' + Math.floor(currentTime * 1000);
				
			if (minute < 10) minute = '0' + minute;
			if (second < 10) second = '0' + second;
			while (milli.length < 3) {
				milli = '0' + milli;
			}
			return hour + ':' + minute + ':' + second + '.' + milli;
		}
	});
			
	