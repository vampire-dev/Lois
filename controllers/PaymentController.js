var mongoose = require('mongoose');
var schemas = require('../models/schemas');
var static = require('../utils/static');
var date = require('../utils/date');
var co = require('co');
var _co = require('co-lodash');
var _ = require('lodash');
var ObjectId = mongoose.Types.ObjectId;

function Controller() {
    this.schema = schemas.shippings;
}

Controller.prototype.getAll = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": ObjectId(query['location']) };

    if (query['spbNumber'])
        parameters['spbNumber'] = { $regex: new RegExp(query.spbNumber, 'i') };

    if (query['sender'])
        parameters['sender'] = ObjectId(query['sender']);

    if (query['destination'])
        parameters['destination'] = ObjectId(query['destination']);

    if (query['paymentType'])
        parameters['payment.type'] = ObjectId(query['paymentType']);

    if (query['partner'])
        parameters['partner'] = ObjectId(query['partner']);

    if (query['regionDest'])
        parameters['regions.destination'] = ObjectId(query['regionDest']);

    if (query['regionSource'])
        parameters['regions.source'] = ObjectId(query['regionSource']);

    if (query['invoice'])
        parameters['$or'] = [{ "invoice.all": query['invoice'] }, { "invoice.client": query['invoice'] }, { "invoice.partner": query['invoice'] }];

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    return this.schema.find(parameters).sort({ "number": -1 }).populate('payment.type').skip(skip).limit(limit).lean().exec();
};

Controller.prototype.pay = function (viewModels, user) {
    var self = this;

    return co(function* () {
        yield* _co.coEach(viewModels, function* (viewModel) {

            var shipping = yield self.schema.findOne({ _id: viewModel.shippingId });

            if (!shipping)
                return;

            if (parseFloat(viewModel.amount) == 0)
                return;

            var previousStatus = shipping.payment.status;
            var totalPaid = shipping.payment.paid + parseFloat(viewModel.amount);

            if (totalPaid >= shipping.cost.total)
                shipping.payment.status = static.terbayar;
            else if (totalPaid > 0)
                shipping.payment.status = static.terbayarSebagian;
            else if (totalPaid <= 0)
                shipping.payment.status = static.belumTerbayar;

            if (previousStatus === static.terbayar && (shipping.payment.status !== previousStatus)) {
                shipping.payment.status = previousStatus;
                shipping.audited = true;

                var notes = 'Perubahan status dari ' + previousStatus + ' ke ' + shipping.payment.status + ' dengan perubahan harga ' +
                    viewModel.amount;

                yield shipping.save();
                yield self.audit(viewModel, notes, user);
                return;
            }

            shipping.payment.phases.push({
                transferDate: new Date(viewModel.transferDate),
                date: new Date(),
                bank: viewModel.bank,
                notes: viewModel.notes,
                amount: parseFloat(viewModel.amount)
            });

            shipping.payment.paid = totalPaid;
            shipping.audited = false;
            shipping.payment.type = ObjectId(viewModel.paymentTypeId);
            shipping.save();
        });
    });
};

Controller.prototype.audit = function (viewModel, notes, user) {
    viewModel.date = new Date();

    var audit = new schemas.audits({
        type: 'payment',
        notes: notes,
        date: new Date(),
        data: viewModel,
        user: user._id
    });

    return audit.save();
};

module.exports = new Controller();