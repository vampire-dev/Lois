var mongoose = require('mongoose');
var model = require('../models/shipping');
var invoiceModel = require('../models/invoice');
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
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['sender'])
        parameters['sender'] = objectId(query['sender']);

    if (query['destination'])
        parameters['destination'] = objectId(query['destination']);

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    return model.find(parameters).sort({"number": -1}).populate('sender').populate('destination').populate('payment.type').lean().exec();
};

Controller.prototype.getList = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = {};

    if (query['invoiceNumber']) 
        parameters['number'] = new RegExp(query['invoiceNumber'], 'i');

    if (query['fromInvoice'] && query['toInvoice'])
        parameters['date'] = { "$gte": date.createLower(query['fromInvoice']), "$lte": date.createUpper(query['toInvoice']) };

    return invoiceModel.find(parameters)
        .populate('shippings.shipping').sort({ "inc": - 1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
};

Controller.prototype.create = function (viewModels, user) {
    var self = this;
    var currentDate = new Date();

    return co(function* () {
        var latestInvoice = yield invoiceModel.findOne({}).sort({ "inc": -1 }).exec();
        var inc = 1;

        if (latestInvoice)
            inc = latestInvoice.inc + 1;

        var invoice = {
            "number": inc + "/LSAN/KW/" + currentDate.getFullYear(),
            "inc": inc,
            "to": viewModels[0].to,
            "location": viewModels[0].location,
            "type": viewModels[0].type,
            "shippings": []
        };

        yield* _co.coEach(viewModels, function* (viewModel) {
            var shipping = yield model.findOne({ _id: viewModel.shippingId });

            if (!shipping)
                return;

            if (shipping.invoice.all !== null)
                return;

            invoice.shippings.push(viewModel.shippingId);

            invoice.type === 'Semua' ? shipping.invoice.all = invoice.number : invoice.type === 'Klien' ?
                shipping.invoice.client = invoice.number :
                shipping.invoice.partner = invoice.number;

            yield shipping.save();
        });

        return new invoiceModel(invoice).save();
    });
};

module.exports = new Controller();