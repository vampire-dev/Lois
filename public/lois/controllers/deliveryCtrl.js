var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var app;
(function (app) {
    var controllers;
    (function (controllers) {
        var FilterType;
        (function (FilterType) {
            FilterType[FilterType["delivery"] = 0] = "delivery";
            FilterType[FilterType["cancelDelivery"] = 1] = "cancelDelivery";
        })(FilterType || (FilterType = {}));
        ;
        var deliveryCtrl = (function (_super) {
            __extends(deliveryCtrl, _super);
            function deliveryCtrl($scope, Notification) {
                _super.call(this, Notification);
                this.functions.load = app.api.delivery.getAll;
                this.functions.autocomplete = app.api.autocomplete.getAll;
                this.filterType = FilterType.delivery;
                this.filter();
            }
            deliveryCtrl.prototype.load = function () {
                var ctrl = this;
                ctrl.checkedAll = false;
                ctrl.createQuery();
                ctrl.loadingData = true;
                ctrl.functions.load = ctrl.filterType === FilterType.delivery ? app.api.delivery.getAll : app.api.delivery.getAllCancel;
                ctrl.functions.load(ctrl.query).then(function (result) {
                    ctrl.entities = result.data;
                    ctrl.entities.map(function (e) {
                        e['viewModel'] = {};
                        e['viewModel']['limasColor'] = null;
                        e['viewModel']['relationColor'] = null;
                        e['viewModel']['notes'] = null;
                        e['viewModel']['quantity'] = ctrl.filterType === FilterType.delivery ? e.items.recapitulations.available : e.items.deliveries.available;
                    });
                }).catch(function (error) {
                    ctrl.notify('error', error.data);
                }).finally(function () {
                    ctrl.loadingData = false;
                });
            };
            deliveryCtrl.prototype.process = function () {
                if (this.filterType === FilterType.delivery)
                    this.delivery();
                else if (this.filterType === FilterType.cancelDelivery)
                    this.cancelDelivery();
            };
            deliveryCtrl.prototype.delivery = function () {
                var _this = this;
                if (!this.driver) {
                    this.notify('warning', 'Supir harus diisi');
                    return;
                }
                if (!this.vehicleNumber || this.vehicleNumber == '') {
                    this.notify('warning', 'No mobil harus diisi');
                    return;
                }
                var checkedEntities = this.entities.filter(function (e) { return e.checked; });
                if (checkedEntities.length === 0) {
                    this.notify('warning', 'Tidak ada item yang dipilih');
                    return;
                }
                var viewModels = [];
                checkedEntities.forEach(function (entity) {
                    var viewModel = {
                        shipping: entity._id,
                        item: entity.items._id,
                        recapitulation: entity.items.recapitulations._id,
                        quantity: entity.viewModel.quantity,
                        limasColor: entity.viewModel.limasColor,
                        relationColor: entity.viewModel.relationColor,
                        deliveryCode: _this.deliveryCode,
                        driver: _this.driver._id,
                        vehicleNumber: _this.vehicleNumber
                    };
                    viewModels.push(viewModel);
                });
                var ctrl = this;
                app.api.delivery.delivery(viewModels).then(function (result) {
                    ctrl.notify('success', 'Proses delivery berhasil');
                    ctrl.load();
                }).catch(function (error) {
                    ctrl.notify('error', 'Delivery gagal ' + error.data);
                }).finally(function () {
                    ctrl.loadingData = false;
                });
            };
            deliveryCtrl.prototype.cancelDelivery = function () {
                var checkedEntities = this.entities.filter(function (e) { return e.checked; });
                if (checkedEntities.length === 0) {
                    this.notify('warning', 'Tidak ada item yang dipilih');
                    return;
                }
                var viewModels = [];
                checkedEntities.forEach(function (entity) {
                    var viewModel = {
                        shipping: entity._id,
                        item: entity.items._id,
                        recapitulation: entity.items.recapitulations._id,
                        quantity: entity.viewModel.quantity,
                        delivery: entity.items.deliveries._id
                    };
                    viewModels.push(viewModel);
                });
                var ctrl = this;
                app.api.delivery.cancelDelivery(viewModels).then(function (result) {
                    ctrl.notify('success', 'Proses cancel delivery berhasil');
                    ctrl.load();
                }).catch(function (error) {
                    ctrl.notify('error', 'Cancel delivery gagal ' + error.data);
                }).finally(function () {
                    ctrl.loadingData = false;
                });
            };
            deliveryCtrl.$inject = ['$scope', 'Notification'];
            return deliveryCtrl;
        }(controllers.baseCtrl));
        app.lois.controller('deliveryCtrl', deliveryCtrl);
    })(controllers = app.controllers || (app.controllers = {}));
})(app || (app = {}));
//# sourceMappingURL=deliveryCtrl.js.map