var mongoose = require('mongoose');
var schemas = require('../models/schemas');
var date = require('../utils/date');
var co = require('co');
var ObjectId = mongoose.Types.ObjectId;

function Controller() {};

Controller.prototype.get = function (id) {
    return schemas.notifications.findOne({ "_id": ObjectId(id) }).exec();
};

Controller.prototype.getAll = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = {};

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    return schemas.notifications.find(parameters).skip(skip).limit(limit).populate('user', { "hash": 0, "salt": 0 }).sort({ "date": -1 }).exec();
};

Controller.prototype.delete = function (id) {
    return co(function* () {
        var model = yield self.get(id);

        if (!model)
            throw new Error('Data is not found');

        return model.remove({ _id: ObjectId(id) });
    });
};

module.exports = new Controller();