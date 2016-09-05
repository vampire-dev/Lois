var co = require('co');
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
    return this.schema.findOne({ "_id": ObjectId(id) }).populate('sender destination payment.type payment.location partner')
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

Controller.prototype.calculateCost = function (item, tariff, quo35ta, option) {
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
    var itemType = item.itemType._id;

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

Controller.prototype.save = function (data) {
    var self = this;

    return co(function* () {

        var sender = yield self.clientSchema.findOne({ "_id": ObjectId(data.sender._id) }).exec();
        var tariff = yield self.tariffSchema.findOne({ "client": ObjectId(sender._id), "destination": data.destination._id }).exec();
        var source = yield self.locationSchema.findOne({ "_id": ObjectId(sender.location) }).exec();

        data.cost.total = 0;

        yield _co.coEach(data.items, function* (item) {
            item.cost.shipping = self.calculateCost(item, tariff, data.sender.quota, data.tariff);
            data.cost.total += item.cost.shipping;
        });

        data.cost.total += data.cost.worker;

        if (data.cost.pph === 0.02)
            data.cost.total += (data.cost.total * 0.02);

        else if (data.cost.pph === 0.98)
            data.cost.total /= 0.98;

        data.regions.source = source === null ? data.regions.source : source.region._id;
        data.regions.destination = data.destination.region._id ? data.destination.region._id : data.regions.destination;

        var entity = new self.schema(data);
        return self.schema.update({ "_id": ObjectId(entity._id) }, entity);
    });
};

module.exports = new Controller();