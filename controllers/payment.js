var mongoose = require('mongoose');
var model = require('../models/shipping');
var defaultComponent = require('../utils/defaultComponent');
var date = require('../utils/date');
var co = require('co');
var _co = require('co-lodash');
var _ = require('lodash');
var objectId = mongoose.Types.ObjectId;

function Controller() { }

Controller.prototype.getAll = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": objectId(query['location']) };

    if (query['spbNumber'])
        parameters['spbNumber'] = { $regex: new RegExp(query.spbNumber, 'i') };

    if (query['sender'])
        parameters['sender'] = objectId(query['sender']);

    if (query['destination'])
        parameters['destination'] = objectId(query['destination']);

    if (query['paymentType'])
        parameters['payment.type'] = objectId(query['paymentType']);

    if (query['partner'])
        parameters['partner'] = objectId(query['partner']);

    if (query['regionDest'])
        parameters['regions.destination'] = objectId(query['regionDest']);

    if (query['regionSource'])
        parameters['regions.source'] = objectId(query['regionSource']);

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    return model.find(parameters).sort({ "number": -1 }).populate('payment.type').skip(skip).limit(limit).lean().exec();
};

Controller.prototype.pay = function (viewModels, user) {
    var self = this;

    return co(function* () {
        yield* _co.coEach(viewModels, function* (viewModel) {

            var shipping = yield model.findOne({ _id: viewModel.shippingId });

            if (!shipping)
                return;

            if (parseFloat(viewModel.amount) == 0)
                return;

            var previousStatus = shipping.payment.status;
            var totalPaid = shipping.payment.paid + parseFloat(viewModel.amount);

            if (totalPaid >= shipping.cost.total)
                shipping.payment.status = defaultComponent.terbayar;
            else if (totalPaid > 0)
                shipping.payment.status = defaultComponent.terbayarSebagian;
            else if (totalPaid <= 0)
                shipping.payment.status = defaultComponent.belumTerbayar;

            if (previousStatus === defaultComponent.terbayar && (shipping.payment.status !== previousStatus)) {
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
            shipping.payment.type = objectId(viewModel.paymentTypeId);
            shipping.save();
        });
    });
};

Controller.prototype.audit = function (viewModel, notes, user) {
    viewModel.date = new Date();

    var audit = new require('../models/audit')({
        type: 'payment',
        notes: notes,
        date: new Date(),
        data: viewModel,
        user: user._id
    });

    return audit.save();
};

module.exports = new Controller();