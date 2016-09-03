var mongoose = require('mongoose');
var model = require('../models/shipping');
var notificationModel = require('../models/notification');
var date = require('../utils/date');
var defaultComponent = require('../utils/defaultComponent')
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

    if (query['regionDest'])
        parameters['regions.destination'] = objectId(query['regionDest']);

    if (query['regionSource'])
        parameters['regions.source'] = objectId(query['regionSource']);

    if (query['destination'])
        parameters['destination'] = objectId(query['destination']);

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    return model.aggregate([
        { "$match": parameters },
        { "$match": { "items": { "$elemMatch": { "colli.available": { "$gt": 0 } } } } },
        { "$sort": { "number": -1 } },
        { "$unwind": "$items" },
        { "$skip": skip },
        { "$limit": limit }
    ]).exec();
};

Controller.prototype.getAllCancel = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;

    var parameters = { "inputLocation": objectId(query['location']) };
    var recapParameters = {};

    if (query['spbNumber'])
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['regionDest'])
        parameters['regions.destination'] = objectId(query['regionDest']);

    if (query['regionSource'])
        parameters['regions.source'] = objectId(query['regionSource']);

    if (query['destination'])
        parameters['destination'] = objectId(query['destination']);

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    if (query['driver'])
        recapParameters['items.recapitulations.driver'] = objectId(query['driver']);

    if (query['recapDate'])
        recapParameters['items.recapitulations.date'] = { "$gte": date.createLower(query['recapDate']), "$lte": date.createUpper(query['recapDate']) };

    return model.aggregate([
        { "$match": parameters },
        { "$match": { "items": { "$elemMatch": { "recapitulations": { "$elemMatch": { "available": { "$gt": 0 } } } } } } },
        { "$sort": { "number": -1 } },
        { "$unwind": "$items" },
        { "$unwind": "$items.recapitulations" },
        { "$match": { "items.recapitulations.available": { "$gt": 0 } } },
        { "$match": recapParameters },
        { "$skip": skip },
        { "$limit": limit }
    ]).exec();
};

Controller.prototype.recap = function (viewModels, user) {
    var self = this;
    return co(function* () {
        yield* _co.coEach(viewModels, function* (viewModel) {
            viewModel.quantity = _.parseInt(viewModel.quantity);

            if (viewModel.quantity === 0)
                return;

            var shipping = yield model.findOne({ _id: objectId(viewModel.shipping) });

            if (!shipping)
                return;

            var item = _.find(shipping.items, function (item) {
                return item._id.toString() === viewModel.item.toString();
            });

            if (!item || item.colli.available === 0)
                return;

            if (viewModel.quantity > item.colli.available)
                viewModel.quantity = item.colli.available;

            item.colli.available -= viewModel.quantity;

            var recapitulation = {
                "quantity": viewModel.quantity,
                "available": viewModel.quantity,
                "weight": (item.dimensions.weight / item.colli.quantity) * viewModel.quantity,
                "limasColor": viewModel.limasColor,
                "relationColor": viewModel.relationColor,
                "vehicleNumber": viewModel.vehicleNumber,
                "driver": viewModel.driver,
                "notes": viewModel.notes,
                "trainType": viewModel.trainType,
                "departureDate": new Date(viewModel.departureDate),
                "date": new Date(),
                "user": user._id
            };

            item.recapitulations.push(recapitulation);

            if (item.status === defaultComponent.terkirimSebagian)
                item.status = defaultComponent.terkirimSebagian;
            else if (item.colli.available === 0)
                item.status = defaultComponent.terekap;
            else
                item.status = defaultComponent.terekapSebagian;

            var notification = new notificationModel();
            notification.event = 'Batal rekap spb ' + shipping.spbNumber + ' untuk barang ' + item.content + ' sebanyak ' +
                viewModel.quantity + ' koli';

            notification.date = new Date();
            notification.user = user._id;

            yield notification.save();
            yield shipping.save();
        });
    });
};

Controller.prototype.cancelRecap = function (viewModels) {
    var self = this;

    return co(function* () {
        yield* _co.coEach(viewModels, function* (viewModel) {
            viewModel.quantity = _.parseInt(viewModel.quantity);

            if (viewModel.quantity === 0)
                return;

            var shipping = yield model.findOne({ _id: objectId(viewModel.shipping) });

            if (!shipping)
                return;

            var item = _.find(shipping.items, function (item) {
                return item._id.toString() === viewModel.item.toString();
            });

            if (!item)
                return;

            var recapitulation = _.find(item.recapitulations, function (recapitulation) {
                return recapitulation._id.toString() === viewModel.recapitulation.toString();
            });

            if (!recapitulation || recapitulation.available === 0)
                return;

            if (viewModel.quantity > recapitulation.available)
                viewModel.quantity = recapitulation.available;

            item.colli.available += viewModel.quantity;
            recapitulation.available -= viewModel.quantity;
            recapitulation.quantity -= viewModel.quantity;
            recapitulation.weight = (item.dimensions.weight / item.colli.quantity) * recapitulation.available;

            if (item.colli.available === item.colli.quantity)
                item.status = defaultComponent.belumTerekap;
            else
                item.status = defaultComponent.terekapSebagian;

            yield shipping.save();
        });
    });
};

module.exports = new Controller();