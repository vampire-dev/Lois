var mongoose = require('mongoose');
var schemas = require('../models/schemas');
var static = require('../utils/static');
var date = require('../utils/date');
var co = require('co');
var _co = require('co-lodash');
var _ = require('lodash');
var ObjectId = mongoose.Types.ObjectId;

function Controller() {};

Controller.prototype.getAll = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": ObjectId(query['location']), "$or": [{ "payment.type": ObjectId(static.paid) }, { "confirmed": true }] };

    if (query['spbNumber'])
        parameters['spbNumber'] = { $regex: new RegExp(query.spbNumber, 'i') };

    if (query['sender'])
        parameters['sender'] = ObjectId(query['sender']);

    if (query['destination'])
        parameters['destination'] = ObjectId(query['destination']);

    if (query['paymentType'])
        parameters['payment.type'] = ObjectId(query['paymentType']);

    if (!query['paymentType'] && query['paymentTypeNull'] && query['paymentTypeNull'] == "kosong") {
        parameters['$and'] = [{ "payment.type": { "$ne": ObjectId("57c46a80398059b414b3784f") } }, { "payment.type": { "$ne": ObjectId("57c46a81398059b414b37856") } }, { "payment.type": { "$ne": ObjectId("57c46a81398059b414b3785a") } }, { "payment.type": { "$ne": ObjectId("57c46a82398059b414b3785f") } }, { "payment.type": { "$ne": ObjectId("57c46a82398059b414b37861") } }, { "payment.type": { "$ne": ObjectId("57c46a82398059b414b37864") } }];
        parameters['$or'] = [{ "confirmed": true }, { "confirmed": false}];
    }
    if (query['partner'])
        parameters['partner'] = ObjectId(query['partner']);

    if (query['regionDest'])
        parameters['regions.destination'] = ObjectId(query['regionDest']);

    if (query['regionSource'])
        parameters['regions.source'] = ObjectId(query['regionSource']);

    if (query['invoice'])
        parameters['$or'] = [{ "invoice.all": query['invoice'] }, { "invoice.client": query['invoice'] }, { "invoice.partner": query['invoice'] }];

    if (query['paymentStatus'])
        parameters['payment.status'] = query['paymentStatus'];

    if (query['fromTransferDate'])
        parameters['payment.phases.transferDate'] = { "$gte": date.createLower(query['fromTransferDate']), "$lte": date.createUpper(query['fromTransferDate']) };

    if (query['fromInputDate'])
        parameters['payment.phases.date'] = { "$gte": date.createLower(query['fromInputDate']), "$lte": date.createUpper(query['fromInputDate']) };

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    return schemas.shippings.find(parameters).sort({ "number": -1 }).populate('payment.type sender').skip(skip).limit(limit).lean().exec();
};

Controller.prototype.pay = function (viewModels, user) {
    var self = this;

    return co(function* () {
        yield* _co.coEach(viewModels, function* (viewModel) {
            
            var shipping = yield schemas.shippings.findOne({ _id: viewModel.shippingId });

            if (!shipping)
                return;
            
            if (parseFloat(viewModel.amount) != 0) {

                var previousStatus = shipping.payment.status;
                var totalPaid = shipping.payment.paid + parseFloat(viewModel.amount);

                if (parseFloat(totalPaid).toFixed(2) >= parseFloat(shipping.cost.total).toFixed(2))
                    shipping.payment.status = static.terbayar;
                else if (parseFloat(totalPaid).toFixed(2) > 0)
                    shipping.payment.status = static.terbayarSebagian;
                else if (parseFloat(totalPaid).toFixed(2) <= 0)
                    shipping.payment.status = static.belumTerbayar;

                

                shipping.payment.phases.push({
                    transferDate: new Date(viewModel.transferDate),
                    date: new Date(),
                    bank: viewModel.bank,
                    notes: viewModel.notes,
                    amount: parseFloat(viewModel.amount).toFixed(2),
                    user: user._id
                });

                shipping.payment.paid = parseFloat(totalPaid).toFixed(2);
                shipping.audited = false;
            }
            shipping.payment.type = ObjectId(viewModel.paymentTypeId);
            shipping.save();
        });
    });
};

Controller.prototype.audit = function (viewModel, notes, user, stat) {
    viewModel.date = new Date();

    var audit = new schemas.audits({
        type: 'payment',
        notes: notes,
        date: new Date(),
        data: viewModel,
        user: user._id,
        stat: stat
    });

    return audit.save();
};

