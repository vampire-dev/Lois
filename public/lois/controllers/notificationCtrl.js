var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var app;
(function (app) {
    var controllers;
    (function (controllers) {
        var notificationCtrl = (function (_super) {
            __extends(notificationCtrl, _super);
            function notificationCtrl($scope, Notification) {
                _super.call(this, Notification);
                this.functions.load = app.api.notification.getAll;
                this.functions.delete = app.api.notification.delete;
                this.filter();
            }
            notificationCtrl.prototype.viewFile = function (file) {
                window.open('berita_acara/' + file, '_blank');
            };
            notificationCtrl.$inject = ['$scope', 'Notification'];
            return notificationCtrl;
        }(controllers.baseCtrl));
        app.lois.controller('notificationCtrl', notificationCtrl);
    })(controllers = app.controllers || (app.controllers = {}));
})(app || (app = {}));
//# sourceMappingURL=notificationCtrl.js.map