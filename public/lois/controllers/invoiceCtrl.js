var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var app;
(function (app) {
    var controllers;
    (function (controllers) {
        var InvoiceType;
        (function (InvoiceType) {
            InvoiceType[InvoiceType["Semua"] = 1] = "Semua";
            InvoiceType[InvoiceType["Klien"] = 2] = "Klien";
            InvoiceType[InvoiceType["Partner"] = 3] = "Partner";
        })(InvoiceType || (InvoiceType = {}));
        ;
        var invoiceCtrl = (function (_super) {
            __extends(invoiceCtrl, _super);
            function invoiceCtrl($scope, Notification) {
                _super.call(this, Notification);
                this.tab = 'create';
                this.functions.load = app.api.invoice.getAll;
                this.functions.autocomplete = app.api.autocomplete.getAll;
                this.invoiceType = InvoiceType.Semua;
                this.filter();
            }
            invoiceCtrl.prototype.onTabChange = function (tab) {
                this.tab = tab;
                if (this.tab === 'create' || this.tab === 'change')
                    this.functions.load = app.api.invoice.getAll;
                else if (this.tab === 'list')
                    this.functions.load = app.api.invoice.getList;
                this.paging.page = 1;
                this.filters = {};
                this.filter();
            };
            invoiceCtrl.prototype.create = function () {
                var _this = this;
                if (!this.to || this.to === '') {
                    this.notify('warning', 'Tertagih harus diisi');
                    return;
                }
                if (!this.location || this.location === '') {
                    this.notify('warning', 'Lokasi tertagih harus diisi');
                    return;
                }
                var checkedEntities = this.entities.filter(function (e) { return e.checked; });
                if (checkedEntities.length === 0) {
                    this.notify('warning', 'Tidak ada pengiriman yang dipilih');
                    return;
                }
                var viewModels = [];
                checkedEntities.forEach(function (e) {
                    viewModels.push({ shippingId: e._id, to: _this.to, location: _this.location, type: InvoiceType[_this.invoiceType] });
                });
                var ctrl = this;
                app.api.invoice.create(viewModels).then(function (result) {
                    ctrl.notify('success', 'Tagihan berhasil dibuat');
                    ctrl.filter();
                }).catch(function (error) {
                    ctrl.notify('error', 'Tagihan gagal dibuat ' + error.data);
                });
            };
            invoiceCtrl.prototype.change = function () {
                var _this = this;
                if (!this.toInvoice || this.toInvoice === '') {
                    this.notify('warning', 'Tujuan invoice harus diisi');
                    return;
                }
                var checkedEntities = this.entities.filter(function (e) { return e.checked; });
                if (checkedEntities.length === 0) {
                    this.notify('warning', 'Tidak ada pengiriman yang dipilih');
                    return;
                }
                var viewModels = [];
                checkedEntities.forEach(function (e) {
                    viewModels.push({ shippingId: e._id, fromInvoice: e.invoice.all, toInvoice: _this.toInvoice });
                });
                var ctrl = this;
                app.api.invoice.change(viewModels).then(function (result) {
                    ctrl.notify('success', 'Tagihan berhasil dipindahkan');
                    ctrl.filter();
                }).catch(function (error) {
                    ctrl.notify('error', 'Tagihan gagal dipindahkan ' + error.data);
                });
            };
            invoiceCtrl.prototype.print = function (entity) {
                var ctrl = this;
                app.api.invoice.getInvoiceReport(entity).then(function (result) {
                    app.api.reportPrint.printInvoice(result.data).then(function (buffer) {
                        var blob = new Blob([buffer.data], { type: 'application/pdf' });
                        var url = URL.createObjectURL(blob);
                        window.open(url, '_blank');
                    });
                });
            };
            invoiceCtrl.$inject = ['$scope', 'Notification'];
            return invoiceCtrl;
        }(controllers.baseCtrl));
        app.lois.controller('invoiceCtrl', invoiceCtrl);
    })(controllers = app.controllers || (app.controllers = {}));
})(app || (app = {}));
//# sourceMappingURL=invoiceCtrl.js.map