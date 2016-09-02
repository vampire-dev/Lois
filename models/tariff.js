var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var objectId = mongoose.Types.ObjectId;
var refId = mongoose.Schema.Types.ObjectId;

var model = new Schema({
    client: { type: refId, ref: 'Client' },
    destination: { type: refId, ref: 'Location' },
    minimum: { type: Number, default: 0.0 },
    prices: [{type: Number, default: 0.0}]
}, { versionKey: false, collection: 'tariffs' });

module.exports = mongoose.model('Tariff', model);