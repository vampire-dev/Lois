var mongoose = require('mongoose');
var model = require('../models/shipping');
var notificationModel = require('../models/notification');
var date = require('../utils/date');
var co = require('co');
var _co = require('co-lodash');
var _ = require('lodash');
var objectId = mongoose.Types.ObjectId;

function Controller() { }

Controller.prototype.getAll = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "regions.destination": objectId(query['region']) , "confirmed": false};

    if (query['spbNumber'])
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['receiverName'])
        parameters['receiver.name'] = new RegExp(query['receiverName'], 'i');

    if (query['destination'])
        parameters['destination'] = objectId(query['destination']);

    if (query['regionSource'])
        parameters['regions.source'] = objectId(query['regionSource']);

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    return model.aggregate([
        { "$match": parameters },
        { "$match": { "items": { "$elemMatch": { "status": "Terkirim" } } } },
        { "$sort": {"number": -1} },
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
    var parameters = { "inputLocation": objectId(query['location']), "confirmed": false, "returned": true };

    if (query['spbNumber'])
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['destination'])
        parameters['destination'] = objectId(query['destination']);

    if (query['regionDest'])
        parameters['regions.destination'] = objectId(query['regionDest']);

    if (query['returnDate'])
        parameters['returnInfo.modified.date'] = { "$gte": date.createLower(query['returnDate']), "$lte": date.createUpper(query['returnDate']) };

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    return model.find(parameters).sort({ "number": -1 }).skip(skip).limit(limit).lean().exec();
};

Controller.prototype.return = function (viewModels, user) {
    var self = this;

    return co(function* () {
        yield* _co.coEach(viewModels, function* (viewModel) {
            var shipping = yield model.findOne({ _id: objectId(viewModel._id) });

            if (!shipping)
                return;

            shipping.returnInfo = viewModel.returnInfo;
            shipping.returnInfo.modified.date = new Date();
            shipping.returnInfo.modified.user = user._id;
           
            if (!shipping.returnInfo.created.date) {
                shipping.returnInfo.created.date = new Date();
                shipping.returnInfo.created.user = user._id;
                shipping.returned = true;

                var notification = new notificationModel();

                notification.event = 'Retur spb ' + shipping.spbNumber + ' ' + (viewModel.returnInfo.accepted ? 'diterima' : 'ditolak');
                notification.filePath = shipping.returnInfo.filePath;
                notification.date = new Date();
                notification.user = user._id;

                yield notification.save();
            }
              
            yield shipping.save();
        });
    });
};

Controller.prototype.confirm = function (viewModels) {
    var self = this;

    return co(function* () {
        yield* _co.coEach(viewModels, function* (viewModel) {
            var shipping = yield model.findOne({ _id: objectId(viewModel._id) });

            if (!shipping)
                return;

            shipping.confirmed = true;

            yield shipping.save();
        });
    });
};

module.exports = new Controller();