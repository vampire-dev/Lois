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
            ViewType[ViewType["summary"] = 1] = "summary";
            ViewType[ViewType["detail"] = 2] = "detail";
        })(ViewType || (ViewType = {}));
        ;
        var homeCtrl = (function (_super) {
            __extends(homeCtrl, _super);
            function homeCtrl($scope, Notification) {
                _super.call(this, Notification);
                this.viewType = ViewType.summary;
                this.loadOverall();
                this.onSummaryChanges('destination');
            }
            homeCtrl.prototype.loadOverall = function () {
                var ctrl = this;
                app.api.home.getOverall(ctrl.query).then(function (result) {
                    ctrl.overall = result.data;
                }).catch(function (error) {
                    ctrl.notify('error', error.data);
                });
            };
            homeCtrl.prototype.onSummaryChanges = function (summary) {
                switch (summary) {
                    case 'destination':
                        this.functions.load = app.api.home.getDestinations;
                        this.type = 'destination';
                        break;
                    case 'sender':
                        this.functions.load = app.api.home.getSenders;
                        this.type = 'sender';
                        break;
                    case 'paymentType':
                        this.functions.load = app.api.home.getPaymentTypes;
                        this.type = 'payment.type';
                        break;
                    case 'paymentStatus':
                        this.functions.load = app.api.home.getPaymentStatuses;
                        this.type = 'payment.status';
                        break;
                    case 'region':
                        this.functions.load = app.api.home.getRegions;
                        this.type = 'regions.destination';
                        break;
                }
                this.summary = summary;
                this.viewType = ViewType.summary;
                this.paging.page = 1;
                this.loadOverall();
                this.filter();
            };
            homeCtrl.prototype.viewDetails = function (id) {
                this.filters[this.type] = id;
                this.functions.load = app.api.home.getAll;
                this.viewType = ViewType.detail;
                this.paging.page = 1;
                this.filter();
            };
            homeCtrl.prototype.viewSummary = function () {
                delete this.filters[this.type];
                this.viewType = ViewType.summary;
                this.onSummaryChanges(this.summary);
            };
            homeCtrl.$inject = ['$scope', 'Notification'];
            return homeCtrl;
        }(controllers.baseCtrl));
        app.lois.controller('homeCtrl', homeCtrl);
    })(controllers = app.controllers || (app.controllers = {}));
})(app || (app = {}));
//# sourceMappingURL=homeCtrl.js.map