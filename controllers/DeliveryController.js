var mongoose = require('mongoose');
var schemas = require('../models/schemas');
var date = require('../utils/date');
var static = require('../utils/static');
var co = require('co');
var _co = require('co-lodash');
var _ = require('lodash');
var ObjectId = mongoose.Types.ObjectId;

function Controller() {};

Controller.prototype.getAll = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    //modified pekalongan and tegal
    var parameters = { "$or": [{ "regions.destination": ObjectId(query['region']) }, { "$and": [{ "regions.destination": ObjectId("5804f7185b195d4f4e5ad9b7") }, { "regions.source": ObjectId(query['region']) }] }, { "$and": [{ "regions.destination": ObjectId("5804f7235b195d4f4e5ad9b8") }, { "regions.source": ObjectId(query['region']) }] }] };

    var recapParameters = {};

    if (query['spbNumber'])
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['regionDest'])
        parameters['regions.destination'] = ObjectId(query['regionDest']);

    if (query['regionSource'])
        parameters['regions.source'] = ObjectId(query['regionSource']);

    if (query['destination'])
        parameters['destination'] = ObjectId(query['destination']);

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    if (query['driver'])
        recapParameters['items.recapitulations.driver'] = ObjectId(query['driver']);

    if (query['recapDate'])
        recapParameters['items.recapitulations.date'] = { "$gte": date.createLower(query['recapDate']), "$lte": date.createUpper(query['recapDate']) };

    return schemas.shippings.aggregate([
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
    var parameters = { "regions.destination": ObjectId(query['region']), "returned": false };
    var recapParameters = {};
    var deliveryParameters = {};

    if (query['spbNumber'])
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['regionDest'])
        parameters['regions.destination'] = ObjectId(query['regionDest']);

    if (query['regionSource'])
        parameters['regions.source'] = ObjectId(query['regionSource']);

    if (query['destination'])
        parameters['destination'] = ObjectId(query['destination']);

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    if (query['deliveryDriver'])
        deliveryParameters['items.deliveries.driver'] = ObjectId(query['deliveryDriver']);

    if (query['deliveryDate'])
        deliveryParameters['items.deliveries.date'] = { "$gte": date.createLower(query['deliveryDate']), "$lte": date.createUpper(query['deliveryDate']) };

    return schemas.shippings.aggregate([
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
    return co(function* () {
        yield* _co.coEach(viewModels, function* (viewModel) {
            viewModel.quantity = _.parseInt(viewModel.quantity);

            if (viewModel.quantity === 0)
                return;

            var shipping = yield schemas.shippings.findOne({ _id: ObjectId(viewModel.shipping) });

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
                "createdDate": new Date(),
                "userCreated": user._id,
                "updatedDate": new Date(),
                "userUpdated": user._id
            };

            item.colli.delivered += viewModel.quantity;
            recapitulation.available -= viewModel.quantity;

            if (item.colli.delivered === item.colli.quantity)
                item.status = static.terkirim;
            else
                item.status = static.terkirimSebagian;

            item.deliveries.push(delivery);
            yield shipping.save();
        });
    });
};

Controller.prototype.cancelDelivery = function (viewModels, user) {
    return co(function* () {
        yield* _co.coEach(viewModels, function* (viewModel) {
            viewModel.quantity = _.parseInt(viewModel.quantity);

            if (viewModel.quantity === 0)
                return;

            var shipping = yield schemas.shippings.findOne({ _id: ObjectId(viewModel.shipping) });

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
            delivery['updatedUser'] = user._id;
            delivery['updatedDate'] = new Date();

            if (item.colli.delivered > 0)
                item.status = static.terkirimSebagian;
            else if (item.colli.available === 0)
                item.status = static.terekap;
            else
                item.status = static.terekapSebagian;

            var notification = new schemas.notifications({
                "event": 'Batal kirim spb ' + shipping.spbNumber + ' untuk barang ' + item.content + ' sebanyak ' + viewModel.quantity + ' koli',
                "date": new Date(),
                "user": user._id
            });
           
            yield notification.save();
            yield shipping.save();
        });
    });
};

module.exports = new Controller();