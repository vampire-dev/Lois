var co = require('co');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var schemas = require('../models/schemas');

function Controller() {
    this.schema = schemas.locations;
};

Controller.prototype.get = function (id) {
    return this.schema.findOne({ "_id": ObjectId(id) }).populate('region').lean().exec();
};

Controller.prototype.getAll = function (query, skip, limit) {
    var parameters = {};

    if (query['name'])
        parameters['name'] = new RegExp(query['name'], 'i');

    if (query['region'])
        parameters['region'] = ObjectId(query['region']);

    var entities = this.schema.find(parameters).populate('region');

    if (query['limit'] && (query['skip'] || query['skip'] == 0))
        entities.skip(query['skip']).limit(query['limit']);

    return entities.lean().exec();
};

Controller.prototype.save = function (data) {
    var entity = new this.schema(data);

    if (!data['_id'])
        return entity.save();

    return this.schema.update({ "_id": entity._id }, entity);
};

Controller.prototype.delete = function (id) {
    var self = this;

    return co(function* () {
        var entity = self.schema.findOne({ "_id": id }).exec();

        if (!entity)
            throw new Error("Entity is not found");

        return entity.remove({ "_id": ObjectId(id) });
    });
};

module.exports = new Controller();