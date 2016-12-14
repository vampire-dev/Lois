var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var app;
(function (app) {
    var controllers;
    (function (controllers) {
        var ViewType;
        (function (ViewType) {
            ViewType[ViewType["shipping"] = 1] = "shipping";
            ViewType[ViewType["item"] = 2] = "item";
        })(ViewType || (ViewType = {}));
        ;
        var deliveryOrderCtrl = (function (_super) {
            __extends(deliveryOrderCtrl, _super);
            function deliveryOrderCtrl($scope, Notification) {
                _super.call(this, Notification);
                this.viewType = ViewType.shipping;
                this.functions.load = app.api.deliveryOrder.getAll;
                this.functions.autocomplete = app.api.autocomplete.getAll;
                this.filter();
            }
            deliveryOrderCtrl.prototype.print = function (entity) {
                var ctrl = this;
                ctrl.loadingData = true;
                app.api.deliveryOrder.getDataReport(entity).then(function (result) {
                    app.api.reportPrint.printDeliveryOrder(result.data).then(function (buffer) {
                        var blob = new Blob([buffer.data], { type: 'application/pdf' });
                        var url = URL.createObjectURL(blob);
                        window.open(url, '_blank');
                    });
                }).finally(function () {
                    ctrl.loadingData = false;
                });
            };
            deliveryOrderCtrl.prototype.viewDetail = function (entity) {
                this.viewType = ViewType.item;
                this.selectedEntity = entity;
            };
            deliveryOrderCtrl.prototype.viewShipping = function () {
                this.viewType = ViewType.shipping;
                this.selectedEntity = null;
            };
            deliveryOrderCtrl.$inject = ['$scope', 'Notification'];
            return deliveryOrderCtrl;
        }(controllers.baseCtrl));
        app.lois.controller('deliveryOrderCtrl', deliveryOrderCtrl);
    })(controllers = app.controllers || (app.controllers = {}));
})(app || (app = {}));
//# sourceMappingURL=deliveryOrderCtrl.js.map