var mongoose = require('mongoose');
var model = require('../models/notification');
var date = require('../utils/date');
var co = require('co');
var objectId = mongoose.Types.ObjectId;

function Controller() { }

Controller.prototype.get = function (id) {
    return model.findOne({ "_id": objectId(id) }).exec();
};

Controller.prototype.getAll = function (query) {
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;
    var parameters = {};

    if (query['from'] && query['to'])
        parameters['date'] = { "$gte": date.createLower(query['from']), "$lte": date.createUpper(query['to']) };

    return model.find(parameters).skip(skip).limit(limit).populate('user', { "hash": 0, "salt": 0 }).sort({ "date": 1 }).exec();
};

Controller.prototype.delete = function (id) {
    var self = this;
    return co(function* () {
        var model = yield self.get(id);

        if (!model)
            throw new Error('Data is not found');

        return model.remove({ _id: objectId(id) });
    });
};

module.exports = new Controller();