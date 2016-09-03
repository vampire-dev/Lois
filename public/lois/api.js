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
        var autocomplete = (function () {
            function autocomplete() {
            }
            autocomplete.getAll = function (name, keyword) {
                return app.http.get('/lois/api/' + name + '/getAll?query=' + JSON.stringify({ "name": keyword }));
            };
            return autocomplete;
        }());
        api.autocomplete = autocomplete;
    })(api = app.api || (app.api = {}));
})(app || (app = {}));
//# sourceMappingURL=api.js.map