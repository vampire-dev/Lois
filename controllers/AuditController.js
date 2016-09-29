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

    return schemas.audits.find(parameters).skip(skip).limit(limit).populate('user', { "hash": 0, "salt": 0 }).sort({ "date": -1 }).exec();
};

Controller.prototype.approve = function (viewModel) {
    var self = this;

    return co(function* () {
        var audit = yield schemas.audits.findOne({ "_id": ObjectId(viewModel._id) }).exec();

        if (!audit)
            throw new Error('Audit data is not found');

        switch (viewModel['type']) {
            case "payment":
                yield self.paymentProcess(viewModel.data, viewModel.user, viewModel.stat);
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

        if (!audit)
            throw new Error('Audit data is not found');

        switch (viewModel['type']) {
            case "payment":
                shipping = yield schemas.shippings.findOne({ "_id": ObjectId(viewModel.data.shippingId) }).exec();
                shipping.audited = false;
                yield shipping.save();
                break;
            case "price":
                shipping = yield schemas.shippings.findOne({ "_id": ObjectId(viewModel.data._id) }).exec();
                yield self.shippingController.save(shipping, true);
                break;
        };

        return yield self.delete(audit._id);
    });
};

Controller.prototype.paymentProcess = function (data, user, stat) {
    return co(function* () {
        var match = yield schemas.shippings.aggregate([
            {
                "$match": {
                    "_id": ObjectId(data.shippingId),
                    "payment.phases._id": ObjectId(data.phasesId)
                }
            },
            { "$unwind": "$payment.phases" },
            {
                "$match": {
                    "payment.phases._id": ObjectId(data.phasesId)
                }
            }
        ]).exec();
        var shippingMatch = match[0];

        var shipping = yield schemas.shippings.findOne({ "_id": ObjectId(data.shippingId) }).exec();

        if ((!shipping) || (!shippingMatch))
            return;

        if (stat == "update")
            var totalPaid = parseFloat(shippingMatch.payment.paid) - parseFloat(shippingMatch.payment.phases.amount) + parseFloat(data.amount);
        else if (stat == "delete")
            var totalPaid = parseFloat(shippingMatch.payment.paid) - parseFloat(shippingMatch.payment.phases.amount);

        if (parseFloat(totalPaid).toFixed(2) >= parseFloat(shipping.cost.total).toFixed(2))
            shipping.payment.status = static.terbayar;
        else if (parseFloat(totalPaid).toFixed(2) > 0)
            shipping.payment.status = static.terbayarSebagian;
        else if (parseFloat(totalPaid).toFixed(2) <= 0)
            shipping.payment.status = static.belumTerbayar;

        shipping.audited = false;
        shipping.payment.paid = parseFloat(totalPaid).toFixed(2);
        shipping.save();

        console.log('stat : '+stat);

        if (stat == "update") {
            yield schemas.shippings.update(
                { "_id": data.shippingId, "payment.phases._id": data.phasesId },
                {
                    "$set": {
                        "payment.phases.$.user": user,
                        "payment.phases.$.amount": parseFloat(data.amount).toFixed(2),
                        "payment.phases.$.notes": data.notes,
                        "payment.phases.$.bank": data.bank,
                        "payment.phases.$.transferDate": new Date(data.transferDate)
                    }
                }
            );
        }
        else if (stat == "delete") {
            yield schemas.shippings.update(
                { "_id": data.shippingId },
                { "$pull": { "payment.phases": { "_id": data.phasesId } } }
            );
        }
    });
};

Controller.prototype.priceProcess = function (data) {
    return this.shippingController.save(data, true);
};

Controller.prototype.delete = function (id) {
    var self = this;
    return co(function* () {
        var entity = yield self.get(id);

        if (!entity)
            throw new Error('Data is not found');

        return schemas.audits.remove({ _id: ObjectId(id) });
    });
};

module.exports = new Controller();