Controller.prototype.updatePay = function (viewModel, user) {
    var self = this;

    return co(function* () {       
        var match = yield schemas.shippings.aggregate([
            {
                "$match": {
                    "_id": ObjectId(viewModel.shippingId),
                    "payment.phases._id": ObjectId(viewModel.phasesId)
                }
            },
            { "$unwind": "$payment.phases" },
            {
                "$match": {
                    "payment.phases._id": ObjectId(viewModel.phasesId)
                }
            }
        ]);
        var shippingMatch = match[0];

        var shipping = yield schemas.shippings.findOne({ _id: viewModel.shippingId });

        if ((!shipping) || (!shippingMatch))
            return;

        var previousStatus = shipping.payment.status;
        var totalPaid = parseFloat(shippingMatch.payment.paid) - parseFloat(shippingMatch.payment.phases.amount) + parseFloat(viewModel.amount);

        if (parseFloat(totalPaid).toFixed(2) >= parseFloat(shipping.cost.total).toFixed(2))
            shipping.payment.status = static.terbayar;
        else if (parseFloat(totalPaid).toFixed(2) > 0)
            shipping.payment.status = static.terbayarSebagian;
        else if (parseFloat(totalPaid).toFixed(2) <= 0)
            shipping.payment.status = static.belumTerbayar;
        
        if (previousStatus === static.terbayar && (shipping.payment.status !== previousStatus)) {
           
            var notes = 'Perubahan status dari ' + previousStatus + ' ke ' + shipping.payment.status + ' dengan perubahan harga ' +
                viewModel.amount + ' dari ' + shipping.payment.paid;

            shipping.payment.status = previousStatus;
            shipping.audited = true;
            var stat = 'update';

            yield shipping.save();
            yield self.audit(viewModel, notes, user, stat);
            return;
        }
        
        shipping.payment.paid = parseFloat(totalPaid).toFixed(2);
        shipping.save();

        yield schemas.shippings.update(
            { "_id": viewModel.shippingId, "payment.phases._id": viewModel.phasesId },
            {
                "$set": {
                    "payment.phases.$.user": user._id,
                    "payment.phases.$.amount": parseFloat(viewModel.amount).toFixed(2),
                    "payment.phases.$.notes": viewModel.notes,
                    "payment.phases.$.bank": viewModel.bank,
                    "payment.phases.$.transferDate": new Date(viewModel.transferDate)
                }
            }
        );

    });
};

Controller.prototype.deletePay = function (viewModel, user) {
    var self = this;

    return co(function* () { 
        var match = yield schemas.shippings.aggregate([
            {
                "$match": {
                    "_id": ObjectId(viewModel.shippingId),
                    "payment.phases._id": ObjectId(viewModel.phasesId)
                }
            },
            { "$unwind": "$payment.phases" },
            {
                "$match": {
                    "payment.phases._id": ObjectId(viewModel.phasesId)
                }
            }
        ]);
        var shippingMatch = match[0];

        var shipping = yield schemas.shippings.findOne({ _id: viewModel.shippingId });

        if ((!shipping) || (!shippingMatch))
            return;

        var previousStatus = shipping.payment.status;
        var totalPaid = parseFloat(shippingMatch.payment.paid) - parseFloat(shippingMatch.payment.phases.amount);

        if (parseFloat(totalPaid).toFixed(2) >= parseFloat(shipping.cost.total).toFixed(2))
            shipping.payment.status = static.terbayar;
        else if (parseFloat(totalPaid).toFixed(2) > 0)
            shipping.payment.status = static.terbayarSebagian;
        else if (parseFloat(totalPaid).toFixed(2) <= 0)
            shipping.payment.status = static.belumTerbayar;

        if (previousStatus === static.terbayar && (shipping.payment.status !== previousStatus)) {
            shipping.audited = true;

            var notes = 'Perubahan status dari ' + previousStatus + ' ke ' + shipping.payment.status + ' dengan penghapusan harga ' +
                viewModel.amount;

            shipping.payment.status = previousStatus;
            var stat = 'delete';

            yield shipping.save();
            yield self.audit(viewModel, notes, user, stat);
            return;
        }

        shipping.payment.paid = parseFloat(totalPaid).toFixed(2);
        shipping.save();

        yield schemas.shippings.update(
            { "_id": viewModel.shippingId },            
                {"$pull": { "payment.phases": { "_id": viewModel.phasesId } } }     
        );

    });
};

module.exports = new Controller();