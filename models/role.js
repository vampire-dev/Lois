﻿var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var model = new Schema({
    name: { type: String, required: true }
}, { versionKey: false, collection: 'roles' });

module.exports = mongoose.model('Role', model);