var app;
(function (app) {
    var controllers;
    (function (controllers) {
        var baseCtrl = (function () {
            function baseCtrl(notification) {
                this.notification = notification;
                this.showToolbar = false;
                this.showForm = false;
                this.checkedAll = false;
                this.loadingData = false;
                this.processing = false;
                this.filters = {};
                this.query = {};
                this.paging = { "page": 1, "max": 10, "total": 0 };
                this.functions = { "load": null, "get": null, "save": null, "delete": null, "autocomplete": null };
            }
            baseCtrl.prototype.filter = function () {
                this.paging.page = 1;
                this.load();
            };
            baseCtrl.prototype.load = function () {
                var ctrl = this;
                ctrl.createQuery();
                ctrl.loadingData = true;
                ctrl.checkedAll = false;
                ctrl.functions.load(ctrl.query).then(function (result) {
                    ctrl.entities = result.data;
                }).catch(function (error) {
                    ctrl.notify('error', error.data);
                }).finally(function () {
                    ctrl.loadingData = false;
                });
            };
            baseCtrl.prototype.add = function () {
                this.showForm = true;
                this.entity = null;
            };
            baseCtrl.prototype.edit = function (id) {
                var ctrl = this;
                ctrl.showForm = true;
                ctrl.processing = true;
                ctrl.functions.get(id).then(function (result) {
                    ctrl.entity = result.data;
                }).catch(function (error) {
                    ctrl.showForm = false;
                    ctrl.notify('error', error.data);
                }).finally(function () {
                    ctrl.processing = false;
                });
            };
            baseCtrl.prototype.save = function () {
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
            baseCtrl.prototype.delete = function (id) {
                var ctrl = this;
                ctrl.loadingData = true;
                ctrl.functions.delete(id).then(function (result) {
                    ctrl.notify('success', 'Data berhasil dihapus');
                    ctrl.load();
                }).catch(function (error) {
                    ctrl.notify('error', error.data);
                }).finally(function () {
                    ctrl.loadingData = false;
                });
            };
            baseCtrl.prototype.createQuery = function () {
                this.query = {};
                this.query['limit'] = this.paging.max;
                this.query['skip'] = (this.paging.page - 1) * this.paging.max;
                var keys = Object.keys(this.filters);
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    if (this.filters[key] && this.filters[key]['_id'])
                        this.query[key] = this.filters[key]['_id'];
                    else
                        this.query[key] = this.filters[key];
                }
            };
            baseCtrl.prototype.next = function () {
                if (this.entities.length === 0)
                    return;
                this.paging.page += 1;
                this.load();
            };
            baseCtrl.prototype.prev = function () {
                if ((this.paging.page - 1) <= 0)
                    return;
                this.paging.page -= 1;
                this.load();
            };
            baseCtrl.prototype.notify = function (type, message) {
                this.notification[type](message);
            };
            baseCtrl.prototype.toggleShowForm = function (show) {
                this.showForm = show;
                this.entity = null;
            };
            baseCtrl.prototype.toggleCheckAll = function () {
                var _this = this;
                this.entities.map(function (e) { return e.checked = _this.checkedAll; });
            };
            baseCtrl.prototype.suggest = function (name, keyword) {
                return this.functions.autocomplete(name, keyword).then(function (result) {
                    return result.data;
                });
            };
            return baseCtrl;
        }());
        controllers.baseCtrl = baseCtrl;
    })(controllers = app.controllers || (app.controllers = {}));
})(app || (app = {}));
//# sourceMappingURL=baseCtrl.js.map