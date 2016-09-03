var mongoose = require('mongoose');
var model = require('../models/shipping');
var date = require('../utils/date');
var co = require('co');
var _co = require('co-lodash');
var _ = require('lodash');
var objectId = mongoose.Types.ObjectId;

function Controller() {
    this.driverModel = require('../models/driver');
    this.paymentTypeModel = require('../models/paymentType');
    this.userModel = require('../models/user');
    this.trainTypeModel = require('../models/trainType');
}

Controller.prototype.getRecapitulations = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": objectId(query['location']) };
    var recapParameters = { "items.recapitulations.quantity": {"$gt": 0}};

    if (query['spbNumber'])
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['destination'])
        parameters['destination'] = objectId(query['destination']);

    if (query['regionSource'])
        parameters['regions.source'] = objectId(query['regionSource']);

    if (query['regionDest'])
        parameters['regions.destination'] = objectId(query['regionDest']);

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    if (query['trainType'])
        recapParameters['items.recapitulations.trainType'] = objectId(query['trainType']);

    if (query['vehicleNumber'])
        recapParameters['items.recapitulations.vehicleNumber'] = query['vehicleNumber'];

    if (query['driver'])
        recapParameters['items.recapitulations.driver'] = objectId(query['driver'])

    if (query['recapDate']) 
        recapParameters['items.recapitulations.date'] = { "$gte": date.createLower(query['recapDate']), "$lte": date.createUpper(query['recapDate']) };

    return model.aggregate([
        { "$match": parameters },
        { "$sort": { "number": -1 } },
        { "$unwind": "$items" },
        { "$unwind": "$items.recapitulations" },
        { "$match": recapParameters },
        { "$lookup": { "from": "clients", "localField": "sender", "foreignField": "_id", "as": "sender" } },
        { "$lookup": { "from": "trainTypes", "localField": "items.recapitulations.trainType", "foreignField": "_id", "as": "trainType" } },
        { "$lookup": { "from": "drivers", "localField": "items.recapitulations.driver", "foreignField": "_id", "as": "driver" } },
        { "$skip": skip },
        { "$limit": limit }
    ]).exec();
};

Controller.prototype.getRecapitulationsReport = function (viewModels, user) {
    var self = this;
   
    var result = {
        "title": "LAPORAN REKAP",
        "template_file": "laprekap.xlsx",
        "location": user.location.name,
        "train_type": "Kereta",
        "date": new Date(),
        "recap_driver": null,
        "recap_car": null,
        "report_data": []
    };

    return co(function* () {
        var totalColliQuantity = 0;
        var totalRecappedColli = 0;
        var totalWeight = 0;
        var totalPrice = 0;

        //var trainType = yield self.trainTypeModel.findOne({ "_id": objectId(viewModels[0].items.recapitulations.trainType) }).exec();
        //result['train_type'] = trainType.name;

        yield* _co.coEach(viewModels, function* (viewModel) {
            var driver = yield self.driverModel.findOne({ _id: objectId(viewModel.items.recapitulations.driver) });
            var user = yield self.userModel.findOne({ _id: objectId(viewModel.items.recapitulations.user) });
            var paymentType = yield self.paymentTypeModel.findOne({ _id: objectId(viewModel.payment.type) });

            if (driver)
                result.recap_driver = driver.name;

            result.recap_car = viewModel.items.recapitulations.vehicleNumber;

            result.report_data.push({
                "spb_no": viewModel.spbNumber,
                "sender": viewModel.sender[0].name,
                "receiver": viewModel.receiver.name,
                "content": viewModel.items.content,
                "total_coli": viewModel.items.recapitulations.quantity,
                "coli": viewModel.items.colli.quantity,
                "weight": viewModel.items.dimensions.weight,
                "price": viewModel.items.cost.shipping,
                "payment_method": paymentType.name,
                "recap_limas_color": viewModel.items.recapitulations.limasColor,
                "recap_relation_color": viewModel.items.recapitulations.relationColor,
                "transaction_date": viewModel.date,
                "destination_city": viewModel.destination.name
            });

            totalColliQuantity += _.parseInt(viewModel.items.colli.quantity);
            totalRecappedColli += _.parseInt(viewModel.items.recapitulations.quantity);
            totalWeight += parseFloat(viewModel.items.dimensions.weight);
            totalPrice += parseFloat(viewModel.items.cost.shipping);
        });

        result['sum_total_colli'] = totalColliQuantity;
        result['sum_colli'] = totalRecappedColli;
        result['sum_weight'] = totalWeight;
        result['sum_price'] = totalPrice;
        return result;
    });
};

Controller.prototype.getDeliveries = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "regions.destination": objectId(query['region']) };
    var deliveryParameters = { "items.deliveries.quantity": { "$gt": 0 } };

    if (query['spbNumber'])
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['destination'])
        parameters['destination'] = objectId(query['destination']);

    if (query['regionSource'])
        parameters['regions.source'] = objectId(query['regionSource']);

    if (query['regionDest'])
        parameters['regions.destination'] = objectId(query['regionDest']);

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    if (query['deliveryCode'])
        deliveryParameters['items.deliveries.deliveryCode'] = new RegExp(query['deliveryCode'], 'i');

    if (query['vehicleNumber'])
        deliveryParameters['items.deliveries.vehicleNumber'] = query['vehicleNumber'];

    if (query['driver'])
        deliveryParameters['items.deliveries.driver'] = objectId(query['driver'])

    if (query['deliveryDate'])
        deliveryParameters['items.deliveries.date'] = { "$gte": date.createLower(query['deliveryDate']), "$lte": date.createUpper(query['deliveryDate']) };

    return model.aggregate([
        { "$match": parameters },
        { "$sort": { "number": -1 } },
        { "$unwind": "$items" },
        { "$unwind": "$items.deliveries" },
        { "$match": deliveryParameters },
        { "$lookup": { "from": "clients", "localField": "sender", "foreignField": "_id", "as": "sender" } },
        { "$lookup": { "from": "paymentTypes", "localField": "payment.type", "foreignField": "_id", "as": "paymentType" } },
        { "$lookup": { "from": "drivers", "localField": "items.deliveries.driver", "foreignField": "_id", "as": "driver" } },
        { "$skip": skip },
        { "$limit": limit }
    ]).exec();
};

Controller.prototype.getDeliveriesReport = function (viewModels, user) {
    var self = this;

    var result = {
        "title": "LAPORAN PENGANTAR BARANG",
        "template_file": "lapdelivery.xlsx",
        "location": user.location.name,
        "user": user.name,
        "date": new Date(),
        "delivery_driver": null,
        "delivery_car": null,
        "report_data": []
    };

    return co(function* () {
        yield* _co.coEach(viewModels, function* (viewModel) {
            var driver = yield self.driverModel.findOne({ _id: objectId(viewModel.items.deliveries.driver) });

            if (driver)
                result.delivery_driver = driver.name;

            result.delivery_car = viewModel.items.deliveries.vehicleNumber;
            result.report_data.push({
                "spb_no": viewModel.spbNumber,
                "sender": viewModel.sender[0].name,
                "receiver": viewModel.receiver.name,
                "receiver_address": viewModel.receiver.address,
                "receiver_contact": viewModel.receiver.contact,
                "content": viewModel.items.content,
                "total_coli": viewModel.items.colli.quantity,
                "coli": viewModel.items.deliveries.quantity,
                "price": viewModel.items.cost.shipping,
                "payment_method": viewModel.paymentType[0].name
            });
        });

        return result;
    });
};

module.exports = new Controller();