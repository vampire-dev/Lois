var mongoose = require('mongoose');
var schemas = require('../models/schemas');
var date = require('../utils/date');
var co = require('co');
var _co = require('co-lodash');
var _ = require('lodash');
var ObjectId = mongoose.Types.ObjectId;

function Controller() {};

Controller.prototype.getAll = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    //modified pekalongan and tegal
    var parameters = { "$or": [{ "regions.destination": ObjectId(query['region']) }, { "$and": [{ "regions.destination": ObjectId("5804f7185b195d4f4e5ad9b7") }, { "regions.source": ObjectId(query['region']) }] }, { "$and": [{ "regions.destination": ObjectId("5804f7235b195d4f4e5ad9b8") }, { "regions.source": ObjectId(query['region']) }] }], "confirmed": false };

    if (query['spbNumber'])
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['receiverName'])
        parameters['receiver.name'] = new RegExp(query['receiverName'], 'i');

    if (query['destination'])
        parameters['destination'] = ObjectId(query['destination']);

    if (query['regionSource'])
        parameters['regions.source'] = ObjectId(query['regionSource']);

    if (query['driver'])
        parameters['items.deliveries.driver'] = ObjectId(query['driver']);

    if (query['deliveryCode'])
        parameters['items.deliveries.deliveryCode'] = query['deliveryCode'];

    if (query['paymentType'])
        parameters['payment.type'] = ObjectId(query['paymentType']);

    if (query['deliveryDate'])
        parameters['items.deliveries.date'] = { "$gte": date.createLower(query['deliveryDate']), "$lte": date.createUpper(query['deliveryDate']) };

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    return schemas.shippings.aggregate([
        { "$match": parameters },
        { "$match": { "items": { "$elemMatch": { "status": "Terkirim" } } } },
        { "$sort": { "number": -1 } },
        { "$unwind": "$items" },
        { "$match": { "items.status": "Terkirim" } },
        { "$group": { "_id": "$_id", "colli": { "$sum": "$items.colli.quantity" }, "shipping": { "$push": "$$ROOT" } } },
        { "$skip": skip },
        { "$limit": limit }
    ]).exec();
};

Controller.prototype.getAllConfirm = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": ObjectId(query['location']), "confirmed": false, "returned": true };

    if (query['spbNumber'])
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['destination'])
        parameters['destination'] = ObjectId(query['destination']);

    if (query['regionDest'])
        parameters['regions.destination'] = ObjectId(query['regionDest']);

    if (query['returnDate'])
        parameters['returnInfo.modified.date'] = { "$gte": date.createLower(query['returnDate']), "$lte": date.createUpper(query['returnDate']) };

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    return schemas.shippings.find(parameters).sort({ "number": -1 }).skip(skip).limit(limit).lean().exec();
};

Controller.prototype.return = function (viewModels, user) {
    var self = this;

    return co(function* () {
        yield* _co.coEach(viewModels, function* (viewModel) {
            var shipping = yield schemas.shippings.findOne({ _id: ObjectId(viewModel._id) });

            if (!shipping)
                return;

            shipping.returnInfo = viewModel.returnInfo;
            shipping.returnInfo.modified.date = new Date();
            shipping.returnInfo.modified.user = user._id;

            if (!shipping.returnInfo.created.user) {
                shipping.returnInfo.created.date = new Date();
                shipping.returnInfo.created.user = user._id;
            }

            if (!viewModel.returnInfo.accepted) {
                var notification = new schemas.notifications({
                    "event": 'Retur spb ' + shipping.spbNumber + ' ' + (viewModel.returnInfo.accepted ? 'diterima' : 'ditolak'),
                    "filePath": shipping.returnInfo.filePath,
                    "date": new Date(),
                    "user": user._id
                });

                yield notification.save();
            }

            shipping.returned = true;
            yield shipping.save();
        });
    });
};

Controller.prototype.confirm = function (viewModels) {
    return co(function* () {
        yield* _co.coEach(viewModels, function* (viewModel) {
            var shipping = yield schemas.shippings.findOne({ _id: ObjectId(viewModel._id) });

            if (!shipping)
                return;

            shipping.confirmed = true;

            yield shipping.save();
        });
    });
};

module.exports = new Controller();