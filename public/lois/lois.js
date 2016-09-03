/// <reference path="../typings/index.d.ts" />
var app;
(function (app) {
    app.lois = angular.module('lois', ['ui.router',
        'ngResource',
        'ngFileUpload',
        'ui-notification',
        'ui.bootstrap',
        'angular-blocks',
        'bw.paging']);
    app.lois.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
        function ($stateProvider, $urlRouterProvider, $locationProvider) {
            var baseUrl = '/lois';
            $urlRouterProvider.otherwise('/lois');
            $locationProvider.html5Mode({ "enabled": true });
            $stateProvider.state('site', {
                abstract: true,
                template: '<ui-view />',
                resolve: {
                    authorize: ['authorization', function (authorization) {
                            return authorization.authorize();
                        }]
                }
            }).state('site.login', {
                url: baseUrl + '/login',
                templateUrl: '/views/login.html',
                controller: 'loginCtrl as ctrl'
            }).state('site.main', {
                url: baseUrl,
                templateUrl: '/views/main.html',
                controller: 'indexCtrl as ctrl'
            }).state('site.main.configuration', {
                url: '/configuration',
                templateUrl: '/views/configuration.html',
                controller: 'configurationCtrl as ctrl'
            });
        }]);
    app.lois.factory('principal', ['$q', '$http', function ($q, $http) {
            var identity;
            var authenticated = false;
            return {
                isIdentityResolved: function () {
                    return angular.isDefined(identity);
                },
                isAuthenticated: function () {
                    return authenticated;
                },
                identity: function () {
                    var deferred = $q.defer();
                    if (angular.isDefined(identity)) {
                        deferred.resolve(identity);
                        return deferred.promise;
                    }
                    $http.get('/lois/api/user/getSession').then(function (result) {
                        if (result) {
                            identity = result.data;
                            authenticated = true;
                        }
                        deferred.resolve(identity);
                    }).catch(function (error) {
                        identity = null;
                        authenticated = false;
                        deferred.resolve(identity);
                    });
                    return deferred.promise;
                }
            };
        }]);
    app.lois.factory('authorization', ['$rootScope', '$state', '$location', 'principal', function ($rootScope, $state, $location, principal) {
            return {
                authorize: function () {
                    return principal.identity().then(function () {
                        var isAuthenticated = principal.isAuthenticated();
                        if (!isAuthenticated && $rootScope.toState.name !== 'site.login') {
                            $rootScope.returnToState = $rootScope.toState;
                            $rootScope.returnToStateParams = $rootScope.toStateParams;
                            $state.go('site.login');
                        }
                    });
                }
            };
        }]);
    app.lois.directive('toNumber', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function (val) {
                    return parseFloat(val);
                });
                ngModel.$formatters.push(function (val) {
                    return '' + val;
                });
            }
        };
    });
    app.lois.directive('datepicker', ['$timeout', function ($timeout) {
            return {
                restrict: 'A',
                link: function (scope, elem, attrs) {
                    $timeout(function () {
                        $(elem).datepicker({ dateFormat: 'yy-mm-dd' });
                    });
                }
            };
        }]);
    app.lois.run(['$rootScope', '$state', '$stateParams', 'authorization', 'Upload', 'principal', '$http',
        function ($rootScope, $state, $stateParams, authorization, Upload, principal, $http) {
            app.http = $http;
            app.ngUpload = Upload;
            $rootScope.$on('$stateChangeStart', function (event, toState, toStateParams) {
                $rootScope.toState = toState;
                $rootScope.toStateParams = toStateParams;
                if (principal.isIdentityResolved())
                    authorization.authorize();
            });
        }]);
})(app || (app = {}));
//# sourceMappingURL=lois.js.map