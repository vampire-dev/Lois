var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var model = new Schema({
    number: { type: Number, default: null },
    name: { type: String, required: true }
}, { versionKey: false, collection: 'drivers' });

module.exports = mongoose.model('Driver', model);