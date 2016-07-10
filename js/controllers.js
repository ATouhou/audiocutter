// home page


AudioSplitterApp.controller('HomeController', function($scope, $location){ 
	
	$scope.uploading = false;
	$scope.error_upload = false;
	$scope.error_format = false;
	$scope.$root.cut = false;
		
	// Upload audio file
	$scope.uploadAudio = function(file) {
		$scope.error_upload = false;
		$scope.error_format = false;	
		if(typeof file == 'undefined') return false;
		if(file.type == 'audio/mpeg' || file.type == 'audio/mp3') {
				var formData = new FormData($('#upload_audio')[0]);
				$.ajax({
					url: 'ajax/upload.php', 
					type: 'POST',
					xhr: function() {  
						myXhr = $.ajaxSettings.xhr();
						if(myXhr.upload){ 	
							$scope.uploading = true;
							$scope.$apply();
						}
						return myXhr;
					},
					data: formData,				
					success: function(data) {
						if(data.error) {
							$scope.uploading = false;
							$scope.error_upload = true;
							$scope.$apply();
						} else {
							$scope.$root.uploaded_file = data.path;
							$location.path('/cut'); 
							$scope.$apply();						
						}								
					},
					error: function(error) {
						alert(error.statusText);
						$scope.uploading = false;
						$scope.error_upload = true;
						$scope.$apply();
					},					
					cache: false,
					contentType: false,
					processData: false
				});		
		} else {
			$scope.uploading = false;
			$scope.error_format = true;
			$scope.$apply();
			$(':file').val('');
		}
		
		
	}

})

