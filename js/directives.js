AudioSplitterApp.directive("modalInfo", function(){
	return {
		restrict: 'E',	
		replace: true,	
		transclude: true,
		templateUrl: 'templates/modal-info.html',
		scope: {
			title: "@",				
		},
	}
})
		