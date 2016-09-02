var model = require('../models/tariff');
var clientModel = require('../models/client');
var locationModel = require('../models/location');
var mongoose = require('mongoose');
var co = require('co');
var objectId = mongoose.Types.ObjectId;

function Controller() { }

Controller.prototype.get = function (id) {
    return model.findOne({ "_id": objectId(id) }).populate('client').populate('location').exec();
};

Controller.prototype.getAll = function (query) {
    if (!query['location'])
        throw new Error('Base location is not found');

    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = {};

    if (query['client'])
        parameters['client'] = objectId(query['client']);

    if (query['destination'])
        parameters['destination'] = objectId(query['destination']);

    return model.find(parameters)
                .populate({ "path": 'client', "match": { "location": query['location'] } })
                .populate('destination')
                .skip(skip)
                .limit(limit)
                .lean()
                .exec();
};

Controller.prototype.save = function (data) {
    var entity = new model(data);

    if (!data['_id'])
        return entity.save();

    return entity.update({ "_id": objectId(data['_id']), entity });
};

Controller.prototype.delete = function (id) {
    return co(function* () {
        var entity = model.findOne({ "_id": objectId(id) });

        if (!entity)
            throw new Error('Entity is not found');

        return entity.remove({ "_id": objectId(id) });
    });
};

module.exports = new Controller();