var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var refId = mongoose.Schema.Types.ObjectId;

var model = new Schema({
    name: { type: String, required: true },
    userName: { type: String, required: true },
    hash: { type: String, required: true },
    salt: { type: String, required: true },
    role: { type: refId, ref: 'Role' },
    location: { type: refId, ref: 'Location' }
}, { versionKey: false, collection: 'users' });

module.exports = mongoose.model('User', model);