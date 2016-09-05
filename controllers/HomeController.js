var co = require('co');
var _ = require('lodash');
var mongoose = require('mongoose');
var date = require('../utils/date');
var static = require('../utils/static');
var schemas = require('../models/schemas');
var ObjectId = mongoose.Types.ObjectId;

function Controller() {
    this.schema = schemas.shippings;
};

Controller.prototype.getOverall = function (query) {
    var parameters = { "inputLocation": ObjectId(query['location']) };

    if (query['date'])
        parameters['date'] = { "$gte": date.createLower(query['date']), "$lte": date.createUpper(query['date']) };

    return this.schema.aggregate([
        { "$match": parameters },
        { "$unwind": "$items" },
        {
            "$group": {
                "_id": "_id",
                "colli": { "$sum": "$items.colli.quantity" },
                "weight": { "$sum": "$items.dimensions.weight" },
                "price": { "$sum": "$cost.total" },
                "shippings": { "$sum": 1 }
            }
        }
    ]).exec();
};

Controller.prototype.getDestinations = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": ObjectId(query['location']) };

    if (query['date'])
        parameters['date'] = { "$gte": date.createLower(query['date']), "$lte": date.createUpper(query['date']) };

    return this.schema.aggregate([
        { "$match": parameters },
        { "$unwind": "$items" },
        {
            "$group": {
                "_id": "$destination",
                "colli": { "$sum": "$items.colli.quantity" },
                "weight": { "$sum": "$items.dimensions.weight" },
                "price": { "$sum": "$cost.total" },
                "shippings": { "$sum": 1 }
            }
        },
        { "$lookup": { "from": "locations", "localField": "_id", "foreignField": "_id", "as": "category" } },
        { "$sort": { "category.name": 1 } },
        { "$skip": skip },
        { "$limit": limit }
    ]);
};

Controller.prototype.getSenders = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": ObjectId(query['location']) };

    if (query['date'])
        parameters['date'] = { "$gte": date.createLower(query['date']), "$lte": date.createUpper(query['date']) };

    return this.schema.aggregate([
        { "$match": parameters },
        { "$unwind": "$items" },
        {
            "$group": {
                "_id": "$sender",
                "colli": { "$sum": "$items.colli.quantity" },
                "weight": { "$sum": "$items.dimensions.weight" },
                "price": { "$sum": "$cost.total" },
                "shippings": { "$sum": 1 }
            }
        },
        { "$lookup": { "from": "clients", "localField": "_id", "foreignField": "_id", "as": "category" } },
        { "$sort": { "category.name": 1 } },
        { "$skip": skip },
        { "$limit": limit }
    ]).exec();
};

Controller.prototype.getPaymentTypes = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": ObjectId(query['location']) };

    if (query['date'])
        parameters['date'] = { "$gte": date.createLower(query['date']), "$lte": date.createUpper(query['date']) };

    return this.schema.aggregate([
        { "$match": parameters },
        { "$unwind": "$items" },
        {
            "$group": {
                "_id": "$payment.type",
                "colli": { "$sum": "$items.colli.quantity" },
                "weight": { "$sum": "$items.dimensions.weight" },
                "price": { "$sum": "$cost.total" },
                "shippings": { "$sum": 1 }
            }
        },
        { "$lookup": { "from": "paymentTypes", "localField": "_id", "foreignField": "_id", "as": "category" } },
        { "$sort": { "category.name": 1 } },
        { "$skip": skip },
        { "$limit": limit }
    ]).exec();
};

Controller.prototype.getPaymentStatuses = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": ObjectId(query['location']) };

    if (query['date'])
        parameters['date'] = { "$gte": date.createLower(query['date']), "$lte": date.createUpper(query['date']) };

    return this.schema.aggregate([
        { "$match": parameters },
        { "$unwind": "$items" },
        {
            "$group": {
                "_id": "$payment.status",
                "colli": { "$sum": "$items.colli.quantity" },
                "weight": { "$sum": "$items.dimensions.weight" },
                "price": { "$sum": "$cost.total" },
                "shippings": { "$sum": 1 }
            }
        },
        { "$sort": { "payment.status": 1 } },
        { "$skip": skip },
        { "$limit": limit }
    ]).exec();
};

Controller.prototype.getRegions = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": ObjectId(query['location']) };

    if (query['date'])
        parameters['date'] = { "$gte": date.createLower(query['date']), "$lte": date.createUpper(query['date']) };

    return this.schema.aggregate([
        { "$match": parameters },
        { "$unwind": "$items" },
        {
            "$group": {
                "_id": "$regions.destination",
                "colli": { "$sum": "$items.colli.quantity" },
                "weight": { "$sum": "$items.dimensions.weight" },
                "price": { "$sum": "$cost.total" },
                "shippings": { "$sum": 1 }
            }
        },
        { "$lookup": { "from": "regions", "localField": "_id", "foreignField": "_id", "as": "category" } },
        { "$sort": { "category.name": 1 } },
        { "$skip": skip },
        { "$limit": limit }
    ]).exec();
};

Controller.prototype.getAll = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": ObjectId(query['location']) };

    if (query['date'])
        parameters['date'] = { "$gte": date.createLower(query['date']), "$lte": date.createUpper(query['date']) };

    return this.schema.find(parameters).populate('sender destination payment.type').skip(skip).limit(limit).exec();
};

module.exports = new Controller();