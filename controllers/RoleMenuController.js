var co = require('co');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var schemas = require('../models/schemas');

function Controller() { };

Controller.prototype.get = function (id) {
    return schemas.roleMenus.findOne({ "_id": ObjectId(id) }).populate('menu').populate('role').exec();
};

Controller.prototype.getAll = function (query) {
    var parameters = {};

    if (query['menu'])
        parameters['menu'] = ObjectId(query['menu']);

    if (query['role'])
        parameters['role'] = ObjectId(query['role']);

    var entities = schemas.roleMenus.find(parameters).populate('menu').populate('role');

    if (query['limit'] && (query['skip'] || query['skip'] == 0))
        entities.skip(query['skip']).limit(query['limit']);

    return entities.lean().exec();
};

Controller.prototype.save = function (data) {
    var entity = new schemas.roleMenus(data);

    if (!data['_id'])
        return entity.save();

    return schemas.roleMenus.update({ "_id": entity._id }, entity);
};

Controller.prototype.delete = function (id) {
    return co(function* () {
        var entity = schemas.roleMenus.findOne({ "_id": ObjectId(id) });

        if (!entity)
            throw new Error("Entity is not found");

        return entity.remove({ "_id": ObjectId(id) });
    });
};

module.exports = new Controller();