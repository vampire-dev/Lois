var co = require('co');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var schemas = require('../models/schemas');

function Controller() {};

Controller.prototype.get = function (id) {
    return schemas.tariffs.findOne({ "_id": ObjectId(id) }).populate('client destination').lean().exec();
};

Controller.prototype.getAll = function (query) {
    var parameters = {};

    if (query['client'])
        parameters['client'] = ObjectId(query['client']);

    if (query['destination'])
        parameters['destination'] = Object(query['destination']);

    var entities = schemas.tariffs.find(parameters);

    if (query['limit'] && (query['skip'] || query['skip'] == 0))
        entities.skip(query['skip']).limit(query['limit']);

    return entities.populate('client destination').lean().exec();
};

Controller.prototype.save = function (data) {
    var entity = new schemas.tariffs(data);

    if (!data['_id'])
        return entity.save();

    return schemas.tariffs.update({ "_id": entity._id }, entity);
};

Controller.prototype.delete = function (id) {
    return co(function* () {
        var entity = schemas.tariffs.findOne({ "_id": id }).exec();

        if (!entity)
            throw new Error("Entity is not found");

        return entity.remove({ "_id": ObjectId(id) });
    });
};

module.exports = new Controller();