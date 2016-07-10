var AudioSplitterApp = angular.module('AudioSplitterApp', ['ngRoute']);

	AudioSplitterApp.config(function($routeProvider, $locationProvider){
		$routeProvider
		
			.when('/', {
				controller: 'HomeController',
				templateUrl: 'templates/home.html',
			})	
		/*
			.when('/', {
				controller: 'CutController',
				templateUrl: 'templates/cut.html',
			})	
		*/	
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