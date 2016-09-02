var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var refId = mongoose.Schema.Types.ObjectId;

var model = new Schema({
    number: { type: Number, required: true },
    spbNumber: { type: String, requried: true },

}, { versionKey: false, collection: 'shippings' });

module.exports = mongoose.model('Shipping', model);