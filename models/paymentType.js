var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var objectId = mongoose.Types.ObjectId;

var model = new Schema({
    number: { type: Number, default: null },
    name: { type: String, required: true }
}, { versionKey: false, collection: 'paymentTypes' });

module.exports = mongoose.model('PaymentType', model);