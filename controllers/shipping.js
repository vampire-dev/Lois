var model = require('../models/shipping');
var date = require('../utils/date');
var defaultComponent = require('../utils/defaultComponent');
var mongoose = require('mongoose');
var co = require('co');
var _ = require('lodash'); 
var _co = require('co-lodash');
var objectId = mongoose.Types.ObjectId;

function Controller() {
    this.tariffController = require('./tariff');
    this.locationController = require('./location');
    this.clientController = require('./client');
}

Controller.prototype.get = function (id) {
    return model.findOne({ "_id": objectId(id) }).populate('sender destination payment.type payment.location partner items.itemType').lean().exec()      
};

Controller.prototype.getAll = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = { "inputLocation": objectId(query['location']) };

    if (query['spbNumber'])
        parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if (query['receiverName'])
        parameters['receiver.name'] = new RegExp(query['receiverName'], 'i');

    if (query['paymentStatus'])
        parameters['payment.status'] = query['paymentStatus'];

    if (query['destination'])
        parameters['destination'] = objectId(query['destination']);

    if (query['sender'])
        parameters['sender'] = objectId(query['sender']);

    if (query['paymentType'])
        parameters['payment.type'] = objectId(query['paymentType']);

    if (query['partner'])
        parameters['partner'] = objectId(query['partner']);

    if (query['from'] && query['to']) 
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    var entities = model.find(parameters);

    if (query['limit'] && (query['skip'] || query['skip'] == 0))
        entities.skip(query['skip']).limit(query['limit']);

    return entities.lean().sort({ "number": -1 }).populate('sender destination payment.type payment.location partner items.itemType items.packingType').lean().exec(); 
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
    var itemType = item.itemType._id;

    switch (itemType.toString()) {
        case defaultComponent.weight:
            limit = dimensions.weight * price;

            if (limit > minimum)
                return (price * dimensions.weight) - cost.discount + colliCost + cost.additional;

            return minimum - cost.discount + colliCost + cost.additional;

        case defaultComponent.volume:
            limit = dimensions.length * dimensions.width * (dimensions.height / 4000) * price * colli;

            if (limit > minimum)
                return limit - cost.discount + cost.additional;

            return minimum - cost.discount + colliCost + cost.additional;
        case defaultComponent.colli:
            return colliCost + cost.additional - cost.discount;
        case defaultComponent.maxOfMultiple:
            return (colli - 1) * colliCost + cost.additional - cost.discount + minimum;
        case defaultComponent.motor:
            return cost.additional - cost.discount;
        case defaultComponent.jakartaMinWeight:
            limit = (dimensions.weight * price) + cost.additional;
            if (limit > minimum)
                return (price * dimensions.weight) - cost.discount + colliCost + cost.additional;

            return minimum - cost.discount + colliCost + cost.additional;
        case defaultComponent.surabayaMinWeight:
            if (dimensions.weight > quota)
                return minimum * ((dimensions.weight - quota) * price) - cost.discount + cost.additional;

            return minimum - cost.discount + colliCost + cost.additional;
        case defaultComponent.combinationWeight:
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
        
        var sender = yield self.clientController.get(data.sender._id);
        var tariff = yield self.tariffController.getClientTariff(sender._id, data.destination._id);   
        var source = yield self.locationController.get(sender.location);

        data.cost.total = 0;

        yield _co.coEach(data.items, function* (item) {
            var audit = self.auditComponent(item);

            if (audit === null) {
                if (item.status === defaultComponent.belumTerekap)
                    item.colli.available = item.colli.quantity;

                item.cost.shipping = self.calculateCost(item, tariff, data.sender.quota, data.tariff);
                data.cost.total += item.cost.shipping;
            }
        });

        data.cost.total += data.cost.worker;

        if (data.cost.pph === 0.02)
            data.cost.total += (data.cost.total * 0.02);

        else if (data.cost.pph === 0.98)
            data.cost.total /= 0.98;

        data.regions.source = source === null ? data.regions.source : source.region._id;
        data.regions.destination = data.destination.region._id ? data.destination.region._id : data.regions.destination;

        var entity = new model(data);
        return model.update({ "_id": objectId(entity._id) }, entity);
    });
};

Controller.prototype.add = function (user) {
    var self = this;

    if (!user.location)
        throw new Error('Location is not found');

    if (!user.location.prefix)
        throw new Error('Prefix is not found for location ' + user.location.name);

    var location = user.location;

    return co(function* () {
        var lastShipping = yield model.findOne({}).sort({ "number": -1 });
        var lastLocShipping = yield model.findOne({ "inputLocation": objectId(location._id) }).sort({ "number": -1 });

        var number = !lastShipping ? 1 : lastShipping.number + 1;

        var spbNumber = !lastLocShipping ? '1-' + location.prefix
            : (parseInt(lastLocShipping.spbNumber.split('-')[0]) + 1) + '-' + location.prefix;

        var shipping = {
            "number": number,
            "spbNumber": spbNumber,
            "sender": defaultComponent.client,
            "destination": defaultComponent.location,
            "regions": { "source": defaultComponent.region, "destination": defaultComponent.region },
            "payment": { "type": defaultComponent.paymentType, "location": defaultComponent.location },
            "partner": defaultComponent.partner,
            "inputLocation": user.location._id,
            "created": { "user": user._id, "date": new Date() },
            "modified": { "user": user._id }
        };

        return new model(shipping).save();
    });
}

Controller.prototype.auditComponent = function(currItem) {
    return null;
};

module.exports = new Controller();