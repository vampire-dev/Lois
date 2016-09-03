﻿/// <reference path="../typings/index.d.ts" />

interface JQuery { datepicker(format): JQuery; }

module app {
    export var lois = angular.module('lois', ['ui.router',
        'ngResource',
        'ngFileUpload',
        'ui-notification',
        'ui.bootstrap',
        'angular-blocks',
        'bw.paging']);

    export var http: ng.IHttpService;
    export var ngUpload;
   
    lois.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
        ($stateProvider, $urlRouterProvider, $locationProvider) => {

        var baseUrl = '/lois';
        $urlRouterProvider.otherwise('/lois');
        $locationProvider.html5Mode({ "enabled": true });

        $stateProvider.state('site', {
            abstract: true,
            template: '<ui-view />',
            resolve: {
                authorize: ['authorization', (authorization) => {
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
        }).state('site.main.shipping', {
            url: '/shipping',
            templateUrl: '/views/shipping.html',
            controller: 'shippingCtrl as ctrl'
        }).state('site.main.recapitulation', {
            url: '/recapitulation',
            templateUrl: '/views/recapitulation.html',
            controller: 'recapitulationCtrl as ctrl'
        }).state('site.main.configuration', {
            url: '/configuration',
            templateUrl: '/views/configuration.html',
            controller: 'configurationCtrl as ctrl'
        });
    }]);

    lois.factory('principal', ['$q', '$http', ($q, $http) => {
        var identity: any;
        var authenticated: boolean = false;

        return {
            isIdentityResolved: () => {
                return angular.isDefined(identity);
            },

            isAuthenticated: () => {
                return authenticated;
            },

            identity: () => {
                var deferred = $q.defer();

                if (angular.isDefined(identity)) {
                    deferred.resolve(identity);
                    return deferred.promise;
                }

                $http.get('/lois/api/user/getSession').then(result => {
                    if (result) {
                        identity = result.data;
                        authenticated = true;
                    }

                    deferred.resolve(identity);
                }).catch(error => {
                    identity = null;
                    authenticated = false;
                    deferred.resolve(identity);
                });

                return deferred.promise;
            }
        }
    }]);

    lois.factory('authorization', ['$rootScope', '$state', '$location', 'principal', ($rootScope, $state, $location, principal) => {
        return {
            authorize: () => {
                return principal.identity().then(() => {
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

    lois.directive('toNumber', () => {
        return {
            require: 'ngModel',
            link: (scope, element, attrs, ngModel: any) => {
                ngModel.$parsers.push((val) => {
                    return parseFloat(val);
                });
                ngModel.$formatters.push((val) => {
                    return '' + val;
                });
            }
        }
    });

    lois.directive('datepicker', ['$timeout', ($timeout) => {
        return {
            restrict: 'A',
            link: (scope, elem, attrs) => {
                $timeout(() => {
                    $(elem).datepicker({ dateFormat: 'yy-mm-dd' });
                });
            }
        }
    }]);

    lois.run(['$rootScope', '$state', '$stateParams', 'authorization', 'Upload', 'principal', '$http',
        ($rootScope, $state, $stateParams, authorization, Upload, principal, $http) => {

        http = $http;
        ngUpload = Upload;

        $rootScope.$on('$stateChangeStart', (event, toState, toStateParams) => {
            $rootScope.toState = toState;
            $rootScope.toStateParams = toStateParams;

            if (principal.isIdentityResolved())
                authorization.authorize();
        });
   }]);
}