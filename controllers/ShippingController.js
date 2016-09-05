﻿var co = require('co');
var _co = require('co-lodash');
var _ = require('lodash');
var mongoose = require('mongoose');
var date = require('../utils/date');
var static = require('../utils/static');
var schemas = require('../models/schemas');
var ObjectId = mongoose.Types.ObjectId;

function Controller() {
    this.schema = schemas.shippings;
    this.clientSchema = schemas.clients;
    this.tariffSchema = schemas.tariffs;
    this.locationSchema = schemas.locations;
    this.regionSchema = schemas.regions;
};

Controller.prototype.get = function (id) {
    return this.schema.findOne({ "_id": ObjectId(id) }).populate('sender destination payment.type payment.location partner items.itemType items.packingType')
        .lean().exec();
};

Controller.prototype.getAll = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": ObjectId(query['location']) };

    if (query['spbNumber'])
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['receiverName'])
        parameters['receiver.name'] = new RegExp(query['receiverName'], 'i');

    if (query['paymentStatus'])
        parameters['payment.status'] = query['paymentStatus'];

    if (query['destination'])
        parameters['destination'] = ObjectId(query['destination']);

    if (query['sender'])
        parameters['sender'] = ObjectId(query['sender']);

    if (query['paymentType'])
        parameters['payment.type'] = ObjectId(query['paymentType']);

    if (query['partner'])
        parameters['partner'] = ObjectId(query['partner']);

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    var entities = this.schema.find(parameters);

    if (query['limit'] && (query['skip'] || query['skip'] == 0))
        entities.skip(query['skip']).limit(query['limit']);

    return entities.lean().sort({ "number": -1 })
        .populate('sender destination payment.type payment.location partner items.itemType items.packingType').lean().exec();
};

Controller.prototype.add = function (user) {
    var self = this;

    if (!user.location)
        throw new Error('Location is not defined');

    if (!user.location.prefix)
        throw new Error('Prefix is not defined for location ' + user.location.name);

    return co(function* () {
        var lastShipping = yield self.schema.findOne({}).sort({ "number": -1 }).exec();
        var lastLocShipping = yield self.schema.findOne({ "inputLocation": ObjectId(user.location._id) }).sort({ "number": -1 }).exec();
        var number = lastShipping ? lastShipping.number + 1 : 1;
        var spbNumber = lastLocShipping ? (parseInt(lastLocShipping.spbNumber.split('-')[0]) + 1) + '-' + user.location.prefix
            : '1-' + user.location.prefix;

        var shipping = {
            "number": number,
            "spbNumber": spbNumber,
            "sender": static.client,
            "destination": static.location,
            "regions": { "source": static.region, "destination": static.region },
            "payment": { "type": static.paymentType, "location": static.location },
            "partner": static.partner,
            "inputLocation": user.location._id,
            "created": { "user": user._id, "date": new Date() },
            "modified": { "user": user._id }
        };

        return new self.schema(shipping).save();
    });
};

Controller.prototype.calculateCost = function (item, tariff, quota, option) {
    var self = this;
    var price = 0;
    var minimum = 0;

    if (tariff) {
        price = tariff.prices[option];
        minimum = tariff.minimum;
    }

    var dimensions = {
        length: _.parseInt(item.dimensions.length),
        width: _.parseInt(item.dimensions.width),
        height: _.parseInt(item.dimensions.height),
        weight: _.parseInt(item.dimensions.weight)
    };

    var cost = {
        colli: parseFloat(item.cost.colli),
        additional: parseFloat(item.cost.additional),
        discount: parseFloat(item.cost.discount)
    };

    var colli = _.parseInt(item.colli.quantity);
    var colliCost = colli * cost.colli;
    var limit = 0;
    var itemType = item.itemType._id ? item.itemType._id : item.itemType;

    switch (itemType.toString()) {
        case static.weight:
            limit = dimensions.weight * price;

            if (limit > minimum)
                return (price * dimensions.weight) - cost.discount + colliCost + cost.additional;

            return minimum - cost.discount + colliCost + cost.additional;

        case static.volume:
            limit = dimensions.length * dimensions.width * (dimensions.height / 4000) * price * colli;

            if (limit > minimum)
                return limit - cost.discount + cost.additional;

            return minimum - cost.discount + colliCost + cost.additional;
        case static.colli:
            return colliCost + cost.additional - cost.discount;
        case static.minOfMultiple:
            return (colli - 1) * colliCost + cost.additional - cost.discount + minimum;
        case static.motor:
            return cost.additional - cost.discount;
        case static.jakartaMinWeight:
            limit = (dimensions.weight * price) + cost.additional;
            if (limit > minimum)
                return (price * dimensions.weight) - cost.discount + colliCost + cost.additional;

            return minimum - cost.discount + colliCost + cost.additional;
        case static.surabayaMinWeight:
            if (dimensions.weight > quota)
                return minimum * ((dimensions.weight - quota) * price) - cost.discount + cost.additional;

            return minimum - cost.discount + colliCost + cost.additional;
        case static.combinationWeight:
            if (dimensions.weight > quota)
                return minimum + ((dimensions.weight - quota) * price) - (colli - 1) * colliCost - cost.discount + cost.additional;

            return 0;
        default:
            return 0;
    };
};

