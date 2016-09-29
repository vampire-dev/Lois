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
                        amount: entity.viewModel.amount || 0,
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

            paymentCtrl.prototype.editPay = function (entity) {
                if (this.selectedEntity.audited) {
                    this.notify('warning', 'Pengiriman ini sedang diaudit oleh manager');
                    return;
                }

                var dates = new Date(entity.transferDate);
                var dd = dates.getDate();
                var mm = dates.getMonth() + 1;
                var yyyy = dates.getFullYear();

                var ToDate = yyyy + '-' + mm + '-' + dd;
                this.dataTransferDate = ToDate;

                this.activeEntity = entity;
            };
            paymentCtrl.prototype.cancelPay = function (entity) {
                this.activeEntity = null;
            };
            paymentCtrl.prototype.deletePay = function (entity) {
                if (this.selectedEntity.audited) {
                    this.notify('warning', 'Pengiriman ini sedang diaudit oleh manager');
                    return;
                }

                var confirmed = confirm('Item akan dihapus, anda yakin?');
                if (!confirmed)
                    return;

                var viewModel = {
                    shippingId: this.selectedEntity._id,
                    phasesId: entity._id,
                    spbNumber: this.selectedEntity.spbNumber,
                    amount: entity.amount
                };

                var ctrl = this;
                app.api.payment.deletePay(viewModel).then(function (result) {
                    ctrl.notify('success', 'Hapus pembayaran berhasil');
                    ctrl.filter();
                }).catch(function (error) {
                    ctrl.notify('error', 'Hapus pembayaran gagal ' + error.data);
                });
            };
            paymentCtrl.prototype.updatePay = function (entity) {
                if (this.selectedEntity.audited) {
                    this.notify('warning', 'Pengiriman ini sedang diaudit oleh manager');
                    return;
                }

                if (!this.dataTransferDate || this.dataTransferDate == '') {
                    this.notify('warning', 'Tanggal transfer harus diisi');
                    return;
                }

                if (!entity.amount || entity.amount == '' || entity.amount == 0) {
                    this.notify('warning', 'Jumlah bayar harus diisi');
                    return;
                }
             
                var viewModel = {
                    shippingId: this.selectedEntity._id,
                    spbNumber: this.selectedEntity.spbNumber,
                    phasesId: entity._id,
                    bank: entity.bank,
                    notes: entity.notes,
                    amount: entity.amount,
                    transferDate: this.dataTransferDate,
                    date: entity.date
                };

                var ctrl = this;
                app.api.payment.updatePay(viewModel).then(function (result) {
                    ctrl.notify('success', 'Proses pembayaran berhasil' );
                    ctrl.filter();
                }).catch(function (error) {
                    ctrl.notify('error', 'Proses pembayaran gagal ' + error.data);
                });
            };
            paymentCtrl.prototype.load = function () {
                var ctrl = this;
                ctrl.createQuery();
                ctrl.loadingData = true;
                ctrl.functions.load(ctrl.query).then(function (result) {
                    ctrl.entities = result.data;
                    if (ctrl.viewType == ViewType.phases) {
                        var entity = ctrl.entities.filter(function (e) { return e['_id'] === ctrl.selectedEntity['_id']; })[0];
                        ctrl.viewPhases(entity);
                    }
                }).catch(function (error) {
                    ctrl.notify('error', error.data);
                }).finally(function () {
                    ctrl.loadingData = false;
                });
            };

            paymentCtrl.$inject = ['$scope', 'Notification'];
            return paymentCtrl;
        }(controllers.baseCtrl));
        app.lois.controller('paymentCtrl', paymentCtrl);
    })(controllers = app.controllers || (app.controllers = {}));
})(app || (app = {}));
//# sourceMappingURL=paymentCtrl.js.map