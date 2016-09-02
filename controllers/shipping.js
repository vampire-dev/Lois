var model = require('../models/shipping');
var mongoose = require('mongoose');
var co = require('co');
var objectId = mongoose.Types.ObjectId;

function Controller() { }

Controller.prototype.get = function (id) {
    return model.findOne({ "_id": objectId(id) }).exec();
};

module.exports = new Controller();