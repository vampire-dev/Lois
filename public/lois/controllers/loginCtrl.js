var app;
(function (app) {
    var controllers;
    (function (controllers) {
        var loginCtrl = (function () {
            function loginCtrl($scope, Notification) {
                this.Notification = Notification;
            }
            loginCtrl.prototype.login = function () {
                var ctrl = this;
                app.api.user.login(ctrl.user).then(function (result) {
                    window.location.href = '/lois';
                }).catch(function (error) {
                    ctrl.Notification.error(error.data);
                });
            };
            loginCtrl.$inject = ['$scope', 'Notification'];
            return loginCtrl;
        }());
        app.lois.controller('loginCtrl', loginCtrl);
    })(controllers = app.controllers || (app.controllers = {}));
})(app || (app = {}));
//# sourceMappingURL=loginCtrl.js.map