var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var app;
(function (app) {
    var controllers;
    (function (controllers) {
        var configurationCtrl = (function (_super) {
            __extends(configurationCtrl, _super);
            function configurationCtrl($scope, Notification) {
                _super.call(this, Notification);
                this.functions.load = app.api.configuration.getAll;
                this.functions.get = app.api.configuration.get;
                this.functions.save = app.api.configuration.save;
                this.functions.delete = app.api.configuration.delete;
                this.functions.autocomplete = app.api.autocomplete.getAll;
                this.onConfigChange('region');
            }
            configurationCtrl.prototype.onConfigChange = function (config) {
                this.config = config;
                this.paging.page = 1;
                this.filters = {};
                this.filter();
            };
            configurationCtrl.prototype.load = function () {
                var ctrl = this;
                ctrl.createQuery();
                ctrl.loadingData = true;
                ctrl.functions.load(ctrl.config, ctrl.query).then(function (result) {
                    ctrl.entities = result.data;
                }).catch(function (error) {
                    ctrl.notify('error', error.data);
                }).finally(function () {
                    ctrl.loadingData = false;
                });
            };
            configurationCtrl.prototype.add = function () {
                this.showForm = true;
                if (this.config === 'tariff')
                    this.entity = this.createTariff();
                else
                    this.entity = null;
            };
            configurationCtrl.prototype.edit = function (id) {
                var ctrl = this;
                ctrl.processing = true;
                ctrl.showForm = true;
                ctrl.functions.get(ctrl.config, id).then(function (result) {
                    ctrl.entity = result.data;
                }).catch(function (error) {
                    ctrl.notify('error', error.data);
                }).finally(function () {
                    ctrl.processing = false;
                });
            };
            configurationCtrl.prototype.save = function () {
                var ctrl = this;
                ctrl.processing = true;
                ctrl.functions.save(ctrl.config, ctrl.entity).then(function (result) {
                    ctrl.notify('success', 'Data berhasil disimpan');
                    ctrl.showForm = false;
                    ctrl.filter();
                }).catch(function (error) {
                    ctrl.notify('error', error.data);
                }).finally(function () {
                    ctrl.processing = false;
                });
            };
            configurationCtrl.prototype.delete = function (id) {
                var confirmed = confirm('Data akan dihapus, anda yakin?');
                if (!confirmed)
                    return;
                var ctrl = this;
                ctrl.functions.delete(ctrl.config, id).then(function (result) {
                    ctrl.notify('success', 'Data berhasil dihapus');
                    ctrl.load();
                }).catch(function (error) {
                    ctrl.notify('error', error.data);
                });
            };
            configurationCtrl.prototype.createTariff = function () {
                return {
                    "client": null,
                    "destination": null,
                    "minimum": 0,
                    "prices": [0, 0, 0]
                };
            };
            configurationCtrl.$inject = ['$scope', 'Notification'];
            return configurationCtrl;
        }(controllers.baseCtrl));
        app.lois.controller('configurationCtrl', configurationCtrl);
    })(controllers = app.controllers || (app.controllers = {}));
})(app || (app = {}));
//# sourceMappingURL=configurationCtrl.js.map