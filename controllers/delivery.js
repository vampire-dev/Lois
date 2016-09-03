var mongoose = require('mongoose');
var model = require('../models/shipping');
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
    var parameters = { "regions.destination": objectId(query['region']) };

    var recapParameters = {};

    if (query['spbNumber'])
        parameters['spbNumber'] = query['spbNumber'];

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

Controller.prototype.getAllCancel = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "regions.destination": objectId(query['region']) };
    var recapParameters = {};
    var deliveryParameters = {};

    if (query['spbNumber'])
        parameters['spbNumber'] = query['spbNumber'];

    if (query['regionDest'])
        parameters['regions.destination'] = objectId(query['regionDest']);

    if (query['regionSource'])
        parameters['regions.source'] = objectId(query['regionSource']);

    if (query['destination'])
        parameters['destination'] = objectId(query['destination']);

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    if (query['deliveryDriver'])
        deliveryParameters['items.deliveries.driver'] = objectId(query['deliveryDriver']);

    if (query['deliveryDate'])
        deliveryParameters['items.deliveries.date'] = { "$gte": date.createLower(query['deliveryDate']), "$lte": date.createUpper(query['deliveryDate']) };

    return model.aggregate([
        { "$match": parameters },
        { "$match": { "items": { "$elemMatch": { "deliveries": { "$elemMatch": { "available": { "$gt": 0 } } } } } } },
        { "$sort": { "number": -1 } },
        { "$unwind": "$items" },
        { "$unwind": "$items.deliveries" },
        { "$match": { "items.deliveries.available": { "$gt": 0 } } },
        { "$match": deliveryParameters },
        { "$skip": skip },
        { "$limit": limit }
    ]).exec();
};

Controller.prototype.delivery = function (viewModels, user) {
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

            var delivery = {
                "recapitulation": recapitulation._id,
                "quantity": viewModel.quantity,
                "available": viewModel.quantity,
                "weight": (item.dimensions.weight / item.colli.quantity) * viewModel.quantity,
                "limasColor": viewModel.limasColor,
                "relationColor": viewModel.relationColor,
                "vehicleNumber": viewModel.vehicleNumber,
                "deliveryCode": viewModel.deliveryCode,
                "driver": viewModel.driver,
                "notes": viewModel.notes,
                "date": new Date(),
                "user": user._id
            };

            item.colli.delivered += viewModel.quantity;
            recapitulation.available -= viewModel.quantity;

            if (item.colli.delivered === item.colli.quantity)
                item.status = defaultComponent.terkirim;
            else
                item.status = defaultComponent.terkirimSebagian;

            item.deliveries.push(delivery);
            yield shipping.save();
        });
    });
};

Controller.prototype.cancelDelivery = function (viewModels) {
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

            var delivery = _.find(item.deliveries, function (delivery) {
                return delivery._id.toString() === viewModel.delivery.toString();
            });

            if (!delivery || delivery.available === 0)
                return;

            var recapitulation = _.find(item.recapitulations, function (recapitulation) {
                return recapitulation._id.toString() === delivery.recapitulation.toString();
            });

            if (!recapitulation)
                return;

            if (viewModel.quantity > delivery.available)
                viewModel.quantity = delivery.available;

            item.colli.delivered -= viewModel.quantity;
            recapitulation.available += viewModel.quantity;
            delivery.available -= viewModel.quantity;
            delivery.quantity -= viewModel.quantity;
            delivery.weight = (item.dimensions.weight / item.colli.quantity) * delivery.available;

            if (item.colli.delivered > 0)
                item.status = defaultComponent.terkirimSebagian;
            else if (item.colli.available === 0)
                item.status = defaultComponent.terekap;
            else
                item.status = defaultComponent.terekapSebagian;

            yield shipping.save();
        });
    });
};

module.exports = new Controller();