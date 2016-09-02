var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var objectId = mongoose.Types.ObjectId;
var refId = mongoose.Schema.Types.ObjectId;

var model = new Schema({
    number: { type: Number, default: null },
    name: { type: String, default: null },
    address1: { type: String, default: null },
    address2: { type: String, default: null },
    contact: { type: String, default: null },
    quota: { type: Number, default: 0 },
    location: { type: refId, ref: 'Location' }
}, { versionKey: false, collection: 'clients' });

module.exports = mongoose.model('Client', model);