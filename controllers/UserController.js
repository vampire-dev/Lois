var mongoose = require('mongoose');
var schemas = require('../models/schemas');
var crypto = require('crypto');
var co = require('co');
var ObjectId = mongoose.Types.ObjectId;

function Controller() {};

Controller.prototype.get = function (id) {
    return schemas.users.findOne({ "_id": ObjectId(id) }, { "hash": 0, "salt": 0 }).populate('location').populate('role').exec();
};

Controller.prototype.getAll = function (query) {
    var parameters = {};

    if (query['name'])
        parameters['name'] = new RegExp(query['name'], 'i');

    if (query['location'])
        parameters['location'] = ObjectId(query['location']);

    if (query['role'])
        parameters['role'] = ObjectId(query['role']);

    var entities = schemas.users.find(parameters).populate('role location');

    if (query['limit'] && (query['skip'] || query['skip'] == 0))
        entities.skip(query['skip']).limit(query['limit']);

    return entities.lean().exec(); 
};

Controller.prototype.save = function (data) {
    if (data['password']) {
        data['salt'] = crypto.randomBytes(16).toString('base64');
        data['hash'] = crypto.createHmac('sha256', data['salt']).update(data['password']).digest('hex');
    }

    var entity = new schemas.users(data);

    if (!data['_id'])
        return entity.save();

    return schemas.users.update({ _id: ObjectId(entity._id) }, entity);
};

Controller.prototype.delete = function (id) {
    return co(function* () {
        var entity = schemas.users.findOne({ "_id": ObjectId(id) });

        if (!entity)
            throw new Error('Entity is not found');

        return entity.remove({ "_id": ObjectId(id) });
    });
};

Controller.prototype.authenticate = function (userName, password) {
    var self = this;

    return co(function* () {
        var user = yield schemas.users.findOne({ "userName": userName }).populate('role location').exec();
        console.log(user);
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