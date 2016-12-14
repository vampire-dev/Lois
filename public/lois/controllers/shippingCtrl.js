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
        var shippingCtrl = (function (_super) {
            __extends(shippingCtrl, _super);
            function shippingCtrl($scope, Notification) {
                _super.call(this, Notification);
                this.viewType = ViewType.shipping;
                this.functions.load = app.api.shipping.getAll;
                this.functions.get = app.api.shipping.get;
                this.functions.save = app.api.shipping.save;
                this.functions.autocomplete = app.api.autocomplete.getAll;
                this.filter();
            }
            shippingCtrl.prototype.load = function () {
                var ctrl = this;
                ctrl.createQuery();
                ctrl.loadingData = true;
                ctrl.checkedAll = false;
                ctrl.functions.load(ctrl.query).then(function (result) {
                    ctrl.entities = result.data;
                    if (ctrl.viewType == ViewType.item) {
                        var entity = ctrl.entities.filter(function (e) { return e['_id'] === ctrl.selectedEntity['_id']; })[0];
                        ctrl.viewItems(entity);
                    }
                }).catch(function (exception) {
                    ctrl.notify('error', exception);
                }).finally(function () {
                    ctrl.loadingData = false;
                });
            };
            shippingCtrl.prototype.save = function () {
                if (!this.entity.sender || !this.entity.sender._id) {
                    this.notify('warning', 'Pengirim tidak boleh kosong');
                    return;
                }
                if (!this.entity.destination || !this.entity.destination._id) {
                    this.notify('warning', 'Tujuan tidak boleh kosong');
                    return;
                }
                if (!this.entity.payment.type || !this.entity.payment.type._id) {
                    this.notify('warning', 'Cara pembayaran tidak boleh kosong');
                    return;
                }
                var ctrl = this;
                ctrl.processing = true;
                ctrl.functions.save(ctrl.entity).then(function (result) {
                    ctrl.notify('success', 'Data berhasil disimpan');
                    ctrl.load();
                    ctrl.showForm = false;
                }).catch(function (error) {
                    ctrl.notify('error', error.data);
                }).finally(function () {
                    ;
                    ctrl.processing = false;
                });
            };
            shippingCtrl.prototype.add = function () {
                var ctrl = this;
                app.api.shipping.add().then(function (result) {
                    ctrl.notify('success', 'Spb berhasil ditambah');
                    ctrl.load();
                }).catch(function (error) {
                    ctrl.notify('error', error.data);
                });
            };
            shippingCtrl.prototype.edit = function (entity) {
                if (entity.audited) {
                    this.notify('warning', 'Pengiriman ini sedang diaudit oleh manager');
                    return;
                }
                var ctrl = this;
                ctrl.processing = true;
                ctrl.showForm = true;
                ctrl.functions.get(entity._id).then(function (result) {
                    ctrl.entity = result.data;
                }).catch(function (exception) {
                    ctrl.notify('error', exception.data);
                }).finally(function () {
                    ctrl.processing = false;
                });
            };
            shippingCtrl.prototype.addItem = function () {
                this.selectedItem = this.constructItem();
                this.showForm = true;
            };
            shippingCtrl.prototype.saveItem = function () {
                if (this.selectedItem.itemType == null) {
                    this.notify('warning', 'Jenis barang harus diisi');
                    return;
                }
                if (this.selectedItem.packingType == null) {
                    this.notify('warning', 'Packing barang harus diisi');
                    return;
                }
                if (this.selectedItem.colli.quantity === 0) {
                    this.notify('warning', 'Koli harus lebih besar dari nol');
                    return;
                }
                var index = this.selectedEntity['items'].indexOf(this.selectedItem);
                if (index < 0)
                    this.selectedEntity['items'].push(this.selectedItem);
                this.entity = this.selectedEntity;
                this.save();
            };
            shippingCtrl.prototype.editItem = function (item) {
                if (item.status === 'Retur' || item.status === 'Surat Jalan Balik') {
                    this.notify('warning', 'Item dengan status Retur atau Surat Jalan Balik tidak dapat diedit');
                    return;
                }
                if (item.audited) {
                    this.notify('warning', 'Item ini sedang dalam audit manager');
                    return;
                }
                this.selectedItem = item;
                this.showForm = true;
            };
            shippingCtrl.prototype.deleteItem = function (item) {
                var confirmed = confirm('Item akan dihapus, anda yakin?');
                if (!confirmed)
                    return;
                var index = this.selectedEntity['items'].indexOf(item);
                if (index < 0) {
                    this.notify('warning', 'Item tidak ditemukan');
                    return;
                }
                this.selectedEntity['items'].splice(index, 1);
                this.entity = this.selectedEntity;
                this.save();
            };
            shippingCtrl.prototype.viewItems = function (entity) {
                this.viewType = ViewType.item;
                this.selectedEntity = entity;
                this.showToolbar = false;
            };
            shippingCtrl.prototype.viewShipping = function () {
                this.viewType = ViewType.shipping;
                this.selectedEntity = null;
                this.selectedItem = null;
            };
            shippingCtrl.prototype.constructItem = function () {
                return {
                    itemType: null,
                    packingType: null,
                    content: null,
                    dimensions: { length: 0, width: 0, height: 0, weight: 0 },
                    colli: { quantity: 0, available: 0, delivered: 0 },
                    cost: { colli: 0, shipping: 0, additional: 0, discount: 0 },
                    recapitulations: [],
                    deliveries: [],
                    status: 'Belum Terekap',
                    audited: false
                };
            };
            shippingCtrl.prototype.toggleShowItemForm = function (show) {
                this.showForm = show;
                this.selectedItem = null;
                this.load();
            };
            shippingCtrl.$inject = ['$scope', 'Notification'];
            return shippingCtrl;
        }(controllers.baseCtrl));
        app.lois.controller('shippingCtrl', shippingCtrl);
    })(controllers = app.controllers || (app.controllers = {}));
})(app || (app = {}));
//# sourceMappingURL=shippingCtrl.js.map