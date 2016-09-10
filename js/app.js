var AudioSplitterApp = angular.module('AudioSplitterApp', ['ngRoute']);

	AudioSplitterApp.config(function($routeProvider, $locationProvider){
		$routeProvider
			.when('/', {
				controller: 'HomeController',
				templateUrl: 'templates/home.html',
				testFile: '../audio/test/beatles-yesterday.mp3',
			})
			.when('/cut', {
				controller: 'CutController',
				templateUrl: 'templates/cut.html',
			})	
			.otherwise({
				redirectTo: '/'
			});
	
		$locationProvider.html5Mode({
			enabled: true,
			requireBase: false
		}), 
		$locationProvider.html5Mode(true);	
	});	