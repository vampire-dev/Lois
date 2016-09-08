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
            FilterType[FilterType["recap"] = 0] = "recap";
            FilterType[FilterType["cancelRecap"] = 1] = "cancelRecap";
        })(FilterType || (FilterType = {}));
        ;
        var recapitulationCtrl = (function (_super) {
            __extends(recapitulationCtrl, _super);
            function recapitulationCtrl($scope, Notification) {
                _super.call(this, Notification);
                this.functions.load = app.api.recapitulation.getAll;
                this.functions.autocomplete = app.api.autocomplete.getAll;
                this.filterType = FilterType.recap;
                this.filter();
            }
            recapitulationCtrl.prototype.load = function () {
                var ctrl = this;
                ctrl.checkedAll = false;
                ctrl.createQuery();
                ctrl.loadingData = true;
                ctrl.functions.load = ctrl.filterType === FilterType.recap ? app.api.recapitulation.getAll : app.api.recapitulation.getAllCancel;
                ctrl.functions.load(ctrl.query).then(function (result) {
                    ctrl.entities = result.data;
                    ctrl.entities.map(function (e) {
                        e['viewModel'] = {};
                        e['viewModel']['limasColor'] = null;
                        e['viewModel']['relationColor'] = null;
                        e['viewModel']['notes'] = null;
                        e['viewModel']['quantity'] = ctrl.filterType === FilterType.recap ? e.items.colli.available : e.items.recapitulations.available;
                    });
                }).catch(function (error) {
                    ctrl.notify('error', error.data);
                }).finally(function () {
                    ctrl.loadingData = false;
                });
            };
            recapitulationCtrl.prototype.process = function () {
                if (this.filterType === FilterType.recap)
                    this.recap();
                else if (this.filterType === FilterType.cancelRecap)
                    this.cancelRecap();
            };
            recapitulationCtrl.prototype.recap = function () {
                var _this = this;
                if (!this.driver) {
                    this.notify('warning', 'Supir harus diisi');
                    return;
                }
                if (!this.trainType) {
                    this.notify('warning', 'Jenis kereta harus diisi');
                    return;
                }
                if (!this.departureDate || this.departureDate == '') {
                    this.notify('warning', 'Tanggal berangkat harus diisi');
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
                    var departureDate = new Date(_this.departureDate);
                    var viewModel = {
                        shipping: entity._id,
                        item: entity.items._id,
                        quantity: entity.viewModel.quantity,
                        limasColor: entity.viewModel.limasColor,
                        relationColor: entity.viewModel.relationColor,
                        notes: entity.viewModel.notes,
                        driver: _this.driver._id,
                        trainType: _this.trainType._id,
                        vehicleNumber: _this.vehicleNumber,
                        departureDate: Date.UTC(departureDate.getFullYear(), departureDate.getMonth(), departureDate.getDate())
                    };
                    viewModels.push(viewModel);
                });
                var ctrl = this;
                app.api.recapitulation.recap(viewModels).then(function (result) {
                    ctrl.notify('success', 'Proses rekapitulasi berhasil');
                    ctrl.load();
                }).catch(function (error) {
                    ctrl.notify('error', 'Rekapitulasi gagal ' + error.data);
                }).finally(function () {
                    ctrl.loadingData = false;
                });
            };
            recapitulationCtrl.prototype.cancelRecap = function () {
                var _this = this;
                var checkedEntities = this.entities.filter(function (e) { return e.checked; });
                if (checkedEntities.length === 0) {
                    this.notify('warning', 'Tidak ada item yang dipilih');
                    return;
                }
                var viewModels = [];
                checkedEntities.forEach(function (entity) {
                    var departureDate = new Date(_this.departureDate);
                    var viewModel = {
                        shipping: entity._id,
                        item: entity.items._id,
                        recapitulation: entity.items.recapitulations._id,
                        quantity: entity.viewModel.quantity
                    };
                    viewModels.push(viewModel);
                });
                var ctrl = this;
                app.api.recapitulation.cancelRecap(viewModels).then(function (result) {
                    ctrl.notify('success', 'Proses cancel rekapitulasi berhasil');
                    ctrl.load();
                }).catch(function (error) {
                    ctrl.notify('error', 'Cancel rekapitulasi gagal ' + error.data);
                }).finally(function () {
                    ctrl.loadingData = false;
                });
            };
            recapitulationCtrl.$inject = ['$scope', 'Notification'];
            return recapitulationCtrl;
        }(controllers.baseCtrl));
        app.lois.controller('recapitulationCtrl', recapitulationCtrl);
    })(controllers = app.controllers || (app.controllers = {}));
})(app || (app = {}));
//# sourceMappingURL=recapitulationCtrl.js.map