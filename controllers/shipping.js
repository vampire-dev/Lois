var model = require('../models/shipping');
var itemModel = require('../models/shippingItem');
var defaultComponent = require('../utils/defaultComponent');
var mongoose = require('mongoose');
var co = require('co');
var _ = require('lodash');
var objectId = mongoose.Types.ObjectId;

function Controller() {}

Controller.prototype.get = function (id) {
    return model.findOne({ "_id": objectId(id) }).exec();
};

Controller.prototype.getAll = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = {};
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
    var shippingCost = 0;

    switch (itemType.toString()) {
        case defaultComponent.weight:
            limit = dimensions.weight * price;
            if (limit > minimum)
                shippingCost = (price * dimensions.weight) - cost.discount + colliCost + cost.additional;
            else
                shippingCost = minimum - cost.discount + colliCost + cost.additional;
            break;
        case defaultComponent.volume:
            limit = dimensions.length * dimensions.width * (dimensions.height / 4000) * price * colli;
            if (limit > minimum)
                shippingCost = limit - cost.discount + cost.additional;
            else
                minimum - cost.discount + colliCost + cost.additional;
            break;
        case defaultComponent.colli:

            break;
    }
};

Controller.prototype.save = function (data) {
    
};

Controller.prototype.saveItem = function (data) {
   
};

Controller.prototype.auditComponent = function (prevItem, currItem) {
    
};

module.exports = new Controller();