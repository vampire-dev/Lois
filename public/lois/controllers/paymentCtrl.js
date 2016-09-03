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
            ViewType[ViewType["payment"] = 0] = "payment";
            ViewType[ViewType["phases"] = 1] = "phases";
        })(ViewType || (ViewType = {}));
        ;
        var paymentCtrl = (function (_super) {
            __extends(paymentCtrl, _super);
            function paymentCtrl($scope, Notification) {
                _super.call(this, Notification);
                this.viewType = ViewType.payment;
                this.functions.load = app.api.payment.getAll;
                this.functions.autocomplete = app.api.autocomplete.getAll;
                this.filter();
            }
            paymentCtrl.prototype.pay = function () {
                var _this = this;
                if (!this.date || this.date == '') {
                    this.notify('warning', 'Tanggal transfer harus diisi');
                    return;
                }
                var checkedEntities = this.entities.filter(function (e) { return e.checked; });
                if (checkedEntities.length === 0) {
                    this.notify('warning', 'Tidak ada pengiriman yang dipilih');
                    return;
                }
                var viewModels = [];
                checkedEntities.forEach(function (entity) {
                    viewModels.push({
                        shippingId: entity._id,
                        bank: entity.viewModel.bank,
                        notes: entity.viewModel.notes,
                        amount: entity.viewModel.amount,
                        transferDate: _this.date,
                        paymentTypeId: _this.paymentType ? _this.paymentType._id : entity.payment.type._id
                    });
                });
                var ctrl = this;
                app.api.payment.pay(viewModels).then(function (result) {
                    ctrl.notify('success', 'Proses pembayaran berhasil');
                    ctrl.filter();
                }).catch(function (error) {
                    ctrl.notify('error', 'Proses pembayaran gagal ' + error.data);
                });
            };
            paymentCtrl.prototype.viewPhases = function (entity) {
                this.viewType = ViewType.phases;
                this.selectedEntity = entity;
            };
            paymentCtrl.prototype.viewPayments = function () {
                this.viewType = ViewType.payment;
                this.selectedEntity = null;
            };
            paymentCtrl.$inject = ['$scope', 'Notification'];
            return paymentCtrl;
        }(controllers.baseCtrl));
        app.lois.controller('paymentCtrl', paymentCtrl);
    })(controllers = app.controllers || (app.controllers = {}));
})(app || (app = {}));
//# sourceMappingURL=paymentCtrl.js.map