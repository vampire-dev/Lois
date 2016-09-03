var model = require('../models/tariff');
var clientModel = require('../models/client');
var locationModel = require('../models/location');
var mongoose = require('mongoose');
var co = require('co');
var objectId = mongoose.Types.ObjectId;

function Controller() { }

Controller.prototype.get = function (id) {
    return model.findOne({ "_id": objectId(id) }).populate('client').populate('destination').exec();
};

Controller.prototype.getAll = function (query) {
    if (!query['location'])
        throw new Error('Base location is not found');

    var parameters = {};

    if (query['client'])
        parameters['client'] = objectId(query['client']);

    if (query['destination'])
        parameters['destination'] = objectId(query['destination']);

    var entities = model.find(parameters)
        .populate({ path: 'client', match: { "location": mongoose.Types.ObjectId("57c45abf8e8ddc701960563e") } })
        .populate('destination');

    if (query['limit'] && (query['skip'] || query['skip'] == 0))
        entities.skip(query['skip']).limit(query['limit']);

    return entities.lean().exec();
};

Controller.prototype.getClientTariff = function (client, destination) {
    return model.findOne({ "client": objectId(client), "destination": objectId(destination) }).exec();
};

Controller.prototype.save = function (data) {
    var entity = new model(data);

    if (!data['_id'])
        return entity.save();

    return model.update({ "_id": objectId(entity._id) }, entity);
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