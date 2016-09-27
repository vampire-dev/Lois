var co = require('co');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var schemas = require('../models/schemas');

function Controller() {};

Controller.prototype.get = function (id) {
    return schemas.reports.findOne({ "_id": ObjectId(id) }).exec();
};

Controller.prototype.getAll = function (query) {
    var parameters = {};

    if (query['name'])
        parameters['name'] = new RegExp(query['name'], 'i');

    var entities = schemas.reports.find(parameters);

    if (query['limit'] && (query['skip'] || query['skip'] == 0))
        entities.skip(query['skip']).limit(query['limit']);

    return entities.lean().exec();
};

Controller.prototype.save = function (data) {
    var entity = new schemas.reports(data);

    if (!data['_id'])
        return entity.save();

    return schemas.reports.update({ "_id": entity._id }, entity);
};

Controller.prototype.delete = function (id) {
    return co(function* () {
        var entity = schemas.reports.findOne({ "_id": ObjectId(id) });

        if (!entity)
            throw new Error("Entity is not found");

        return entity.remove({ "_id": ObjectId(id) });
    });
};

module.exports = new Controller();