var mongoose = require('mongoose');
var schemas = require('../models/schemas');
var date = require('../utils/date');
var static = require('../utils/static');
var co = require('co');
var _ = require('lodash');
var ObjectId = mongoose.Types.ObjectId;

function Controller() {
    this.shippingController = require('../controllers/ShippingController');
}

Controller.prototype.get = function (id) {
    return schemas.audits.findOne({ _id: ObjectId(id) }).exec();
};

Controller.prototype.getAll = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = {};

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    return schemas.audits.find(parameters).skip(skip).limit(limit).populate('user', { "hash": 0, "salt": 0 }).sort({ "date": 1 }).exec();
};

Controller.prototype.approve = function (viewModel) {
    var self = this;

    return co(function* () {
        var audit = yield schemas.audits.findOne({ "_id": ObjectId(viewModel._id) }).exec();

        if (!audit)
            throw new Error('Audit data is not found');

        if (!shipping)
            throw new Error('Shipping is not found');

        switch (viewModel['type']) {
            case "payment":
                yield self.paymentProcess(viewModel.data);
                break;
            case "price":
                yield self.priceProcess(viewModel.data);
                break;
        };

        return yield self.delete(audit._id);
    });
};

Controller.prototype.reject = function (viewModel) {
    var self = this;

    return co(function* () {
        var audit = yield schemas.audits.findOne({ "_id": ObjectId(viewModel._id) }).exec();
        var shipping = yield schemas.shippings.findOne({ "_id": ObjectId(viewModel.data.shippingId) }).exec();

        if (!audit)
            throw new Error('Audit data is not found');

        if (!shipping)
            throw new Error('Shipping is not found');

        switch (viewModel['type']) {
            case "payment":
                shipping.audited = false;
                yield shipping.save();
                break;
            case "price":

                break;
        };

        return yield self.delete(audit._id);
    });
};

Controller.prototype.paymentProcess = function (data) {
    return co(function* () {
        var shipping = yield schemas.shippings.findOne({ "_id": ObjectId(viewModel.data.shippingId) }).exec();

        if (!shipping)
            return;

        var totalPaid = shipping.payment.paid + parseFloat(data.amount);

        if (totalPaid >= shipping.cost.total)
            shipping.payment.status = static.terbayar;
        else if (totalPaid > 0)
            shipping.payment.status = static.terbayarSebagian;
        else if (totalPaid <= 0)
            shipping.payment.status = static.belumTerbayar;

        shipping.payment.phases.push({
            transferDate: new Date(_.parseInt(data.transferDate)),
            date: new Date(_.parseInt(data.date)),
            bank: data.bank,
            notes: data.notes,
            amount: parseFloat(data.amount)
        });

        shipping.payment.paid += parseFloat(data.amount);
        shipping.audited = false;
        shipping.payment.type = ObjectId(data.paymentTypeId);
        return shipping.save();
    });
};

Controller.prototype.priceProcess = function (data) {
    return this.shippingController.save(data, true);
};

Controller.prototype.delete = function (id) {
    var self = this;
    return co(function* () {
        var model = yield self.get(id);

        if (!model)
            throw new Error('Data is not found');

        return model.remove({ _id: ObjectId(id) });
    });
};

module.exports = new Controller();