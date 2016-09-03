var model = require('../models/roleReport');
var reportModel = require('../models/report');
var roleModel = require('../models/role');
var mongoose = require('mongoose');
var co = require('co');
var objectId = mongoose.Types.ObjectId;

function Controller() { }

Controller.prototype.get = function (id) {
    return model.findOne({ "_id": objectId(id) }).populate('report').populate('role').exec();
};

Controller.prototype.getAll = function (query) {
    var parameters = {};

    if (query['report'])
        parameters['report'] = objectId(query['report']);

    if (query['role'])
        parameters['role'] = objectId(query['role']);

    var entities = model.find(parameters).populate('report').populate('role');

    if (query['limit'] && (query['skip'] || query['skip'] == 0))
        entities.skip(query['skip']).limit(query['limit']);

    return entities.lean().exec();
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