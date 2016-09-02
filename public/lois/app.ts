/// <reference path="../typings/index.d.ts" />

module app {
    export var app = angular.module('app', ['ui-router']);
    export var http;
   
    app.config(['$stateProvider', 'urlRouterProvider', '$locationProvider',
        ($stateProvider, $urlRouterProvider, $locationProvider) => {

        var baseUrl = '/';
        $urlRouterProvider.otherwise('/');
        $locationProvider.html5Mode({ "enabled": true });

        $stateProvider.state('site', {
            url: baseUrl,
            template: '<ui-view />',
            resolve: {

            }
        });
    }]);
}