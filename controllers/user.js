var model = require('../models/user');
var roleModel = require('../models/role');
var locationModel = require('../models/location');
var mongoose = require('mongoose');
var crypto = require('crypto');
var co = require('co');
var objectId = mongoose.Types.ObjectId;

function Controller() { }

Controller.prototype.get = function (id) {
    return model.findOne({ "_id": objectId(id) }, {"hash": 0, "salt": 0}).populate('location').populate('role').exec();
};

Controller.prototype.getAll = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = {};

    if (query['name'])
        parameters['name'] = new RegExp(query['name'], 'i');

    if (query['region'])
        parameters['region'] = objectId(query['region']);

    return model.find(parameters, { "hash": 0, "salt": 0 }).populate('location').populate('role').skip(skip).limit(limit)
        .lean().exec();
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

Controller.prototype.authenticate = function (userName, password) {
    return co(function* () {
        var user = yield model.findOne({ "userName": userName }).populate('role').populate('location').exec();

        if (!user)
            throw new Error('User is not found');

        var hash = user.hash;
        var currentHash = crypto.createHmac('sha256', user.salt).update(password).digest('hex');

        if (hash !== currentHash)
            throw new Error('Password is not found');

        return user;
    });
};

module.exports = new Controller();