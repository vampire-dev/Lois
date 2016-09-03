var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var app;
(function (app) {
    var controllers;
    (function (controllers) {
        var returnCtrl = (function (_super) {
            __extends(returnCtrl, _super);
            function returnCtrl($scope, Notification) {
                _super.call(this, Notification);
                this.functions.load = app.api._return.getAll;
                this.functions.autocomplete = app.api.autocomplete.getAll;
                this.filter();
            }
            returnCtrl.prototype.upload = function (file, entity) {
                var fd = new FormData();
                fd.append('file', file);
                entity.shipping[0].returnInfo.filePath = null;
                var ctrl = this;
                app.api._return.upload(fd).then(function (result) {
                    entity.shipping[0].returnInfo.filePath = result.data['filename'];
                }).catch(function (error) {
                    ctrl.notify('error', error.data);
                });
            };
            returnCtrl.prototype.process = function () {
                var checkedEntities = this.entities.filter(function (e) { return e.checked; });
                if (checkedEntities.length === 0) {
                    this.notify('warning', 'Tidak ada pengiriman yang dipilih');
                    return;
                }
                var ctrl = this;
                var data = checkedEntities.map(function (e) { return e.shipping[0]; });
                app.api._return.return(data).then(function (result) {
                    ctrl.notify('success', 'Proses retur berhasil');
                    ctrl.filter();
                }).catch(function (error) {
                    ctrl.notify('error', 'Proses retur gagal ' + error.data);
                });
            };
            returnCtrl.$inject = ['$scope', 'Notification'];
            return returnCtrl;
        }(controllers.baseCtrl));
        app.lois.controller('returnCtrl', returnCtrl);
    })(controllers = app.controllers || (app.controllers = {}));
})(app || (app = {}));
//# sourceMappingURL=returnCtrl.js.map