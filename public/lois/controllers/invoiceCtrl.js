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
                var ret = false;
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
                    if (e.invoice.all || !e.invoice.all === '') {
                        _this.notify('warning', e.spbNumber + ' sudah dibuat tagihan ' + e.invoice.all);
                        ret = true;
                    }
                    viewModels.push({ shippingId: e._id, to: _this.to, location: _this.location, type: InvoiceType[_this.invoiceType] });
                });
                if (ret) 
                    return;

                var ctrl = this;
                app.api.invoice.create(viewModels).then(function (result) {
                    ctrl.notify('success', 'Tagihan berhasil dibuat');
                    ctrl.filter();
                }).catch(function (error) {
                    ctrl.notify('error', 'Tagihan gagal dibuat ' + error.data);
                });
            };
            invoiceCtrl.prototype.change = function () {
                var ret = false;
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
                    if (e.invoice.all == _this.toInvoice)                      
                        ret = true;
                    
                    viewModels.push({ shippingId: e._id, fromInvoice: e.invoice.all, toInvoice: _this.toInvoice });
                });
                if (ret) {
                    this.notify('warning', 'Nomor invoice dan ke invoice tidak boleh sama');
                    return;
                }

                var ctrl = this;
                app.api.invoice.change(viewModels).then(function (result) {
                    ctrl.notify('success', 'Tagihan berhasil dipindahkan');
                    ctrl.filter();
                }).catch(function (error) {
                    ctrl.notify('error', 'Tagihan gagal dipindahkan ' + error.data);
                });
            };
            invoiceCtrl.prototype.print = function (entity, type) {
                var ctrl = this;
                app.api.invoice.getInvoiceReport(entity).then(function (result) {
                    if (type == 1) {
                        app.api.reportPrint.printInvoiceAll(result.data).then(function (buffer) {
                            var blob = new Blob([buffer.data], { type: 'application/pdf' });
                            var url = URL.createObjectURL(blob);
                            window.open(url, '_blank');
                        });
                    }
                    else if (type == 2) {
                        app.api.reportPrint.printInvoiceClient(result.data).then(function (buffer) {
                            var blob = new Blob([buffer.data], { type: 'application/pdf' });
                            var url = URL.createObjectURL(blob);
                            window.open(url, '_blank');
                        });
                    }
                    else if (type == 3) {
                        app.api.reportPrint.printInvoicePartner(result.data).then(function (buffer) {
                            var blob = new Blob([buffer.data], { type: 'application/pdf' });
                            var url = URL.createObjectURL(blob);
                            window.open(url, '_blank');
                        });
                    }
                });
            };
            invoiceCtrl.prototype.editInvoice = function (e) {                
                this.activeEntity = e;
            };
            invoiceCtrl.prototype.cancelInvoice = function (e) {
                this.activeEntity = null;
            };
            invoiceCtrl.prototype.updateInvoice = function (e) {
                if (!e.to || e.to == '') {
                    this.notify('warning', 'Tertagih harus diisi');
                    return;
                }

                if (!e.location || e.location == '') {
                    this.notify('warning', 'Lokasi harus diisi');
                    return;
                }
                var viewModel = {
                    invoiceId: e._id,
                    to: e.to,
                    location: e.location
                };

                var ctrl = this;
                app.api.invoice.updateInvoice(viewModel).then(function (result) {
                    ctrl.notify('success', 'Proses update berhasil');
                    ctrl.filter();
                }).catch(function (error) {
                    ctrl.notify('error', 'Proses update gagal ' + error.data);
                });
            };
            invoiceCtrl.$inject = ['$scope', 'Notification'];
            return invoiceCtrl;
        }(controllers.baseCtrl));
        app.lois.controller('invoiceCtrl', invoiceCtrl);
    })(controllers = app.controllers || (app.controllers = {}));
})(app || (app = {}));
//# sourceMappingURL=invoiceCtrl.js.map