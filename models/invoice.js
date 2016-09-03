var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var objectId = mongoose.Schema.Types.ObjectId;

var model = new Schema({
    number: { type: String, required: true },
    date: { type: Date, default: Date.now },
    inc: { type: Number, required: true },
    to: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, default: 'Semua' },
    shippings: [{ type: objectId, ref: 'Shipping' }]
}, { versionKey: false, collection: 'invoices' });

module.exports = mongoose.model('Invoice', model);