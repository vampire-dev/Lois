var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var app;
(function (app) {
    var controllers;
    (function (controllers) {
        var auditCtrl = (function (_super) {
            __extends(auditCtrl, _super);
            function auditCtrl($scope, Notification) {
                _super.call(this, Notification);
                this.functions.load = app.api.audit.getAll;
                this.filter();
            }
            auditCtrl.prototype.process = function (status, entity) {
                var ctrl = this;
                ctrl.loadingData = true;
                entity['status'] = status;
                app.api.audit.process(entity).then(function (result) {
                    ctrl.notify('success', 'Audit selesai');
                    ctrl.filter();
                }).catch(function (error) {
                    ctrl.notify('error', error.data);
                }).finally(function () {
                    ctrl.loadingData = false;
                });
            };
            auditCtrl.$inject = ['$scope', 'Notification'];
            return auditCtrl;
        }(controllers.baseCtrl));
        app.lois.controller('auditCtrl', auditCtrl);
    })(controllers = app.controllers || (app.controllers = {}));
})(app || (app = {}));
//# sourceMappingURL=auditCtrl.js.map