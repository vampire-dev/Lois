var co = require('co');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var schemas = require('../models/schemas');

function Controller() {};

Controller.prototype.get = function (id) {
    return schemas.regions.findOne({ "_id": ObjectId(id) }).exec();
};

Controller.prototype.getAll = function (query) {
    var parameters = {};

    if (query['name'])
        parameters['name'] = new RegExp(query['name'], 'i');

    var entities = schemas.regions.find(parameters);

    if (query['limit'] && (query['skip'] || query['skip'] == 0))
        entities.skip(query['skip']).limit(query['limit']);

    return entities.lean().exec();
};

Controller.prototype.save = function (data) {
    var entity = new schemas.regions(data);

    if (!data['_id'])
        return entity.save();

    return schemas.regions.update({ "_id": entity._id }, entity);
};

Controller.prototype.delete = function (id) {
    return co(function* () {
        var entity = schemas.regions.findOne({ "_id": id }).exec();

        if (!entity)
            throw new Error("Entity is not found");

        return entity.remove({ "_id": ObjectId(id) });
    });
};

module.exports = new Controller();