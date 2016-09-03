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
                var ctrl = this;
                app.api.user.getSession().then(function (result) {
                    ctrl.user = result.data['name'];
                    ctrl.menus = result.data['menus'].map(function (e) { return e.menu; });
                }).catch(function (error) {
                    ctrl.Notification.error(error.message);
                });
            };
            indexCtrl.prototype.logout = function () {
                var ctrl = this;
                app.api.user.logout().then(function (result) {
                    window.location.href = '/lois';
                }).catch(function (error) {
                    ctrl.Notification.error(error.message);
                });
            };
            indexCtrl.$inject = ['$scope', 'Notification'];
            return indexCtrl;
        }());
        app.lois.controller('indexCtrl', indexCtrl);
    })(controllers = app.controllers || (app.controllers = {}));
})(app || (app = {}));
//# sourceMappingURL=indexCtrl.js.map