// cut audio file
.controller('CutController', function($scope, $timeout, $location, helper){ 
		
		$scope.$root.cut = true;
		// start point (seconds) of selected region (regime divide on pause)
		var start_point = 0;
		// array of regions to create table
		$scope.tableLines = [];	
		// play
		$scope.play = false;
		// divide on pause regime	
		$scope.divideOnPause = true;
		// default stopwatch value
		$scope.stopwatch = helper.updateTime(0);
		// WaveSurfer is not ready
		$scope.processing = true;
		
		/* start */
				
		// create a WaveSurfer instance.
		var wavesurfer = WaveSurfer.create({
			container: '#waveform',
			waveColor: 'red', 
			progressColor: 'purple',
			cursorColor: 'black',  
			height: 100, 
			pixelRatio: 1,
			barWidth: 2,
			cursorWidth: 2,
			normalize: true,		  
		});
		
		// load audio
	//	$scope.$root.uploaded_file = '../audio/11_22/groundhog_test.mp3';  // tmp
		wavesurfer.load($scope.$root.uploaded_file);
		
		// select region by dragging
		wavesurfer.enableDragSelection();
		
		// audio loaded
		wavesurfer.on('ready', function () {

			// timeline plugin 
			 Object.create(WaveSurfer.Timeline).init({
				wavesurfer: wavesurfer,
				container: "#wave-timeline"
			});	
			
			// zoom
			wavesurfer.zoom(helper.calculateZoom(wavesurfer.getDuration()));
			
			// processing is finished, audio is ready
			$scope.processing = false;
			$scope.$apply();
		});
  
		// go back to upload another file
		$scope.goBack = function(){
			$('#backModal').modal('hide');
			$timeout(function(){ $location.path('/'); }, 500);
			// delete current files
			$.ajax({  
			   type: "POST",  
			   url: "../ajax/clear.php",  
			   cache: false,
			   dataType: 'json',
			   data: 'path='+$scope.$root.uploaded_file,  
			   success: function(data) {	
					
			   },
				error: function(error) {
					console.log(error.statusText);
				}  
			});			
		}
		
		/* work with timeline */
				
		// create region
		wavesurfer.on('region-update-end', function (region) {
			$scope.tableLines = helper.regionInTable(region, $scope.tableLines, $scope.$root.uploaded_file);
			$scope.$apply();
		});	
				
		// play region
		wavesurfer.on('region-in', function(region) {
			// highlight line in the table
			$scope.currentRegion = region.id;
			$scope.$apply();
			// change color opacity while playing
			var default_color = region.color;
			var new_opacity = default_color.replace(/0.\d/gi, 0.4);
			region.update({color: new_opacity});
			region.once('out', function () {
				region.update({color: default_color});
			});
		});
		
		// click region
		wavesurfer.on('region-click', function(region) {
			// highlight line in the table
			$scope.currentRegion = region.id;
			$scope.$apply();
			// go to clicked region in table
			$('.table_container').scrollTop(0);
			$('.table_container').scrollTop($('#'+region.id).position().top);
		});
		
	
		//	regime <divide on pause> 
		$scope.divideOnPauseChange = function(){
			$scope.divideOnPause = !$scope.divideOnPause;
		}			
		
		// playPause
		$scope.playPause = function(){
			wavesurfer.playPause();
			// create regions
			if(!$scope.divideOnPause) return false;
			end_point = wavesurfer.getCurrentTime();
			// if the cursor was moved - move start point appropriately
			if(wavesurfer.getCurrentTime() > start_point && wavesurfer.isPlaying()) {
				start_point = wavesurfer.getCurrentTime();
			}
			// if it is pause - add region
			if(start_point < end_point && !wavesurfer.isPlaying() && end_point > 0.2) {
				wavesurfer.addRegion({
					start: start_point, 
					end: end_point, 
					color: helper.randomColor()
				});
				start_point = end_point;
				var region = helper.getLastRegion(wavesurfer);
				$scope.tableLines = helper.regionInTable(region, $scope.tableLines, $scope.$root.uploaded_file);
			}
				
		}		
		
		// stop
		$scope.stop = function(){
			wavesurfer.stop();
		}
		// clear
		$scope.clearRegions = function(){
			wavesurfer.clearRegions();
			start_point = 0;
			$scope.tableLines = [];
		}
		
		// download all regions
		$scope.downloadAll = function(){
			$scope.downloadAllProcess = true;
			$.ajax({  
				type: "POST",  
				url: "ajax/download-all.php",  
				cache: false,
				dataType: 'json',
				data: 'path='+$scope.$root.uploaded_file+'&regions='+JSON.stringify($scope.tableLines), 
				success: function(data) {
					if(data.error != '') {
						alert(data.error);
						$scope.downloadAllProcess = false;
						$scope.$apply();
						return false;
					}
					if(!data.output) return false;
					// download
					$.fileDownload(data.output)
						.done(function () { 
						})
						.fail(function () { 
							alert('File download failed!'); 						
						});
					$scope.downloadAllProcess = false;
					$scope.$apply();
					return false;

				},
				error: function(error) {
					alert(error.statusText);
					console.log(error);
					$scope.downloadAllProcess = false;
					$scope.$apply();					
				}
			});	
		}
		
		
		/* events on wave timeline */
		
		wavesurfer.on('play', function () {
			$scope.play = true;
		});
		
		wavesurfer.on('audioprocess', function () {
			$scope.stopwatch = helper.updateTime(wavesurfer.getCurrentTime());
			$scope.$apply();
		});		
		
		wavesurfer.on('pause', function () {
			$scope.play = false;
		});	
		
		wavesurfer.on('stop', function () {
			$scope.play = false;
		});	
		
		wavesurfer.on('finish', function () {
			$scope.play = false;
			// add last region
			if(!$scope.divideOnPause) return false;
			if(start_point < wavesurfer.getDuration()) {
				wavesurfer.addRegion({
					start: start_point, 
					end: wavesurfer.getDuration(), 
					color: helper.randomColor()
				});
				start_point = 0;
				var region = helper.getLastRegion(wavesurfer);
				$scope.tableLines = helper.regionInTable(region, $scope.tableLines, $scope.$root.uploaded_file);
				$scope.$apply();
			}
						
		});	
		
		
		/* navigation in regions table */
		
		// validate region name
		$scope.allRegionsValid = true;
		$scope.validate = function(input){
			if(helper.validate(input) != '') {$scope.allRegionsValid = false;}
			else {$scope.allRegionsValid = true;}
			return	helper.validate(input);	
		}
		
		// play region
		$scope.playRegion = function(region){
			var region = wavesurfer.regions.list[region.id];
			region.play();
		}

		// delete region
		$scope.deleteRegion = function(region){
			var region = wavesurfer.regions.list[region.id];
			region.remove();
			helper.removeById(region.id, $scope.tableLines);	
		}	
		
		// download region
		$scope.downloadRegion = function(region){
			var region_name = region.name;
			var region = wavesurfer.regions.list[region.id];
			region.downloading = true;
			$scope.tableLines = helper.regionInTable(region, $scope.tableLines);
			$.ajax({  
				type: "POST",  
				url: "ajax/download-one.php",  
				cache: false,
				dataType: 'json',
				data: 'path='+$scope.$root.uploaded_file+'&start='+region.start+'&end='+region.end+'&name='+region_name, 
				success: function(data) {	
					if(data.error) {
						alert(data.error);
						return false;
					}	
					$.fileDownload(data.output)
						.done(function () { 
						})
						.fail(function () { 
							alert('File download failed!'); 						
						});
					setTimeout(function(){  	
						region.downloading = false;	
						$scope.tableLines = helper.regionInTable(region, $scope.tableLines);
						$scope.$apply();
					},1000);	
					return false; 
				},
				error: function(error) {
					region.downloading = false;	
					alert('download error');
					console.log(error);
					$scope.tableLines = helper.regionInTable(region, $scope.tableLines);
					$scope.$apply();					
				}
			});		
		}

		/* resize region events */
		
		// change start of the region to the left
		$scope.changeStartLeft = function(region){	
			var region = wavesurfer.regions.list[region.id];
			region.update({ start: region.start-0.05 });
			$scope.tableLines = helper.regionInTable(region, $scope.tableLines);			
		}		
		
		// change start of the region to the right
		$scope.changeStartRight = function(region){	
			var region = wavesurfer.regions.list[region.id];
			region.update({ start: region.start+0.05 });
			$scope.tableLines = helper.regionInTable(region, $scope.tableLines);			
		}

		// change end of the region to the left
		$scope.changeEndtLeft = function(region){	
			var region = wavesurfer.regions.list[region.id];
			region.update({ end: region.end-0.05 });
			$scope.tableLines = helper.regionInTable(region, $scope.tableLines);			
		}

		// change end of the region to the right
		$scope.changeEndRight = function(region){	
			var region = wavesurfer.regions.list[region.id];
			region.update({ end: region.end+0.05 });
			$scope.tableLines = helper.regionInTable(region, $scope.tableLines);			
		}		
	
})
