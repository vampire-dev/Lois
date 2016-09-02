/// <reference path="../typings/index.d.ts" />
var app;
(function (app_1) {
    app_1.app = angular.module('app', ['ui-router']);
    app_1.app.config(['$stateProvider', 'urlRouterProvider', '$locationProvider',
        function ($stateProvider, $urlRouterProvider, $locationProvider) {
            var baseUrl = '/';
            $urlRouterProvider.otherwise('/');
            $locationProvider.html5Mode({ "enabled": true });
            $stateProvider.state('site', {
                url: baseUrl,
                template: '<ui-view />',
                resolve: {}
            });
        }]);
})(app || (app = {}));
//# sourceMappingURL=app.js.map