Controller.prototype.save = function (data, fromManager) {
    var self = this;

    return co(function* () {
        var sender = yield self.clientSchema.findOne({ "_id": ObjectId(data.sender._id ? data.sender._id : data.sender) }).exec();
        var tariff = yield self.tariffSchema.findOne({ "client": ObjectId(sender._id), "destination": data.destination._id ? data.destination._id : data.destination }).exec();
        var source = yield self.locationSchema.findOne({ "_id": ObjectId(sender.location) }).exec();
        var dest = yield self.locationSchema.findOne({ "_id": ObjectId(data.destination._id ? data.destination._id : data.destination) }).exec();

        data.cost.total = 0;
        var count = 0;

        yield _co.coEach(data.items, function* (item) {
            var auditedItem = null;

            if (!fromManager) 
                auditedItem = yield self.auditComponent(data, item);
            else
                item.audited = false;

            if (auditedItem != null) {
                data.items[count] = auditedItem._doc;
                count++;
                return;
            }

            item.cost.shipping = self.calculateCost(item, tariff, data.sender.quota, data.tariff);
            data.cost.total += item.cost.shipping;
            count++;
        });

        data.cost.total += data.cost.worker;

        if (data.cost.pph === 0.02)
            data.cost.total += (data.cost.total * 0.02);

        else if (data.cost.pph === 0.98)
            data.cost.total /= 0.98;

        data.regions.source = source === null ? data.regions.source : source.region._id;
        data.regions.destination = dest === null ? data.regions.destination : dest.region._id;
        
        var entity = new self.schema(data);
        console.log(entity.items);
        return self.schema.update({ "_id": ObjectId(entity._id) }, entity);
    });
};

Controller.prototype.auditComponent = function (data, item) {
    var self = this;

    return co(function* () {
        var prevShipping = yield schemas.shippings.findOne({ "_id": ObjectId(data._id) }).populate('items.itemType');

        if (!prevShipping)
            return;

        var notes = [];
        var self = this;
        var prevItem = _.find(prevShipping.items, function (prevItem) {
            return prevItem._id.toString() === item._id.toString();
        });

        if (!prevItem)
            return null;

        if ((item.dimensions.length !== prevItem.dimensions.length) && prevItem.dimensions.length > 0) 
            notes.push("Perubahan dimensi panjang dari " + prevItem.dimensions.length + " ke " + item.dimensions.length);

        if ((item.dimensions.width !== prevItem.dimensions.width) && prevItem.dimensions.width > 0) 
            notes.push("Perubahan dimensi lebar dari " + prevItem.dimensions.width + " ke " + item.dimensions.width);
        
        if ((item.dimensions.height !== prevItem.dimensions.height) && prevItem.dimensions.height > 0) 
            notes.push("Perubahan dimensi tinggi dari " + prevItem.dimensions.height + " ke " + item.dimensions.height);

        if ((item.dimensions.weight !== prevItem.dimensions.weight) && prevItem.dimensions.weight > 0) 
            notes.push("Perubahan dimensi berat dari " + prevItem.dimensions.weight + " ke " + item.dimensions.weight);

        if ((item.colli.quantity !== prevItem.colli.quantity) && prevItem.colli.quantity > 0)
            notes.push("Perubahan koli dari " + prevItem.colli.quantity + " ke " + item.colli.quantity);

        if ((item.cost.additional !== prevItem.cost.additional) && prevItem.cost.additional > 0)
            notes.push("Perubahan bea tambahan dari " + prevItem.cost.additional + " ke " + item.cost.additional);

        if ((item.cost.discount !== prevItem.cost.discount) && prevItem.cost.discount > 0)
            notes.push("Perubahan diskon dari " + prevItem.cost.discount + " ke " + item.cost.discount);

        if (item.itemType._id.toString() !== prevItem.itemType._id.toString())
            notes.push("Perubahan jenis barang dari " + prevItem.itemType.name + " ke " + item.itemType.name);

        if (notes.length > 0) {
            item = prevItem;

            var audit = new schemas.audits({
                "type": "price",
                "date": new Date(),
                "notes": notes.join(),
                "data": new schemas.shippings(data),
                "user": data.modified.user
            });

            yield audit.save();
            prevItem.audited = true;
            return prevItem;
        }

        return null;
    });
};

module.exports = new Controller();