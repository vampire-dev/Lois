var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var objectId = mongoose.Types.ObjectId;

var model = new Schema({
    number: { type: Number, default: null },
    name: { type: String, required: true },
    address: { type: String, default: null },
    contact: { type: String, default: null }
}, { versionKey: false, collection: 'partners' });

module.exports = mongoose.model('Partner', model);