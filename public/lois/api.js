var app;
(function (app) {
    var api;
    (function (api) {
        var user = (function () {
            function user() {
            }
            user.login = function (data) {
                return app.http.post('/lois/api/user/authenticate', JSON.stringify(data));
            };
            user.logout = function () {
                return app.http.get('/lois/api/user/logout');
            };
            user.getSession = function () {
                return app.http.get('/lois/api/user/getSession');
            };
            return user;
        }());
        api.user = user;
        var shipping = (function () {
            function shipping() {
            }
            shipping.get = function (id) {
                return app.http.get('/lois/api/shipping/get?id=' + id);
            };
            shipping.getAll = function (query) {
                return app.http.get('/lois/api/shipping/getAll?query=' + JSON.stringify(query));
            };
            shipping.save = function (data) {
                return app.http.post('/lois/api/shipping/save', JSON.stringify(data));
            };
            shipping.add = function () {
                return app.http.post('/lois/api/shipping/add', null);
            };
            return shipping;
        }());
        api.shipping = shipping;
        var deliveryOrder = (function () {
            function deliveryOrder() {
            }
            deliveryOrder.getAll = function (query) {
                return app.http.get('/lois/api/deliveryOrder/getAll?query=' + JSON.stringify(query));
            };
            deliveryOrder.getDataReport = function (data) {
                return app.http.post('/lois/api/deliveryOrder/getDataReport', JSON.stringify(data));
            };
            return deliveryOrder;
        }());
        api.deliveryOrder = deliveryOrder;
        var home = (function () {
            function home() {
            }
            home.getOverall = function (query) {
                return app.http.get('/lois/api/home/getOverall?query=' + JSON.stringify(query));
            };
            home.getDestinations = function (query) {
                return app.http.get('/lois/api/home/getDestinations?query=' + JSON.stringify(query));
            };
            home.getSenders = function (query) {
                return app.http.get('/lois/api/home/getSenders?query=' + JSON.stringify(query));
            };
            home.getPaymentTypes = function (query) {
                return app.http.get('/lois/api/home/getPaymentTypes?query=' + JSON.stringify(query));
            };
            home.getPaymentStatuses = function (query) {
                return app.http.get('/lois/api/home/getPaymentStatuses?query=' + JSON.stringify(query));
            };
            home.getRegions = function (query) {
                return app.http.get('/lois/api/home/getRegions?query=' + JSON.stringify(query));
            };
            home.getAll = function (query) {
                return app.http.get('/lois/api/home/getAll?query=' + JSON.stringify(query));
            };
            return home;
        }());
        api.home = home;
        var recapitulation = (function () {
            function recapitulation() {
            }
            recapitulation.getAll = function (query) {
                return app.http.get('/lois/api/recapitulation/getAll?query=' + JSON.stringify(query));
            };
            recapitulation.getAllCancel = function (query) {
                return app.http.get('/lois/api/recapitulation/getAllCancel?query=' + JSON.stringify(query));
            };
            recapitulation.recap = function (data) {
                return app.http.post('/lois/api/recapitulation/recap', JSON.stringify(data));
            };
            recapitulation.cancelRecap = function (data) {
                return app.http.post('/lois/api/recapitulation/cancelRecap', JSON.stringify(data));
            };
            return recapitulation;
        }());
        api.recapitulation = recapitulation;
        var delivery = (function () {
            function delivery() {
            }
            delivery.getAll = function (query) {
                return app.http.get('/lois/api/delivery/getAll?query=' + JSON.stringify(query));
            };
            delivery.getAllCancel = function (query) {
                return app.http.get('/lois/api/delivery/getAllCancel?query=' + JSON.stringify(query));
            };
            delivery.delivery = function (data) {
                return app.http.post('/lois/api/delivery/delivery', JSON.stringify(data));
            };
            delivery.cancelDelivery = function (data) {
                return app.http.post('/lois/api/delivery/cancelDelivery', JSON.stringify(data));
            };
            return delivery;
        }());
        api.delivery = delivery;
        var _return = (function () {
            function _return() {
            }
            _return.getAll = function (query) {
                return app.http.get('/lois/api/return/getAll?query=' + JSON.stringify(query));
            };
            _return.getAllConfirm = function (query) {
                return app.http.get('/lois/api/return/getAllConfirm?query=' + JSON.stringify(query));
            };
            _return.return = function (data) {
                return app.http.post('/lois/api/return/return', JSON.stringify(data));
            };
            _return.confirm = function (data) {
                return app.http.post('/lois/api/return/confirm', JSON.stringify(data));
            };
            _return.upload = function (data) {
                return app.http.post('/lois/api/return/uploads', data, { headers: { 'Content-Type': undefined } });
            };
            return _return;
        }());
        api._return = _return;
        var payment = (function () {
            function payment() {
            }
            payment.getAll = function (query) {
                return app.http.get('/lois/api/payment/getAll?query=' + JSON.stringify(query));
            };
            payment.pay = function (data) {
                return app.http.post('/lois/api/payment/pay', JSON.stringify(data));
            };
            return payment;
        }());
        api.payment = payment;
        var invoice = (function () {
            function invoice() {
            }
            invoice.getAll = function (query) {
                return app.http.get('/lois/api/invoice/getAll?query=' + JSON.stringify(query));
            };
            invoice.getList = function (query) {
                return app.http.get('/lois/api/invoice/getList?query=' + JSON.stringify(query));
            };
            invoice.create = function (data) {
                return app.http.post('/lois/api/invoice/create', JSON.stringify(data));
            };
            invoice.change = function (data) {
                return app.http.post('/lois/api/invoice/change', JSON.stringify(data));
            };
            invoice.getInvoiceReport = function (data) {
                return app.http.post('/lois/api/invoice/getInvoiceReport', JSON.stringify(data));
            };
            return invoice;
        }());
        api.invoice = invoice;
        var configuration = (function () {
            function configuration() {
            }
            configuration.get = function (config, id) {
                return app.http.get('/lois/api/' + config + '/get?id=' + id);
            };
            configuration.getAll = function (config, query) {
                return app.http.get('/lois/api/' + config + '/getAll?query=' + JSON.stringify(query));
            };
            configuration.save = function (config, data) {
                return app.http.post('/lois/api/' + config + '/save', JSON.stringify(data));
            };
            configuration.delete = function (config, id) {
                return app.http.delete('/lois/api/' + config + '/delete?id=' + id);
            };
            return configuration;
        }());
        api.configuration = configuration;
        var notification = (function () {
            function notification() {
            }
            notification.getAll = function (query) {
                return app.http.get('/lois/api/notification/getAll?query=' + JSON.stringify(query));
            };
            notification.delete = function (id) {
                return app.http.delete('/lois/api/notification/delete?id=' + id);
            };
            return notification;
        }());
        api.notification = notification;
        var audit = (function () {
            function audit() {
            }
            audit.getAll = function (query) {
                return app.http.get('/lois/api/audit/getAll?query=' + JSON.stringify(query));
            };
            audit.process = function (data) {
                return app.http.post('/lois/api/audit/process', JSON.stringify(data));
            };
            return audit;
        }());
        api.audit = audit;
        var autocomplete = (function () {
            function autocomplete() {
            }
            autocomplete.getAll = function (name, keyword) {
                return app.http.get('/lois/api/' + name + '/getAll?query=' + JSON.stringify({ "name": keyword }));
            };
            return autocomplete;
        }());
        api.autocomplete = autocomplete;
        var report = (function () {
            function report() {
            }
            report.getRecapitulations = function (query) {
                return app.http.get('/lois/api/reportData/getRecapitulations?query=' + JSON.stringify(query));
            };
            report.getRecapitulationsReport = function (data, query) {
                return app.http.post('/lois/api/reportData/getRecapitulationsReport?query= ' + JSON.stringify(query), JSON.stringify(data));
            };
            report.getDeliveries = function (query) {
                return app.http.get('/lois/api/reportData/getDeliveries?query=' + JSON.stringify(query));
            };
            report.getDeliveriesReport = function (data, query) {
                return app.http.post('/lois/api/reportData/getDeliveriesReport?query= ' + JSON.stringify(query), JSON.stringify(data));
            };
            report.getReturns = function (query) {
                return app.http.get('/lois/api/reportData/getReturns?query=' + JSON.stringify(query));
            };
            report.getReturnsReport = function (data, query) {
                return app.http.post('/lois/api/reportData/getReturnsReport?query= ' + JSON.stringify(query), JSON.stringify(data));
            };
            report.getUnconfirmed = function (query) {
                return app.http.get('/lois/api/reportData/getUnconfirmed?query=' + JSON.stringify(query));
            };
            report.getUnconfirmedReport = function (data, query) {
                return app.http.post('/lois/api/reportData/getUnconfirmedReport?query= ' + JSON.stringify(query), JSON.stringify(data));
            };
            report.getPaid = function (query) {
                return app.http.get('/lois/api/reportData/getPaid?query=' + JSON.stringify(query));
            };
            report.getPaidReport = function (data, query) {
                return app.http.post('/lois/api/reportData/getPaidReport?query= ' + JSON.stringify(query), JSON.stringify(data));
            };
            report.getUnpaid = function (query) {
                return app.http.get('/lois/api/reportData/getUnpaid?query=' + JSON.stringify(query));
            };
            report.getUnpaidReport = function (data, query) {
                return app.http.post('/lois/api/reportData/getUnpaidReport?query= ' + JSON.stringify(query), JSON.stringify(data));
            };
            report.getDeliveryList = function (query) {
                return app.http.get('/lois/api/reportData/getDeliveryList?query=' + JSON.stringify(query));
            };
            report.getDeliveryListReport = function (data, query) {
                return app.http.post('/lois/api/reportData/getDeliveryListReport?query= ' + JSON.stringify(query), JSON.stringify(data));
            };
            report.getCommisions = function (query) {
                return app.http.get('/lois/api/reportData/getCommisions?query=' + JSON.stringify(query));
            };
            report.getCommisionsReport = function (data, query) {
                return app.http.post('/lois/api/reportData/getCommisionsReport?query=' + JSON.stringify(query), JSON.stringify(data));
            };
            return report;
        }());
        api.report = report;
        var reportPrint = (function () {
            function reportPrint() {
            }
            reportPrint.printDeliveryOrder = function (data) {
                var config = {
                    "headers": { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                    "responseType": "arraybuffer"
                };
                return app.http.post('http://limassentosa.net:8000/report-engine/suratjalan', JSON.stringify(data), config);
            };
            reportPrint.printPaid = function (data) {
                var config = {
                    "headers": { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                    "responseType": "arraybuffer"
                };
                return app.http.post('http://limassentosa.net:8000/report-engine/paid', JSON.stringify(data), config);
            };
            reportPrint.printUnpaid = function (data) {
                var config = {
                    "headers": { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                    "responseType": "arraybuffer"
                };
                return app.http.post('http://limassentosa.net:8000/report-engine/unpaid', JSON.stringify(data), config);
            };
            reportPrint.printRecapitulation = function (data) {
                var config = {
                    "headers": { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                    "responseType": "arraybuffer"
                };
                return app.http.post('http://limassentosa.net:8000/report-engine/recapitulation', JSON.stringify(data), config);
            };
            reportPrint.printDelivery = function (data) {
                var config = {
                    "headers": { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                    "responseType": "arraybuffer"
                };
                return app.http.post('http://limassentosa.net:8000/report-engine/delivery', JSON.stringify(data), config);
            };
            reportPrint.printReturn = function (data) {
                var config = {
                    "headers": { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                    "responseType": "arraybuffer"
                };
                return app.http.post('http://limassentosa.net:8000/report-engine/return', JSON.stringify(data), config);
            };
            reportPrint.printUnconfirmed = function (data) {
                var config = {
                    "headers": { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                    "responseType": "arraybuffer"
                };
                return app.http.post('http://limassentosa.net:8000/report-engine/suratbelumkembali', JSON.stringify(data), config);
            };
            reportPrint.printDeliveryList = function (data) {
                var config = {
                    "headers": { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                    "responseType": "arraybuffer"
                };
                return app.http.post('http://limassentosa.net:8000/report-engine/shipment', JSON.stringify(data), config);
            };
            reportPrint.printCommision = function (data) {
                var config = {
                    "headers": { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                    "responseType": "arraybuffer"
                };
                return app.http.post('http://limassentosa.net:8000/report-engine/commision', JSON.stringify(data), config);
            };
            reportPrint.printInvoice = function (data) {
                var config = {
                    "headers": { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                    "responseType": "arraybuffer"
                };
                return app.http.post('http://limassentosa.net:8000/report-engine/invoice', JSON.stringify(data), config);
            };
            return reportPrint;
        }());
        api.reportPrint = reportPrint;
    })(api = app.api || (app.api = {}));
})(app || (app = {}));
//# sourceMappingURL=api.js.map