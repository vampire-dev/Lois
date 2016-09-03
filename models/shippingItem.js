var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var refId = mongoose.Schema.Types.ObjectId;

var model = new Schema({
    shipping: { type: refId, ref: 'Shipping' },
    itemType: { type: refId, ref: 'ItemType' },
    packingType: { type: refId, ref: 'PackingType' },
    content: { type: String, default: null },
    dimensions: {
        length: { type: Number, default: 0 },
        width: { type: Number, default: 0 },
        height: { type: Number, default: 0 },
        weight: { type: Number, default: 0 }
    },
    colli: {
        quantity: { type: Number, default: 0 },
        available: { type: Number, default: 0 },
        delivered: { type: Number, default: 0 }
    },
    cost: {
        colli: { type: Number, default: 0 },
        additional: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        shipping: { type: Number, default: 0 }
    },
    status: { type: String, default: 'Belum Terekap' },
    audited: { type: Boolean, default: false },
    created: {
        date: { type: Number, default: null },
        user: { type: refId, ref: 'User' }
    },
    modified: {
        date: { type: Date, default: null },
        user: { type: refId, ref: 'User' }
    },
}, { versionKey: false, collection: 'shippingItems' });

module.exports = mongoose.model('ShippingItem', model);