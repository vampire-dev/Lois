var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var objectId = mongoose.Types.ObjectId;
var refId = mongoose.Schema.Types.ObjectId;

var model = new Schema({
    number: { type: Number, default: null },
    name: { type: String, required: true },
    prefix: { type: String, default: null },
    region: { type: refId, ref: 'Region' }
}, { versionKey: false, collection: 'locations' });

module.exports = mongoose.model('Location', model);