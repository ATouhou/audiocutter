	AudioSplitterApp.factory('helper', function(){	
		return {	
			// calculate zoom according to the file duration
			calculateZoom: function(duration){
				var zoom = 50;	// default zoom
				var limit = 30; // seconds
				if(duration < limit) {
					zoom = ((limit - duration) * 10) + zoom;	
				}
				return zoom;	
			},		
			// get name of a file without extension
			fileName: function(name){
				var dotPosition = name.lastIndexOf(".");
				name = name.substring(0, dotPosition);
				var slashPosition = name.lastIndexOf("/");
				name = name.substring(slashPosition + 1);
				name = name.replace(/\s+/g, '_');
				return name;
			},
			// background color for selected regions
			randomColor: function(){
				var opacity = 0.1;
				var colors = [
					'rgba(255, 1, 1, '+opacity+')',
					'rgba(255, 220, 1, '+opacity+')',
					'rgba(101, 255, 1, '+opacity+')',
					'rgba(1, 247, 255, '+opacity+')',
					'rgba(1, 82, 255, '+opacity+')',
					'rgba(255, 1, 205, '+opacity+')'
				];
				return colors[Math.floor((Math.random()*6)+0)];
			},	
			// get last region
			getLastRegion: function(wavesurfer){
				var keys = 	Object.keys(wavesurfer.regions.list);
				var last_key = keys[keys.length-1];
				return wavesurfer.regions.list[last_key];				
			},			
			// search by id in tableLines array
			searchId: function(id, arr){
				var found = false
				arr.forEach(function(item, i){
					if(item.id == id) found = true;
				});
				return found;
			},
			// search by id in tableLines array
			removeById: function(id, arr){
				var position = 0;
				arr.forEach(function(item, i){
					if(item.id == id) position = i;
				});
				arr.splice(position, 1);				
			},			
			// add new region into table or change it's properties
			regionInTable: function(region, tableLines, uploaded_file){
				if(typeof region == 'undefined') return false;
		
				// add new position
				if(!this.searchId(region.id, tableLines)) {
					// number of the last region 
					if(tableLines.length > 0) num = +tableLines[tableLines.length-1].num + 1;
					else num = 1;

					// change color
					region.update({color: this.randomColor()});
					// add item
					tableLines.push({
						id:region.id, 
						num:num, 
						time_start : region.start,
						time_end: region.end,						
						name: this.fileName(uploaded_file) + '_' + num,
						downloading: false
					});
				} else {
					// Update position: change time limits in table when dragging or resizing is finished
					var _this = this;
					tableLines.forEach(function(item, i){
						if(item.id == region.id) {
							item.time_start = region.start;
							item.time_end = region.end;
							item.downloading = region.downloading;
						}
					});
				}
				return tableLines;
			},
			// validate region name
			validate: function(input){
				if(typeof(input) == 'undefined') input = '';
				if (!/^[\w]+$/i.test(input) && input != '') return 'Only A-Z, 0-9, _ symbols are available!';
				else if (input == '') return 'The value must not be empty!';
				else if (input.length > 30) return 'The length of th name is to long';
				else return '';				
			}
		}	
	});	