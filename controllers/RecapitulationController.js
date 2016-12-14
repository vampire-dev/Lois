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
    var parameters = { "inputLocation": ObjectId(query['location']) };

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

    return schemas.shippings.aggregate([
        { "$match": parameters },
        { "$match": { "items": { "$elemMatch": { "colli.available": { "$gt": 0 } } } } },
        { "$sort": { "number": -1 } },
        { "$unwind": "$items" },
        { "$match": { "items.colli.available": { "$gt": 0 } } },
        { "$skip": skip },
        { "$limit": limit }
    ]).exec();
};

Controller.prototype.getAllCancel = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": ObjectId(query['location']) };
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

Controller.prototype.recap = function (viewModels, user) {
    var self = this;
    return co(function* () {
        yield* _co.coEach(viewModels, function* (viewModel) {
            viewModel.quantity = _.parseInt(viewModel.quantity);

            if (viewModel.quantity === 0)
                return;

            var checkTrainType = yield schemas.trainTypes.findOne({ _id: ObjectId(viewModel.trainType) }).exec();
            var checkTrainId = checkTrainType.name; //send error while wrong trainType name
            if (!checkTrainType)
                return;

            var checkDriver = yield schemas.drivers.findOne({_id: ObjectId(viewModel.driver) });
            var checkDriverId = checkDriver.name;
            if (!checkDriver)
                return;

            var shipping = yield schemas.shippings.findOne({ _id: ObjectId(viewModel.shipping) });

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
                "createdDate": new Date(),
                "userCreated": user._id,
                "updatedDate": new Date(),
                "userUpdated": user._id
            };

            item.recapitulations.push(recapitulation);

            if (item.status === static.terkirimSebagian)
                item.status = static.terkirimSebagian;
            else if (item.colli.available === 0)
                item.status = static.terekap;
            else
                item.status = static.terekapSebagian;

            yield shipping.save();
        });
    });
};

Controller.prototype.updateRecap = function (viewModels, user) {
    var self = this;
    return co(function* () {
        yield* _co.coEach(viewModels, function* (viewModel) {
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

            recapitulation.limasColor = viewModel.limasColor;
            recapitulation.relationColor = viewModel.relationColor;
            recapitulation.notes = viewModel.notes;

            recapitulation['userUpdated'] = user._id;
            recapitulation['updatedDate'] = new Date();

            if (viewModel.driver)
                recapitulation.driver = viewModel.driver;
            if (viewModel.trainType)
                recapitulation.trainType = viewModel.trainType;
            if (viewModel.vehicleNumber)
                recapitulation.vehicleNumber = viewModel.vehicleNumber;
            if (viewModel.departureDate)
                recapitulation.departureDate = viewModel.departureDate;
            
            yield shipping.save();           
        });
    });
};

Controller.prototype.cancelRecap = function (viewModels, user) {
    var self = this;

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

            item.colli.available += viewModel.quantity;
            recapitulation.available -= viewModel.quantity;
            recapitulation.quantity -= viewModel.quantity;
            recapitulation.weight = (item.dimensions.weight / item.colli.quantity) * recapitulation.available;
            recapitulation['userUpdated'] = user._id;
            recapitulation['updatedDate'] = new Date();

            if (item.colli.available === item.colli.quantity)
                item.status = static.belumTerekap;
            else
                item.status = static.terekapSebagian;

            var notification = new schemas.notifications({
                "event": 'Batal rekap spb ' + shipping.spbNumber + ' untuk barang ' + item.content + ' sebanyak ' + viewModel.quantity + ' koli',
                "date": new Date(),
                "user": user._id
            });

            yield notification.save();
            yield shipping.save();
        });
    });
};

module.exports = new Controller();