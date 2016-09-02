var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var objectId = mongoose.Types.ObjectId;

var model = new Schema({
    name: { type: String, required: true }
}, { versionKey: false, collection: 'roles' });

module.exports = mongoose.model('Role', model);