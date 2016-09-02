/// <reference path="../app" />
/// <reference path="../api" />
var app;
(function (app) {
    var controllers;
    (function (controllers) {
        var indexCtrl = (function () {
            function indexCtrl($scope, Notification) {
                this.Notification = Notification;
                this.init();
            }
            indexCtrl.prototype.init = function () {
            };
            indexCtrl.$inject = ['$scope', 'Notification'];
            return indexCtrl;
        }());
        app.app.controller('indexCtrl', indexCtrl);
    })(controllers = app.controllers || (app.controllers = {}));
})(app || (app = {}));
//# sourceMappingURL=indexCtrl.js.map